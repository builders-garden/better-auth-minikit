# Better Auth – Worldcoin Minikit (SIWE)

Authenticate users via Worldcoin Minikit using Better Auth. This plugin provides a Sign-In With Ethereum (SIWE) flow adapted for Worldcoin Minikit applications.

## Features

- **SIWE Flow**: Full Sign-In With Ethereum implementation adapted for Minikit.
- **Multi-chain Support**: Associates wallet addresses with specific Chain IDs.
- **Account Linking**: Automatically links multiple wallet addresses to the same user if verified.
- **MiniApp Compatible**: Sets secure, partitioned session cookies (`SameSite: "none"`).

## Installation

```bash
npm i better-auth-minikit
```

## Server Setup

Add the `minikit` plugin to your Better Auth configuration. You need to provide implementations for nonce generation and message verification.

```ts
import { betterAuth } from "better-auth";
import { minikit } from "better-auth-minikit";
import { generateRandomString } from "better-auth/crypto";
import { parseSiweMessage, validateSiweMessage } from "viem/siwe"; // Example using viem

export const auth = betterAuth({
  plugins: [
    minikit({
      // 1. Domain expected in the SIWE message
      domain: "app.example.com",

      // 2. Nonce generation function
      getNonce: async () => {
        return generateRandomString(32);
      },

      // 3. Message verification function
      verifyMessage: async ({ message, signature, address, chainId }) => {
        try {
            const valid = await validateSiweMessage({
                message,
                signature,
                domain: "app.example.com",
                nonce: (await parseSiweMessage(message)).nonce,
            });
            return valid;
        } catch (e) {
            return false;
        }
      },

      // (Optional) Custom email domain for generated user emails
      // emailDomainName: "minikit-user.com",
      
      // (Optional) Allow anonymous users (default: true)
      // anonymous: true,
    })
  ]
});
```

## Client Setup

Add the client plugin to your Better Auth client instance.

```ts
import { createAuthClient } from "better-auth/react";
import { minikitClient } from "better-auth-minikit/client";

const client = createAuthClient({
  plugins: [minikitClient()],
  fetchOptions: {
    credentials: "include", // Required for session cookies in MiniApps
  },
});

export const authClient = client;
```

## Usage

The authentication flow consists of three steps: getting a nonce, signing the message, and verifying the signature.

### 1. Get Nonce

Request a nonce from the server for the user's wallet address.

```ts
const walletAddress = "0x..."; // User's wallet address
const chainId = 1; // Current chain ID

const { data, error } = await authClient.minikit.getNonce({
  walletAddress,
  chainId
});

const nonce = data.nonce;
```

### 2. Sign Message (Client Side)

Use the Worldcoin Minikit SDK (or any wallet provider) to sign the SIWE message.

```ts
import { MiniKit } from '@worldcoin/minikit-js';

// Construct SIWE message (example)
const message = createSiweMessage({
    domain: window.location.host,
    address: walletAddress,
    statement: "Sign in to My App",
    uri: window.location.origin,
    version: "1",
    chainId: chainId,
    nonce: nonce,
});

// Request signature from Minikit
const { commandPayload: signature } = await MiniKit.commands.signMessage({
    message: message
});
```

### 3. Verify and Sign In

Send the signature and message to the server to complete the sign-in.

```ts
const { data, error } = await authClient.minikit.signInWithMinikit({
  message,
  signature,
  walletAddress,
  chainId,
  user: {
      username: "user-handle", // Optional
      profilePictureUrl: "https://..." // Optional
  }
});

if (data?.success) {
  console.log("Signed in user:", data.user);
}
```

## Database Schema

This plugin adds a `walletAddress` table and extends the `user` and `account` tables.

### `walletAddress`

| Field     | Type    | Notes |
|-----------|---------|-------|
| id        | string  | Primary Key |
| userId    | string  | Foreign Key to User |
| address   | string  | Wallet Address |
| chainId   | number  | Chain ID |
| isPrimary | boolean | Whether this is the primary wallet |
| createdAt | date    | Creation timestamp |

### User & Account Extensions

- **User**: Adds `minikitAddress` (string, unique)
- **Account**: Adds `minikitAddress` (string, unique)

## Migration

Run the migration command to update your database schema:

```bash
npx @better-auth/cli migrate
```
