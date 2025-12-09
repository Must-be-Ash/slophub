# x402 Payment Protocol

export const Tags = ({tags, className}) => {
  if (!tags || !Array.isArray(tags)) {
    return null;
  }
  return <div className={`mt-6 mb-8 flex flex-row flex-wrap gap-2 ${className}`}>
      {tags.map((tag, index) => <span key={index} className="text-sm text-[#733E00] dark:text-yellow-500 bg-[#FFFCF1] dark:bg-yellow-500/10 font-semibold px-2 py-1 rounded-lg">{tag}</span>)}
    </div>;
};

<Tags tags={["EVM", "Solana"]} />

## Overview

```tsx  theme={null}
import { useX402 } from "@coinbase/cdp-hooks";

const { fetchWithPayment } = useX402();

await fetchWithPayment("https://api.example.com/paid-endpoint", {
  method: "GET",
});
```

The x402 payment protocol enables instant, automatic stablecoin payments directly over HTTP. With the `useX402` hook from `@coinbase/cdp-hooks`, you can integrate x402 payments into your embedded wallet application, allowing users to seamlessly pay for API access and services with their embedded wallets.

This guide demonstrates how to use the `useX402` hook to enable your users to make micropayments for paid APIs and services without complex payment flows or intermediaries.

<Tip>
  For a comprehensive overview of the x402 protocol, see the [x402 documentation](/x402/welcome).
</Tip>

## How it works

When your application makes a request to an x402-protected resource:

1. The server responds with `402 Payment Required` status including payment details
2. The `useX402` hook automatically:
   * Extracts the payment information from the response
   * Creates and signs a payment transaction using the user's embedded wallet
   * Includes the payment proof in a retry request
3. The server validates the payment and returns the requested resource

All of this happens seamlessly in the background—your users simply need to be authenticated with an embedded wallet.

## Prerequisites

Before integrating x402 payments, ensure you have:

1. Completed the [Embedded Wallets Quickstart](/embedded-wallets/quickstart)
2. Installed the required packages:

<CodeGroup>
  ```bash npm theme={null}
  npm install @coinbase/cdp-core @coinbase/cdp-hooks x402-fetch
  ```

  ```bash pnpm theme={null}
  pnpm add @coinbase/cdp-core @coinbase/cdp-hooks x402-fetch
  ```

  ```bash yarn theme={null}
  yarn add @coinbase/cdp-core @coinbase/cdp-hooks x402-fetch
  ```
</CodeGroup>

<Note>
  The `x402-fetch` package must be installed separately as it provides the underlying payment protocol implementation.
</Note>

## Usage

The `useX402` hook provides a `fetchWithPayment` function that works like the standard `fetch` API but automatically handles x402 payment flows:

```tsx  theme={null}
import { useX402 } from "@coinbase/cdp-hooks";

const { fetchWithPayment } = useX402();

await fetchWithPayment("https://api.example.com/paid-endpoint", {
  method: "GET",
});
```

For a full API reference of the `useX402` hook, see [here](/sdks/cdp-sdks-v2/frontend/@coinbase/cdp-hooks/Functions/useX402).

## Compatibility

### Accounts

The `useX402` hook works with Smart Accounts, EOAs and Solana accounts.

### Frameworks

The `useX402` hook works in React and React Native. If you need support in other frameworks or vanilla JavaScript, you can use the `fetchWithX402` action from `@coinbase/cdp-core`:

```tsx  theme={null}
import { fetchWithX402 } from "@coinbase/cdp-core";

const wrappedFetch = fetchWithX402();

const response = await wrappedFetch("https://api.example.com/paid-endpoint", {
  method: "GET",
});
```

* **[x402 Protocol Overview](/x402/welcome)**: Learn more about the x402 payment protocol
* **[x402 Quickstart for Buyers](/x402/quickstart-for-buyers)**: Comprehensive guide for consuming x402 APIs
* **[x402 Bazaar](/x402/bazaar)**: Discover x402-compatible APIs and services
* **[Smart Accounts](/embedded-wallets/evm-features/smart-accounts)**: Enable gas-free payments with Smart Accounts
* **[React Hooks Reference](/embedded-wallets/react-hooks)**: Explore all available CDP hooks


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.cdp.coinbase.com/llms.txt