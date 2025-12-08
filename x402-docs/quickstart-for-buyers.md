# Quickstart for Buyers

<Info>
  This is the official CDP documentation. Community-maintained documentation can be found at [x402.gitbook.io/x402](https://x402.gitbook.io/x402).

  Need more help? Join the [x402 Discord](https://discord.gg/cdp) for the latest updates.
</Info>

This guide walks you through how to use **x402** to interact with services that require payment. By the end of this guide, you will be able to programmatically discover payment requirements, complete a payment, and access a paid resource.

The x402 helper packages for various languages greatly simplify your integration with x402. You'll be able to automatically detect payment challenges, authorize payments onchain, and retry requests — all with minimal code. The packages will automatically trigger the following flow:

1. Makes the initial request (if using Fetch) or intercepts the initial request (if using Axios/HTTPX/Requests)
2. If a 402 response is received, parses the payment requirements
3. Verifies the payment amount is within the allowed maximum
4. Creates a payment header using the provided wallet client
5. Retries the request with the payment header

## Prerequisites

Before you begin, ensure you have:

* A crypto wallet with USDC (any EVM-compatible wallet, e.g., [CDP Wallet](/server-wallets/v1/concepts/wallets), [AgentKit](/agent-kit/welcome))
* [Node.js](https://nodejs.org/en) and npm, or Python and pip
* A service that requires payment via x402

<Info>
  We have pre-configured [examples available in our repo](https://github.com/coinbase/x402/tree/main/examples), including examples for fetch, Axios, and MCP.
</Info>

## 1. Install Dependencies

<Tabs>
  <Tab title="Node.js">
    Install [x402-axios](https://www.npmjs.com/package/x402-axios) or [x402-fetch](https://www.npmjs.com/package/x402-fetch):

    ```bash lines wrap theme={null}
    npm install x402-axios
    # or
    npm install x402-fetch
    ```
  </Tab>

  <Tab title="Python">
    Install the [x402 package](https://pypi.org/project/x402/):

    ```bash lines wrap theme={null}
    pip install x402
    ```
  </Tab>
</Tabs>

## 2. Create a Wallet Client

Create a wallet client using CDP's [Server Wallet](/server-wallets/v1/concepts/wallets) (recommended) or a standalone wallet library ([viem](https://viem.sh/) for EVM on Node.js, [eth-account](https://github.com/ethereum/eth-account) for EVM on Python, or [SolanaKit](https://www.solanakit.com/) for Solana support).

<Tip>
  **Building with Embedded Wallets?** If you're building a user-facing application with embedded wallets, check out the [X402 with Embedded Wallets](/embedded-wallets/x402-payments) guide which shows how to use the `useX402` hook for seamless payment integration.
</Tip>

### CDP Server Wallet (Recommended)

First, create an account at [cdp.coinbase.com](https://cdp.coinbase.com/) and get the following API keys from the portal to store as environment variables:

```bash  theme={null}
# store in .env or using the command `export <name>="secret-info"`
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret
CDP_WALLET_SECRET=your-wallet-secret
```

Then, install the required packages:

<CodeGroup>
  ```bash Node.js theme={null}
  npm install @coinbase/cdp-sdk dotenv
  ```

  ```bash Python theme={null}
  pip install cdp python-dotenv
  ```
</CodeGroup>

Finally, instantiate the CDP client as suggested by the [Server Wallet Quickstart](/server-wallets/v2/introduction/quickstart):

<CodeGroup>
  ```typescript Node.js theme={null}
  import { CdpClient } from "@coinbase/cdp-sdk";
  import { toAccount } from "viem/accounts";
  import dotenv from "dotenv";

  dotenv.config()

  const cdp = new CdpClient();
  const cdpAccount = await cdp.evm.createAccount();
  const account = toAccount(cdpAccount);
  ```

  ```python Python theme={null}
  import asyncio
  from cdp import CdpClient
  from dotenv import load_dotenv

  load_dotenv()

  cdp = CdpClient()
  account = await cdp.evm.create_account()
  ```
</CodeGroup>

### Standalone Wallet Libraries

If you prefer to use your own wallet, you can use standalone libraries:

#### EVM

<Tabs>
  <Tab title="Node.js (viem)">
    Install the required package:

    ```bash  theme={null}
    npm install viem
    ```

    Then instantiate the wallet account:

    ```typescript  theme={null}
    import { createWalletClient, http } from "viem";
    import { privateKeyToAccount } from "viem/accounts";
    import { baseSepolia } from "viem/chains";

    // Create a wallet client (using your private key)
    const account = privateKeyToAccount("0xYourPrivateKey"); // we recommend using an environment variable for this
    ```
  </Tab>

  <Tab title="Python (eth-account)">
    Install the required package:

    ```bash  theme={null}
    pip install eth_account
    ```

    Then instantiate the wallet account:

    ```python  theme={null}
    from eth_account import Account

    account = Account.from_key("your_private_key") # we recommend using an environment variable for this
    ```
  </Tab>
</Tabs>

#### Solana (SVM)

Use [SolanaKit](https://www.solanakit.com/) to instantiate a signer:

```typescript  theme={null}
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { base58 } from "@scure/base";

// 64-byte base58 secret key (private + public)
const signer = await createKeyPairSignerFromBytes(
  base58.decode(process.env.SOLANA_PRIVATE_KEY!)
);

```

## 3. Make Paid Requests Automatically

You can automatically handle 402 Payment Required responses and complete payment flows using the x402 helper packages.

<Tabs>
  <Tab title="Node.js">
    You can use either `x402-fetch` or `x402-axios`:

    <Tabs>
      <Tab title="x402-fetch">
        **x402-fetch** extends the native `fetch` API to handle 402 responses and payment headers for you. [Full example here](https://github.com/coinbase/x402/tree/main/examples/typescript/clients/fetch)

        ```typescript  theme={null}
        import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";

        const fetchWithPayment = wrapFetchWithPayment(fetch, account);

        fetchWithPayment(url, { //url should be something like https://api.example.com/paid-endpoint
        method: "GET",
        })
        .then(async response => {
            const body = await response.json();
            console.log(body);

            const paymentResponse = decodeXPaymentResponse(response.headers.get("x-payment-response")!);
            console.log(paymentResponse);
        })
        .catch(error => {
            console.error(error.response?.data?.error);
        });
        ```

        **Features:**

        * Automatically handles 402 Payment Required responses
        * Verifies payment and generates payment headers
        * Retries the request with proof of payment
        * Supports all standard fetch options
      </Tab>

      <Tab title="x402-axios">
        **x402-axios** adds a payment interceptor to Axios, so your requests are retried with payment headers automatically. [Full example here](https://github.com/coinbase/x402/tree/main/examples/typescript/clients/axios)

        ```typescript  theme={null}
        import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";
        import axios from "axios";

        // Create an Axios instance with payment handling
        const api = withPaymentInterceptor(
        axios.create({
            baseURL, // e.g. https://api.example.com
        }),
        account,
        );

        api
        .get(endpointPath) // e.g. /paid-endpoint
        .then(response => {
            console.log(response.data);

            const paymentResponse = decodeXPaymentResponse(response.headers["x-payment-response"]);
            console.log(paymentResponse);
        })
        .catch(error => {
            console.error(error.response?.data?.error);
        });
        ```

        **Features:**

        * Automatically handles 402 Payment Required responses
        * Retries requests with payment headers
        * Exposes payment response headers
      </Tab>
    </Tabs>
  </Tab>

  <Tab title="Python">
    You can use either `httpx` or `Requests`:

    * **Requests** is a well-established library for **synchronous** HTTP requests. Simple and ideal for straightforward, sequential workflows.
    * **HTTPX** is a modern library that supports both **synchronous** and **asynchronous** HTTP requests. Use if you need high concurrency or async capabilities.

    Both support a **simple** and **extensible** approach. The simple approach (shown below) returns a pre-configured client that handles payments automatically.

    <Tabs>
      <Tab title="HTTPX">
        [Full example here](https://github.com/coinbase/x402/tree/main/examples/python/clients/httpx)

        ```python  theme={null}
        from x402.clients.httpx import x402HttpxClient
        # Other imports...

        # Wallet creation logic ...

        # Create client and make request
        async with x402HttpxClient(account=account, base_url="https://api.example.com") as client:
            response = await client.get("/protected-endpoint")
            print(await response.aread())
        ```
      </Tab>

      <Tab title="Requests">
        [Full example here](https://github.com/coinbase/x402/tree/main/examples/python/clients/requests)

        ```python  theme={null}
        from x402.clients.requests import x402_requests
        # Other imports...

        # Wallet creation logic ...

        # Create session and make request
        session = x402_requests(account)
        response = session.get("https://api.example.com/protected-endpoint")
        print(response.content)
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

## 4. Discover Available Services (Optional)

Instead of hardcoding endpoints, you can use the x402 Bazaar to dynamically discover available services. This is especially powerful for building autonomous agents that can find and use new capabilities.

See the full example here for [Python](https://github.com/coinbase/x402/tree/main/examples/python/discovery) and [Node.js](https://github.com/coinbase/x402/tree/main/examples/typescript/discovery).

<Tabs>
  <Tab title="Node.js">
    ```typescript  theme={null}
    import { useFacilitator } from "x402/verify";
    import { facilitator } from "@coinbase/x402";

    // Get the list function from the facilitator
    const { list } = useFacilitator(facilitator);

    // Discover all available x402 services
    const services = await list();
    ```
  </Tab>

  <Tab title="Python">
    ```python  theme={null}
    from x402.facilitator import FacilitatorClient
    from cdp.x402 import create_facilitator_config

    # Set up facilitator client
    facilitator_config = create_facilitator_config()
    facilitator = FacilitatorClient(facilitator_config)

    # Discover all available x402 services
    services = await facilitator.list()
    ```
  </Tab>
</Tabs>

<Info>
  Learn more about service discovery in the [x402 Bazaar documentation](/x402/bazaar), including how to filter services, understand their schemas, and build agents that can autonomously discover new capabilities.
</Info>

## 5. Error Handling

Clients will throw errors if:

* The request configuration is missing
* A payment has already been attempted for the request
* There is an error creating the payment header

## Summary

* Install an x402 client package
* Create a wallet client
* Use the provided wrapper/interceptor to make paid API requests
* (Optional) Use the x402 Bazaar to discover services dynamically
* Payment flows are handled automatically for you

## References:

* [x402-fetch npm docs](https://www.npmjs.com/package/x402-fetch)
* [x402-axios npm docs](https://www.npmjs.com/package/x402-axios)
* [x402 PyPi page](https://pypi.org/project/x402/)
* [x402 Bazaar documentation](/x402/bazaar) - Discover available services
* [X402 with Embedded Wallets](/embedded-wallets/x402-payments) - User-facing applications with embedded wallets

For questions or support, join our [Discord](https://discord.gg/invite/cdp).


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.cdp.coinbase.com/llms.txt