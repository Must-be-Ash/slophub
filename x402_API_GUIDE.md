# Slophub API Developer Guide

**Generate AI Landing Pages Programmatically via x402**

This guide shows developers how to programmatically generate landing pages using the Slophub API without the web UI. The API is protected by the x402 payment protocol, requiring **$1.99 USDC** on Base network per landing page generation.

---

## Overview

**What you can do:**
- Generate professional, AI-powered landing pages programmatically
- Pay-per-use model: $1.99 USDC per landing page (no subscriptions)
- Monitor workflow progress in real-time
- Access generated landing pages via public URLs

**What the API does:**
1. Scrapes your brand website for assets and branding
2. Researches your market and campaign
3. Generates landing page specifications
4. Creates custom AI images
5. Builds production-ready HTML with inline CSS
6. Deploys to a public URL
7. Captures preview screenshot

**Processing Time:** ~3-4 minutes per landing page

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm (or Python 3.8+)
- **USDC on Base network** - At least $2 USDC (for payment + gas)
- **A crypto wallet** with private key or CDP Server Wallet
- **x402 client library** - Handles payment flow automatically

<details>
<summary>💡 New to x402?</summary>

x402 is a payment protocol that lets APIs charge per request using cryptocurrency. The client libraries handle all the complexity:
1. Detect 402 Payment Required responses
2. Authorize payment on-chain
3. Retry request with payment proof
4. All automatic - you just make normal API calls!

