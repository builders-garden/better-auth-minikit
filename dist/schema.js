export const schema = {
    user: {
        modelName: "user",
        fields: {
            worldcoinAddress: {
                type: "string",
                required: false,
                unique: true,
            },
            isWorldcoinVerified: {
                type: "boolean",
                required: false,
                defaultValue: false,
            },
        },
    },
    account: {
        modelName: "account",
        fields: {
            worldcoinAddress: {
                type: "string",
                required: false,
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
};
//# sourceMappingURL=schema.js.map