import type { BetterAuthDBSchema } from "better-auth/db";

export const schema = {
	user: {
		modelName: "user",
		fields: {
			minikitAddress: {
				type: "string",
				required: true,
				unique: true,
			},
		},
	},
	account: {
		modelName: "account",
		fields: {
			minikitAddress: {
				type: "string",
				required: true,
				unique: true,
			},
		},
	},
	walletAddress: {
		modelName: "walletAddress",
		fields: {
			userId: {
				type: "string",
				references: {
					model: "user",
					field: "id",
				},
				required: true,
			},
			address: {
				type: "string",
				required: true,
			},
			chainId: {
				type: "number",
				required: true,
			},
			isPrimary: {
				type: "boolean",
				defaultValue: false,
			},
			createdAt: {
				type: "date",
				required: true,
			},
		},
	},
} satisfies BetterAuthDBSchema;
