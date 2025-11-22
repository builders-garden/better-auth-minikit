export declare const schema: {
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
//# sourceMappingURL=schema.d.ts.map