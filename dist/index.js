var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { logger } from "better-auth";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { mergeSchema } from "better-auth/db";
import { getAddress } from "viem";
import * as z from "zod";
import { schema } from "./schema.js";
/**
 * Worldcoin Minikit authentication plugin for Better Auth.
 *
 * @example
 * ```ts
 * import { minikit } from "better-auth-minikit";
 *
 * const auth = betterAuth({
 *  plugins: [
 *    minikit({
 *      domain: "example.com",
 *      getNonce: async () => await generateRandomString(32),
 *      verifyMessage: async ({ message, signature, address, chainId }) =>
 *        await verifySIWEMessage(message, signature, address),
 *      ensLookup: async ({ walletAddress }) => await ensLookup(walletAddress),
 *    })],
 * });
 * ```
 */
export const minikit = (options) => ({
    id: "minikit",
    schema: mergeSchema(schema, options === null || options === void 0 ? void 0 : options.schema),
    endpoints: {
        getNonce: createAuthEndpoint("/minikit/nonce", {
            method: "GET",
        }, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
            const nonce = yield options.getNonce();
            return ctx.json({ nonce });
        })),
        signInWithMinikit: createAuthEndpoint("/minikit/signin", {
            method: "POST",
            body: z
                .object({
                message: z.string().min(1),
                signature: z.string().min(1),
                nonce: z.string().min(1),
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
                message: "Email is required when the anonymous plugin option is disabled.",
                path: ["email"],
            }),
            requireRequest: true,
        }, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const { message, signature, nonce, walletAddress: rawWalletAddress, chainId, email, user: userFromClient, } = ctx.body;
            const walletAddress = getAddress(rawWalletAddress);
            const isAnon = (_a = options.anonymous) !== null && _a !== void 0 ? _a : true;
            if (!isAnon && !email) {
                throw new APIError("BAD_REQUEST", {
                    message: "Email is required when anonymous is disabled.",
                    status: 400,
                });
            }
            try {
                // Verify SIWE message with enhanced parameters
                const verified = yield options.verifyMessage({
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
                // Look for existing user by their wallet addresses
                let user = null;
                // Check if there's a wallet address record for this exact address+chainId combination
                const existingWalletAddress = yield ctx.context.adapter.findOne({
                    model: "walletAddress",
                    where: [
                        { field: "address", operator: "eq", value: walletAddress },
                        { field: "chainId", operator: "eq", value: chainId },
                    ],
                });
                if (existingWalletAddress) {
                    // Get the user associated with this wallet address
                    user = yield ctx.context.adapter.findOne({
                        model: "user",
                        where: [
                            {
                                field: "id",
                                operator: "eq",
                                value: existingWalletAddress.userId,
                            },
                        ],
                    });
                }
                else {
                    // No exact match found, check if this address exists on any other chain
                    const anyWalletAddress = yield ctx.context.adapter.findOne({
                        model: "walletAddress",
                        where: [
                            { field: "address", operator: "eq", value: walletAddress },
                        ],
                    });
                    if (anyWalletAddress) {
                        // Same address exists on different chain, get that user
                        user = yield ctx.context.adapter.findOne({
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
                    const domain = (_b = options.emailDomainName) !== null && _b !== void 0 ? _b : new URL(ctx.context.baseURL).hostname;
                    // Use checksummed address for email generation
                    const userEmail = !isAnon && email ? email : `${walletAddress}@${domain}`;
                    const { name, avatar } = (_d = (yield ((_c = options.ensLookup) === null || _c === void 0 ? void 0 : _c.call(options, { walletAddress })))) !== null && _d !== void 0 ? _d : {};
                    user = yield ctx.context.internalAdapter.createUser({
                        name: (_f = (_e = userFromClient.username) !== null && _e !== void 0 ? _e : name) !== null && _f !== void 0 ? _f : walletAddress,
                        email: userEmail,
                        image: (_h = (_g = userFromClient.profilePictureUrl) !== null && _g !== void 0 ? _g : avatar) !== null && _h !== void 0 ? _h : "",
                    });
                    yield Promise.all([
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
                        yield ctx.context.internalAdapter.createAccount({
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
                }
                else {
                    // User exists, but check if this specific address/chain combo exists
                    if (!existingWalletAddress) {
                        // Add this new chainId to existing user's addresses
                        yield ctx.context.adapter.create({
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
                        yield ctx.context.internalAdapter.createAccount({
                            userId: user.id,
                            providerId: "minikit",
                            accountId: `${walletAddress}:${chainId}`,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        });
                    }
                }
                // Create session cookie and set it in the response
                const session = yield ctx.context.internalAdapter.createSession(user.id);
                if (!session) {
                    throw new APIError("INTERNAL_SERVER_ERROR", {
                        status: 500,
                        message: "Minikit Internal Server Error",
                    });
                }
                yield setSessionCookie(ctx, { session, user }, false, {
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
            }
            catch (error) {
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
        })),
    },
});
//# sourceMappingURL=index.js.map