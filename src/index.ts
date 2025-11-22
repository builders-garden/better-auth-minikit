import type { BetterAuthPlugin, User } from "better-auth";
import { logger } from "better-auth";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { mergeSchema } from "better-auth/db";
import { getAddress } from "viem";
import * as z from "zod";
import { schema } from "./schema.js";
import type { MinikitPluginOptions, WalletAddress } from "./types.js";

export const minikit = (options: MinikitPluginOptions) =>
	({
		id: "minikit",
		schema: mergeSchema(schema, options?.schema),
		endpoints: {
			getNonce: createAuthEndpoint(
				"/minikit/nonce",
				{
					method: "POST",
					body: z.object({
						walletAddress: z
							.string()
							.regex(/^0[xX][a-fA-F0-9]{40}$/i)
							.length(42),
						chainId: z
							.number()
							.int()
							.positive()
							.max(2147483647)
							.optional()
							.default(1), // Default to Ethereum mainnet
					}),
				},
				async (ctx) => {
					const { walletAddress: rawWalletAddress, chainId } = ctx.body;
					const walletAddress = getAddress(rawWalletAddress);
					const nonce = await options.getNonce();

					// Store nonce with wallet address and chain ID context
					await ctx.context.internalAdapter.createVerificationValue({
						identifier: `minikit:${walletAddress}:${chainId}`,
						value: nonce,
						expiresAt: new Date(Date.now() + 15 * 60 * 1000),
					});

					return ctx.json({ nonce });
				},
			),
			signInWithMinikit: createAuthEndpoint(
				"/minikit/signin",
				{
					method: "POST",
					body: z
						.object({
							message: z.string().min(1),
							signature: z.string().min(1),
							walletAddress: z
								.string()
								.regex(/^0[xX][a-fA-F0-9]{40}$/i)
								.length(42),
							chainId: z
								.number()
								.int()
								.positive()
								.max(2147483647)
								.optional()
								.default(1),
							email: z.email().optional(),
							user: z.object({
								username: z.string().optional(),
								profilePictureUrl: z.string().optional(),
							}),
						})
						.refine((data) => options.anonymous !== false || !!data.email, {
							message:
								"Email is required when the anonymous plugin option is disabled.",
							path: ["email"],
						}),
					requireRequest: true,
				},
				async (ctx) => {
					const {
						message,
						signature,
						walletAddress: rawWalletAddress,
						chainId,
						email,
						user: userFromClient,
					} = ctx.body;
					const walletAddress = getAddress(rawWalletAddress);
					const isAnon = options.anonymous ?? true;

					if (!isAnon && !email) {
						throw new APIError("BAD_REQUEST", {
							message: "Email is required when anonymous is disabled.",
							status: 400,
						});
					}

					try {
						// Find stored nonce with wallet address and chain ID context
						const verification =
							await ctx.context.internalAdapter.findVerificationValue(
								`minikit:${walletAddress}:${chainId}`,
							);

						// Ensure nonce is valid and not expired
						if (!verification || new Date() > verification.expiresAt) {
							throw new APIError("UNAUTHORIZED", {
								message: "Unauthorized: Invalid or expired nonce",
								status: 401,
								code: "UNAUTHORIZED_INVALID_OR_EXPIRED_NONCE",
							});
						}

						// Verify SIWE message with enhanced parameters
						const { value: nonce } = verification;
						const verified = await options.verifyMessage({
							message,
							signature,
							address: walletAddress,
							chainId,
							cacao: {
								h: { t: "caip122" },
								p: {
									domain: options.domain,
									aud: options.domain,
									nonce,
									iss: options.domain,
									version: "1",
								},
								s: { t: "eip191", s: signature },
							},
						});

						if (!verified) {
							throw new APIError("UNAUTHORIZED", {
								message: "Unauthorized: Invalid SIWE signature",
								status: 401,
							});
						}

						// Clean up used nonce
						await ctx.context.internalAdapter.deleteVerificationValue(
							verification.id,
						);

						// Look for existing user by their wallet addresses
						let user: User | null = null;

						// Check if there's a wallet address record for this exact address+chainId combination
						const existingWalletAddress: WalletAddress | null =
							await ctx.context.adapter.findOne({
								model: "walletAddress",
								where: [
									{ field: "address", operator: "eq", value: walletAddress },
									{ field: "chainId", operator: "eq", value: chainId },
								],
							});

						if (existingWalletAddress) {
							// Get the user associated with this wallet address
							user = await ctx.context.adapter.findOne({
								model: "user",
								where: [
									{
										field: "id",
										operator: "eq",
										value: existingWalletAddress.userId,
									},
								],
							});
						} else {
							// No exact match found, check if this address exists on any other chain
							const anyWalletAddress: WalletAddress | null =
								await ctx.context.adapter.findOne({
									model: "walletAddress",
									where: [
										{ field: "address", operator: "eq", value: walletAddress },
									],
								});

							if (anyWalletAddress) {
								// Same address exists on different chain, get that user
								user = await ctx.context.adapter.findOne({
									model: "user",
									where: [
										{
											field: "id",
											operator: "eq",
											value: anyWalletAddress.userId,
										},
									],
								});
							}
						}

						// Create new user if none exists
						if (!user) {
							const domain =
								options.emailDomainName ??
								new URL(ctx.context.baseURL).hostname;
							// Use checksummed address for email generation
							const userEmail =
								!isAnon && email ? email : `${walletAddress}@${domain}`;
							const { name, avatar } =
								(await options.ensLookup?.({ walletAddress })) ?? {};

							user = await ctx.context.internalAdapter.createUser({
								name: userFromClient.username ?? name ?? walletAddress,
								email: userEmail,
								image: userFromClient.profilePictureUrl ?? avatar ?? "",
							});

							await Promise.all([
								// Create wallet address record
								ctx.context.adapter.create({
									model: "walletAddress",
									data: {
										userId: user.id,
										address: walletAddress,
										chainId,
										isPrimary: true, // First address is primary
										createdAt: new Date(),
									},
								}),
								// Create account record for wallet authentication
								await ctx.context.internalAdapter.createAccount({
									userId: user.id,
									providerId: "minikit",
									accountId: `${walletAddress}:${chainId}`,
									createdAt: new Date(),
									updatedAt: new Date(),
								}),
								// update user with Minikit account details
								ctx.context.adapter.update({
									model: "user",
									where: [{ field: "id", value: user.id }],
									update: {
										minikitAddress: walletAddress,
										updatedAt: new Date(),
									},
								}),
							]);
						} else {
							// User exists, but check if this specific address/chain combo exists
							if (!existingWalletAddress) {
								// Add this new chainId to existing user's addresses
								await ctx.context.adapter.create({
									model: "walletAddress",
									data: {
										userId: user.id,
										address: walletAddress,
										chainId,
										isPrimary: false, // Additional addresses are not primary by default
										createdAt: new Date(),
									},
								});

								// Create account record for this new wallet+chain combination
								await ctx.context.internalAdapter.createAccount({
									userId: user.id,
									providerId: "minikit",
									accountId: `${walletAddress}:${chainId}`,
									createdAt: new Date(),
									updatedAt: new Date(),
								});
							}
						}

						// Create session cookie and set it in the response
						const session = await ctx.context.internalAdapter.createSession(
							user.id,
							ctx,
						);

						if (!session) {
							throw new APIError("INTERNAL_SERVER_ERROR", {
								status: 500,
								message: "Minikit Internal Server Error",
							});
						}

						await setSessionCookie(ctx, { session, user }, false, {
							secure: true,
							sameSite: "none", // MiniApps requires this
							httpOnly: true,
							path: "/",
						});

						return ctx.json({
							token: session.token,
							success: true,
							user,
						});
					} catch (error: unknown) {
						logger.error("Minikit error happened", error);
						if (error instanceof APIError) {
							throw error;
						}
						throw new APIError("UNAUTHORIZED", {
							status: 401,
							message: "Minikit Something went wrong. Please try again later.",
							error: error instanceof Error ? error.message : "Unknown error",
						});
					}
				},
			),
		},
	}) satisfies BetterAuthPlugin;
