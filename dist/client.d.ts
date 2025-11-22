import type { BetterFetchResponse } from "@better-fetch/fetch";
import type { minikit } from "./index.js";
import type { MinikitGetNonceResponse, MinikitSignInAuthData, MinikitSignInResponse } from "./types.js";
type MinikitPlugin = typeof minikit;
/**
 * Client plugin for SIWE using Worldcoin Minikit
 */
export declare const minikitClient: () => {
    id: "minikit";
    $InferServerPlugin: ReturnType<MinikitPlugin>;
    getActions: ($fetch: import("@better-fetch/fetch").BetterFetch) => {
        /**
         * Get nonce for Minikit (SIWE)
         * @param authData - MinikitGetNonce
         * @returns BetterFetchResponse<string>
         * @throws APIError if the nonce fails
         */
        getNonce: () => Promise<BetterFetchResponse<MinikitGetNonceResponse>>;
        /**
         * Sign in with Worldcoin Minikit
         * @param authData - Authenticated data from the Worldcoin Minikit MiniApp SDK
         * @returns BetterFetchResponse<MinikitSignInResponse>
         * @throws APIError if the sign in fails
         */
        signInWithMinikit: (authData: MinikitSignInAuthData) => Promise<BetterFetchResponse<MinikitSignInResponse>>;
    };
};
export default minikitClient;
//# sourceMappingURL=client.d.ts.map