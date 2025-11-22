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
                minikitAddress: {
                    type: "string";
                    required: true;
                    unique: true;
                };
            };
        };
        account: {
            modelName: string;
            fields: {
                minikitAddress: {
                    type: "string";
                    required: true;
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
                    type: "number";
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
        getNonce: {
            <AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(inputCtx_0: {
                body: {
                    walletAddress: string;
                    chainId?: number | undefined;
                };
            } & {
                method?: "POST" | undefined;
            } & {
                query?: Record<string, any> | undefined;
            } & {
                params?: Record<string, any>;
            } & {
                request?: Request;
            } & {
                headers?: HeadersInit;
            } & {
                asResponse?: boolean;
                returnHeaders?: boolean;
                use?: import("better-auth").Middleware[];
                path?: string;
            } & {
                asResponse?: AsResponse | undefined;
                returnHeaders?: ReturnHeaders | undefined;
            }): Promise<[AsResponse] extends [true] ? Response : [ReturnHeaders] extends [true] ? {
                headers: Headers;
                response: {
                    nonce: string;
                };
            } : {
                nonce: string;
            }>;
            options: {
                method: "POST";
                body: z.ZodObject<{
                    walletAddress: z.ZodString;
                    chainId: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                }, z.core.$strip>;
            } & {
                use: any[];
            };
            path: "/minikit/nonce";
        };
        signInWithMinikit: {
            <AsResponse extends boolean = false, ReturnHeaders extends boolean = false>(inputCtx_0: {
                body: {
                    message: string;
                    signature: string;
                    walletAddress: string;
                    user: {
                        username?: string | undefined;
                        profilePictureUrl?: string | undefined;
                    };
                    chainId?: number | undefined;
                    email?: string | undefined;
                };
            } & {
                method?: "POST" | undefined;
            } & {
                query?: Record<string, any> | undefined;
            } & {
                params?: Record<string, any>;
            } & {
                request: Request;
            } & {
                headers?: HeadersInit;
            } & {
                asResponse?: boolean;
                returnHeaders?: boolean;
                use?: import("better-auth").Middleware[];
                path?: string;
            } & {
                asResponse?: AsResponse | undefined;
                returnHeaders?: ReturnHeaders | undefined;
            }): Promise<[AsResponse] extends [true] ? Response : [ReturnHeaders] extends [true] ? {
                headers: Headers;
                response: {
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
                };
            } : {
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
            options: {
                method: "POST";
                body: z.ZodObject<{
                    message: z.ZodString;
                    signature: z.ZodString;
                    walletAddress: z.ZodString;
                    chainId: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
                    email: z.ZodOptional<z.ZodEmail>;
                    user: z.ZodObject<{
                        username: z.ZodOptional<z.ZodString>;
                        profilePictureUrl: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>;
                }, z.core.$strip>;
                requireRequest: true;
            } & {
                use: any[];
            };
            path: "/minikit/signin";
        };
    };
};
//# sourceMappingURL=index.d.ts.map