Learn more: [x402 Documentation](https://docs.cdp.coinbase.com/x402)
</details>

---

## Quick Start

### 1. Install Dependencies

<details>
<summary>Node.js (x402-fetch)</summary>

```bash
npm install x402-fetch viem dotenv
```

**Recommended for:** Simple scripts, serverless functions, or if you prefer native `fetch` API.
</details>

<details>
<summary>Node.js (x402-axios)</summary>

```bash
npm install x402-axios axios viem dotenv
```

**Recommended for:** Applications already using Axios, need interceptors, or want more control.
</details>

<details>
<summary>Python</summary>

```bash
pip install x402 eth-account python-dotenv
```

**Recommended for:** Python-based automation, data pipelines, or AI agents.
</details>

---

### 2. Set Up Your Wallet

You need a wallet to sign payment authorizations. Two options:

#### Option A: CDP Server Wallet (Recommended)

Create an account at [cdp.coinbase.com](https://cdp.coinbase.com/) and get your API keys:

```bash
# .env
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret
CDP_WALLET_SECRET=your-wallet-secret
```

```typescript
import { CdpClient } from "@coinbase/cdp-sdk";
import { toAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

const cdp = new CdpClient();
const cdpAccount = await cdp.evm.createAccount();
const account = toAccount(cdpAccount);
```

#### Option B: Private Key (For Testing)

```bash
# .env
PRIVATE_KEY=0x1234567890abcdef... # Your wallet private key
```

```typescript
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
```

⚠️ **Security:** Never commit private keys to git. Use environment variables or secure key management.

---

### 3. Make Your First Request

<details open>
<summary><strong>Node.js (x402-fetch)</strong></summary>

```typescript
import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

// Create wallet account
const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

// Wrap fetch with payment handling
const fetchWithPayment = wrapFetchWithPayment(fetch, account);

// Generate landing page
async function generateLandingPage() {
  try {
    const response = await fetchWithPayment(
      "https://slophub.xyz/api/workflows/untitled-4",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://example.com",
          campaignDescription: "Q1 2024 product launch campaign targeting early adopters. Focus on innovation and reliability.",
          imageUrl: "https://example.com/reference-style.jpg" // Optional
        }),
      }
    );

    const result = await response.json();
    console.log("✅ Landing Page Generated!");
    console.log("Run ID:", result.runId);
    console.log("Live URL:", result.liveUrl);

    // Get payment details
    const paymentResponse = decodeXPaymentResponse(
      response.headers.get("x-payment-response")!
    );
    console.log("Payment TX:", paymentResponse.transaction);

    return result;
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

generateLandingPage();
```
</details>

<details>
<summary><strong>Node.js (x402-axios)</strong></summary>

```typescript
import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";
import axios from "axios";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

// Create wallet account
const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

// Create Axios instance with payment interceptor
const api = withPaymentInterceptor(
  axios.create({
    baseURL: "https://slophub.xyz",
  }),
  account
);

// Generate landing page
async function generateLandingPage() {
  try {
    const response = await api.post("/api/workflows/untitled-4", {
      url: "https://example.com",
      campaignDescription: "Q1 2024 product launch campaign targeting early adopters.",
      imageUrl: "https://example.com/reference.jpg" // Optional
    });

    console.log("✅ Landing Page Generated!");
    console.log("Run ID:", response.data.runId);
    console.log("Live URL:", response.data.liveUrl);

    // Get payment details
    const paymentResponse = decodeXPaymentResponse(
      response.headers["x-payment-response"]
    );
    console.log("Payment TX:", paymentResponse.transaction);

    return response.data;
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    throw error;
  }
}

generateLandingPage();
```
</details>

<details>
<summary><strong>Python</strong></summary>

```python
import asyncio
from x402.clients.httpx import x402HttpxClient
from eth_account import Account
from dotenv import load_dotenv
import os

load_dotenv()

# Create wallet account
account = Account.from_key(os.getenv("PRIVATE_KEY"))

async def generate_landing_page():
    async with x402HttpxClient(
        account=account,
        base_url="https://slophub.xyz"
    ) as client:
        try:
            response = await client.post(
                "/api/workflows/untitled-4",
                json={
                    "url": "https://example.com",
                    "campaignDescription": "Q1 2024 product launch campaign.",
                    "imageUrl": "https://example.com/reference.jpg"  # Optional
                }
            )

            result = response.json()
            print("✅ Landing Page Generated!")
            print(f"Run ID: {result['runId']}")
            print(f"Live URL: {result['liveUrl']}")

            return result

        except Exception as error:
            print(f"❌ Error: {error}")
            raise

# Run the async function
asyncio.run(generate_landing_page())
```
</details>

---

## Understanding the Payment Flow

### Step 1: Initial Request (No Payment)

When you make a request without payment, the API returns a **402 Payment Required** response:

```bash
curl -X POST https://slophub.xyz/api/workflows/untitled-4 \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "campaignDescription": "Q1 2024 product launch"
  }'
```

**Response (402):**
```json
{
  "x402Version": 1,
  "error": "X-PAYMENT header is required",
  "accepts": [
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "1990000",
      "resource": "https://slophub.xyz/api/workflows/untitled-4",
      "description": "Generate AI landing page with workflow execution",
      "mimeType": "application/json",
      "payTo": "0xAbF01df9428EaD5418473A7c91244826A3Af23b3",
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "maxTimeoutSeconds": 120
    }
  ]
}
```

**Payment Requirements Explained:**
- **scheme:** `exact` - Exact payment amount required
- **network:** `base` - Base mainnet (EVM)
- **maxAmountRequired:** `1990000` - 1.99 USDC (6 decimals)
- **payTo:** Receiving wallet address
- **asset:** USDC contract address on Base
- **maxTimeoutSeconds:** Payment authorization timeout

### Step 2: Automatic Payment & Retry

**The x402 client library automatically:**
1. ✅ Parses the 402 response
2. ✅ Verifies amount is within your max ($1.99 ≤ max)
3. ✅ Creates EIP-712 signature for USDC authorization
4. ✅ Encodes signature into `X-PAYMENT` header
5. ✅ Retries request with payment header

**You don't need to handle this manually!** The client does it all.

### Step 3: Success Response

**Response (200):**
```json
{
  "runId": "wrun_01KBP9Q8YCKHXD7W77BYCH33X9",
  "liveUrl": "https://slophub.xyz/landing/wrun_01KBP9Q8YCKHXD7W77BYCH33X9"
}
```

**Headers:**
```
X-PAYMENT-RESPONSE: tx_hash:0xabc123...
```

---

## API Reference

### POST `/api/workflows/untitled-4`

**Generate AI Landing Page**

#### Request

**Headers:**
```
Content-Type: application/json
X-PAYMENT: <base64-encoded-payment-authorization> (added automatically by x402 client)
```

**Body:**
```typescript
{
  url: string;                 // Required: Your brand website URL (5-500 chars)
  campaignDescription: string; // Required: Campaign details (20-1000 chars)
  imageUrl?: string;          // Optional: Reference image for style (max 500 chars)
}
```

**Example:**
```json
{
  "url": "https://example.com",
  "campaignDescription": "Launch campaign for our new SaaS product targeting small businesses. Focus on ease of use and affordability.",
  "imageUrl": "https://example.com/hero-inspiration.jpg"
}
```

#### Response

**Success (200):**
```typescript
{
  runId: string;   // Workflow execution ID (e.g., "wrun_01KBP9Q8...")
  liveUrl: string; // Public landing page URL
}
```

**Payment Required (402):**
```typescript
{
  x402Version: 1;
  error: string;
  accepts: PaymentRequirements[];
}
```

**Rate Limited (429):**
```typescript
{
  error: string;
  retryAfter: number; // Seconds until next allowed request
}
```

**Validation Error (400):**
```typescript
{
  error: string; // Description of validation failure
}
```

#### Validation Rules

- **url:** Must be valid HTTP/HTTPS URL, 5-500 characters
- **campaignDescription:** 20-1,000 characters, HTML tags stripped
- **imageUrl:** Optional, max 500 characters, must be valid URL if provided
- **Rate Limit:** 10 requests per hour per IP/user

---

## Monitoring Workflow Progress

The workflow takes ~3-4 minutes. Monitor progress using the status API:

### GET `/api/workflows/untitled-4/status?runId={runId}`

**Poll for Updates:**

```typescript
async function monitorProgress(runId: string) {
  const statusUrl = `https://slophub.xyz/api/workflows/untitled-4/status?runId=${runId}`;

  while (true) {
    const response = await fetch(statusUrl);
    const status = await response.json();

    console.log(`Status: ${status.status}`);

    // Display step progress
    status.steps.forEach(step => {
      console.log(`  [${step.status}] ${step.stepLabel}`);
    });

    // Check if complete
    if (status.status === 'completed') {
      console.log('✅ Landing page ready!');
      console.log('Live URL:', status.result.liveUrl);
      console.log('Screenshot:', status.result.screenshotUrl);
      break;
    }

    if (status.status === 'failed' || status.status === 'error') {
      console.error('❌ Workflow failed');
      break;
    }

    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Use after generating landing page
const result = await generateLandingPage();
await monitorProgress(result.runId);
```

**Status Response:**
```typescript
{
  status: 'running' | 'completed' | 'failed' | 'error';
  steps: Array<{
    stepId: string;
    stepLabel: string;
    status: 'pending' | 'running' | 'success' | 'error';
    timestamp: number;
    duration?: number;
    detail?: any;
  }>;
  result?: {
    liveUrl: string;
    screenshotUrl?: string;
  };
}
```

**Workflow Steps:**
1. **Scrape Website & Upload Assets** (~8s)
2. **Research Campaign Data** (~12s)
3. **Generate Landing Page Spec** (~6s)
4. **Generate Landing Page Images** (~18s)
5. **Generate HTML with Claude Opus 4.5** (~10s)
6. **Save to MongoDB** (~100ms)
7. **Capture Preview Screenshot** (~5s)

---

## Accessing Your Landing Page

### Public Landing Page

Once the workflow completes, your landing page is publicly accessible:

```
https://slophub.xyz/landing/{runId}
```

**Features:**
- ✅ Fully rendered HTML with inline CSS
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ SEO optimized with meta tags
- ✅ All CTAs link to your target URL
- ✅ Custom AI-generated images
- ✅ Brand colors, fonts, and personality
- ✅ No authentication required (public)

### Embedding

You can embed the landing page in an iframe:

```html
<iframe
  src="https://slophub.xyz/landing/wrun_01KBP9Q8YCKHXD7W77BYCH33X9"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>
```

### Download HTML

Fetch the raw HTML programmatically:

```typescript
async function downloadHTML(runId: string) {
  const response = await fetch(`https://slophub.xyz/landing/${runId}`);
  const html = await response.text();

  // Save to file or use in your application
  await fs.writeFile('landing-page.html', html);
}
```

---

## Complete Example: End-to-End

```typescript
import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const fetchWithPayment = wrapFetchWithPayment(fetch, account);

async function createAndMonitorLandingPage() {
  // Step 1: Generate landing page
  console.log("🚀 Generating landing page...");

  const response = await fetchWithPayment(
    "https://slophub.xyz/api/workflows/untitled-4",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: "https://example.com",
        campaignDescription: "Summer sale campaign targeting new customers with 30% off promotion.",
      }),
    }
  );

  const { runId, liveUrl } = await response.json();

  // Get payment transaction
  const payment = decodeXPaymentResponse(response.headers.get("x-payment-response")!);
  console.log("💳 Payment TX:", payment.transaction);
  console.log("📋 Run ID:", runId);

  // Step 2: Monitor progress
  console.log("\n⏳ Monitoring progress...");

  let completed = false;
  while (!completed) {
    const statusResponse = await fetch(
      `https://slophub.xyz/api/workflows/untitled-4/status?runId=${runId}`
    );
    const status = await statusResponse.json();

    // Show progress
    const currentStep = status.steps.find(s => s.status === 'running');
    if (currentStep) {
      console.log(`⚙️  ${currentStep.stepLabel}...`);
    }

    // Check completion
    if (status.status === 'completed') {
      completed = true;
      console.log("\n✅ Landing page generated!");
      console.log("🔗 Live URL:", liveUrl);
      console.log("📸 Screenshot:", status.result.screenshotUrl);

      // Step 3: Download HTML (optional)
      const htmlResponse = await fetch(liveUrl);
      const html = await htmlResponse.text();
      console.log(`📄 HTML size: ${(html.length / 1024).toFixed(1)} KB`);

      return {
        runId,
        liveUrl,
        screenshotUrl: status.result.screenshotUrl,
        html,
      };
    }

    if (status.status === 'failed' || status.status === 'error') {
      throw new Error('Workflow failed');
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

// Run
createAndMonitorLandingPage()
  .then(result => console.log("\n✨ Done!", result))
  .catch(error => console.error("\n❌ Error:", error));
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| **402 Payment Required** | No X-PAYMENT header | Use x402 client library |
| **400 Bad Request** | Invalid input | Check URL and description format |
| **429 Too Many Requests** | Rate limit exceeded | Wait before retrying (10/hour limit) |
| **Insufficient funds** | Not enough USDC | Add USDC to your wallet |
| **Payment timeout** | Authorization expired | Retry request (auto-handled by client) |

### Error Response Format

```typescript
{
  error: string;           // Human-readable error message
  retryAfter?: number;    // For 429 errors - seconds to wait
  payer?: string;         // For 402 errors - wallet address
}
```

### Handling Errors

```typescript
try {
  const result = await generateLandingPage();
} catch (error) {
  if (error.response?.status === 402) {
    console.error("Payment required or failed");
  } else if (error.response?.status === 429) {
    const retryAfter = error.response.data.retryAfter;
    console.error(`Rate limited. Retry in ${retryAfter} seconds`);
  } else if (error.response?.status === 400) {
    console.error("Invalid input:", error.response.data.error);
  } else {
    console.error("Unexpected error:", error.message);
  }
}
```

---

## Advanced Usage

### Batch Generation

Generate multiple landing pages efficiently:

```typescript
async function batchGenerate(campaigns: Array<{url: string, description: string}>) {
  const results = [];

  for (const campaign of campaigns) {
    try {
      const result = await generateLandingPage(campaign.url, campaign.description);
      results.push({ success: true, ...result });

      // Respect rate limits (10/hour = 1 every 6 minutes)
      await new Promise(resolve => setTimeout(resolve, 6 * 60 * 1000));
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }

  return results;
}
```

### Custom Payment Limits

Set a maximum payment amount you're willing to authorize:

```typescript
import { wrapFetchWithPayment } from "x402-fetch";

const fetchWithPayment = wrapFetchWithPayment(
  fetch,
  account,
  {
    maxPaymentAmount: 2.50, // Max $2.50 per request
  }
);
```

If the API requests more than $2.50, the client will reject the payment.

### Webhook Notifications

Get notified when workflows complete (requires your own webhook endpoint):

```typescript
// Your webhook endpoint receives:
POST https://your-api.com/webhooks/landing-page
{
  "runId": "wrun_01KBP9Q8...",
  "status": "completed",
  "liveUrl": "https://slophub.xyz/landing/wrun_01KBP9Q8...",
  "screenshotUrl": "https://blob.vercel-storage.com/...",
  "timestamp": 1764906418901
}
```

*Note: Webhook support coming soon. Currently poll the status endpoint.*

---

## Cost & Billing

### Pricing

- **$1.99 USDC per landing page** - Pay only when you generate
- **No subscription fees** - Pure pay-per-use
- **No hidden costs** - Price includes all AI services

### Payment Details

- **Network:** Base (Ethereum L2)
- **Token:** USDC (6 decimals)
- **Settlement:** On-chain payment authorization
- **Gas Fees:** ~$0.01-0.05 (paid separately in ETH)

### Getting USDC on Base

1. **Bridge from Ethereum:** Use [Base Bridge](https://bridge.base.org/)
2. **Buy directly:** Use [Coinbase](https://www.coinbase.com/) and withdraw to Base
3. **Swap:** Use Base DEXs like Uniswap

---

## Rate Limits

| Limit Type | Value | Scope |
|------------|-------|-------|
| Requests | 10/hour | Per IP/wallet |
| Concurrent | 1 | Per runId |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1764906418
```

---

## Support & Resources

### Documentation

- **API Reference:** This document
- **x402 Protocol:** [docs.cdp.coinbase.com/x402](https://docs.cdp.coinbase.com/x402)
- **Project Workflow:** `/docs/WORKFLOW.md` in repo
- **Security Report:** `/docs/SECURITY-REPORT.md` in repo

### Example Code

Complete examples available at:
- **Node.js (fetch):** [examples/generate-landing-page-fetch.ts](./examples/)
- **Node.js (axios):** [examples/generate-landing-page-axios.ts](./examples/)
- **Python:** [examples/generate_landing_page.py](./examples/)

### Community

- **Discord:** [discord.gg/cdp](https://discord.gg/invite/cdp)
- **GitHub Issues:** Report bugs or request features
- **Twitter:** [@coinbase](https://twitter.com/coinbase) for updates

### Contact

For enterprise pricing, custom integrations, or partnership inquiries:
- Email: support@slophub.xyz
- GitHub: [github.com/your-org/blog-agent](https://github.com)

---

## FAQ

<details>
<summary><strong>Can I use this in production?</strong></summary>

Yes! The API is production-ready with:
- ✅ Automatic retries on transient failures
- ✅ Rate limiting to prevent abuse
- ✅ Payment protection against unauthorized use
- ✅ Durable workflows that survive server restarts

</details>

<details>
<summary><strong>What happens if the workflow fails?</strong></summary>

- Payment is **only charged on success**
- Failed workflows don't complete payment settlement
- You can retry without being double-charged
- Detailed error logs available in status endpoint

</details>

<details>
<summary><strong>Can I cancel a running workflow?</strong></summary>

Currently, workflows cannot be cancelled once started. They run to completion (~3-4 minutes).

</details>

<details>
<summary><strong>How long are landing pages hosted?</strong></summary>

Landing pages are hosted indefinitely at no additional cost. Screenshots and assets are stored permanently in Vercel Blob storage.

</details>

<details>
<summary><strong>Can I customize the generated HTML?</strong></summary>

Yes! Download the HTML and modify it as needed. The generated code uses:
- Vanilla HTML/CSS (no frameworks)
- Inline styles (easy to customize)
- Semantic markup
- Mobile-responsive design

</details>

<details>
<summary><strong>Do you support other networks?</strong></summary>

Currently Base mainnet only. Support for Ethereum mainnet and other L2s coming soon.

</details>

<details>
<summary><strong>Can I white-label the landing pages?</strong></summary>

Yes! Generated pages contain no Slophub branding. You can:
- Host the HTML on your own domain
- Customize any aspect of the design
- Use your own analytics

</details>

---

**Ready to generate your first landing page?** Jump to [Quick Start](#quick-start) and start building!
