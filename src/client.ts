import type { BetterFetchResponse } from "@better-fetch/fetch";
import type { BetterAuthClientPlugin } from "better-auth";
import type { minikit } from "./index.js";
import type {
    MinikitGetNonceArgs,
    MinikitGetNonceResponse,
    MinikitSignInAuthData,
    MinikitSignInResponse,
} from "./types.js";

type MinikitPlugin = typeof minikit;

/**
 * Client plugin for SIWE using Worldcoin Minikit
 */
export const minikitClient = () => {
	return {
		id: "minikit",
		$InferServerPlugin: {} as ReturnType<MinikitPlugin>,
		getActions: ($fetch) => ({
			/**
			 * Get nonce for Minikit (SIWE)
			 * @param authData - MinikitGetNonce
			 * @returns BetterFetchResponse<string>
			 * @throws APIError if the nonce fails
			 */
			getNonce: async (authData: MinikitGetNonceArgs): Promise<
				BetterFetchResponse<MinikitGetNonceResponse>
			> => {
				return await $fetch<MinikitGetNonceResponse>("/minikit/nonce", {
					method: "POST",
					body: authData,
				});
			},
			/**
			 * Sign in with Worldcoin Minikit
			 * @param authData - Authenticated data from the Worldcoin Minikit MiniApp SDK
			 * @returns BetterFetchResponse<MinikitSignInResponse>
			 * @throws APIError if the sign in fails
			 */
			signInWithMinikit: async (
				authData: MinikitSignInAuthData,
			): Promise<BetterFetchResponse<MinikitSignInResponse>> => {
				return await $fetch<MinikitSignInResponse>("/minikit/signin", {
					method: "POST",
					body: authData,
				});
			},
		}),
	} satisfies BetterAuthClientPlugin;
};

export default minikitClient;
