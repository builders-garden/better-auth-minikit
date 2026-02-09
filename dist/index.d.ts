import * as z from "zod";
import type { MinikitPluginOptions } from "./types.js";
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
export declare const minikit: (options: MinikitPluginOptions) => {
    id: "minikit";
    schema: {
        user: {
            modelName: string;
            fields: {
                worldcoinAddress: {
                    type: "string";
                    required: false;
                    unique: true;
                };
                isWorldcoinVerified: {
                    type: "boolean";
                    required: false;
                    defaultValue: false;
                };
            };
        };
        account: {
            modelName: string;
            fields: {
                worldcoinAddress: {
                    type: "string";
                    required: false;
                    unique: true;
                };
            };
        };
        walletAddress: {
            modelName: string;
            fields: {
                userId: {
                    type: "string";
                    references: {
                        model: string;
                        field: string;
                    };
                    required: true;
                };
                address: {
                    type: "string";
                    required: true;
                };
                chainId: {
                    type: "string";
                    required: true;
                };
                isPrimary: {
                    type: "boolean";
                    defaultValue: false;
                };
                createdAt: {
                    type: "date";
                    required: true;
                };
            };
        };
    };
    endpoints: {
        getNonce: import("better-auth").StrictEndpoint<"/minikit/nonce", {
            method: "GET";
        }, {
            nonce: string;
        }>;
        signInWithMinikit: import("better-auth").StrictEndpoint<"/minikit/signin", {
            method: "POST";
            body: z.ZodObject<{
                message: z.ZodString;
                signature: z.ZodString;
                nonce: z.ZodString;
                walletAddress: z.ZodString;
                chainId: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                email: z.ZodOptional<z.ZodEmail>;
                user: z.ZodObject<{
                    username: z.ZodOptional<z.ZodString>;
                    profilePictureUrl: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>;
            }, z.core.$strip>;
            requireRequest: true;
        }, {
            token: string;
            success: boolean;
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                emailVerified: boolean;
                name: string;
                image?: string | null | undefined;
            };
        }>;
    };
};
//# sourceMappingURL=index.d.ts.map