import type { schema } from "./schema.js";

/**
 * Minikit Plugin Type Definitions
 */

import type { Account, InferOptionSchema, User } from "better-auth";

export interface MinikitPluginOptions {
	domain: string;
	emailDomainName?: string | undefined;
	anonymous?: boolean | undefined;
	getNonce: () => Promise<string>;
	verifyMessage: (args: SIWEVerifyMessageArgs) => Promise<boolean>;
	isUserVerified: (walletAddress: string, rpcUrl?: string) => Promise<boolean>;
	ensLookup?: ((args: ENSLookupArgs) => Promise<ENSLookupResult>) | undefined;
	/**
	 * The schema to use for the Minikit plugin
	 * {@link better-auth-minikit#schema | Minikit schema}
	 */
	schema?: InferOptionSchema<typeof schema> | undefined;
}

/**
 * Minikit Get Nonce Arguments
 */
export interface MinikitGetNonceArgs {
	uuid: string;
	chainId: number;
}

export interface MinikitGetNonceResponse {
	nonce: string;
}

/**
 * Minikit Sign In Authentication Data
 */
export interface SIWEVerifyMessageArgs {
	message: string;
	signature: string;
	address: string;
	chainId: number;
	cacao?: Cacao | undefined;
}
export interface MinikitSignInAuthData {
	message: string;
	signature: string;
	uuid: string;
	walletAddress: string;
	chainId: number;
	user: {
		username?: string;
		profilePictureUrl?: string;
	};
	email?: string;
}
export interface MinikitSignInResponse {
	data: {
		success: boolean;
		token: string;
		user: User;
	};
}

export interface ENSLookupArgs {
	walletAddress: string;
}

export interface ENSLookupResult {
	name: string;
	avatar: string;
}

/**
 * Minikit Client Type, returned by the Minikit client plugin
 */
export type MinikitClientType = {
	minikit: {
		getMinikitNonce: (args: MinikitGetNonceArgs) => Promise<MinikitGetNonceResponse>;
		signInWithMinikit: (
			args: MinikitSignInAuthData,
		) => Promise<MinikitSignInResponse>;
	};
};

/**
 * Minikit Extra fields used in User and Account models
 */
export type MinikitExtraFields = {
	worldcoinAddress: string;
	isWorldcoinVerified: boolean;
};

/**
 * Minikit User Type, returned by the Minikit user model
 * @see {@link better-auth-minikit#schema | Minikit schema}
 */
export type MinikitUser = User & MinikitExtraFields;

/**
 * Minikit Account Type, returned by the Minikit account model
 * @see {@link better-auth-minikit#schema | Minikit schema}
 */
export type MinikitAccount = Account &
	Omit<MinikitExtraFields, "isWorldcoinVerified">;

export interface WalletAddress {
	id: string;
	userId: string;
	address: string;
	chainId: string;
	isPrimary: boolean;
	createdAt: Date;
}

/**
 * Minikit Wallet Address Type, returned by the Minikit wallet address model
 * @see {@link better-auth-minikit#schema | Minikit schema}
 */
export type MinikitWalletAddress = WalletAddress & MinikitExtraFields;

interface CacaoHeader {
	t: "caip122";
}

// Signed Cacao (CAIP-74)
interface CacaoPayload {
	domain: string;
	aud: string;
	nonce: string;
	iss: string;
	version?: string | undefined;
	iat?: string | undefined;
	nbf?: string | undefined;
	exp?: string | undefined;
	statement?: string | undefined;
	requestId?: string | undefined;
	resources?: string[] | undefined;
	type?: string | undefined;
}

interface Cacao {
	h: CacaoHeader;
	p: CacaoPayload;
	s: {
		t: "eip191" | "eip1271";
		s: string;
		m?: string | undefined;
	};
}
