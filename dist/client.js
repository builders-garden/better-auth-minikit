var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Client plugin for SIWE using Worldcoin Minikit
 */
export const minikitClient = () => {
    return {
        id: "minikit",
        $InferServerPlugin: {},
        getActions: ($fetch) => ({
            /**
             * Get nonce for Minikit (SIWE)
             * @param authData - MinikitGetNonce
             * @returns BetterFetchResponse<string>
             * @throws APIError if the nonce fails
             */
            getNonce: (authData) => __awaiter(void 0, void 0, void 0, function* () {
                return yield $fetch("/minikit/nonce", {
                    method: "POST",
                    body: authData,
                });
            }),
            /**
             * Sign in with Worldcoin Minikit
             * @param authData - Authenticated data from the Worldcoin Minikit MiniApp SDK
             * @returns BetterFetchResponse<MinikitSignInResponse>
             * @throws APIError if the sign in fails
             */
            signInWithMinikit: (authData) => __awaiter(void 0, void 0, void 0, function* () {
                return yield $fetch("/minikit/signin", {
                    method: "POST",
                    body: authData,
                });
            }),
        }),
    };
};
export default minikitClient;
//# sourceMappingURL=client.js.map