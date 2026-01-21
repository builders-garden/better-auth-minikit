export declare const schema: {
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
//# sourceMappingURL=schema.d.ts.map