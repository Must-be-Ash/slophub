# Slophub - AI Landing Page Generator

An AI-powered landing page generator that creates conversion-focused landing pages for sales funnels and marketing campaigns. Built with Vercel Workflow Kit, CDP Embedded Wallets, and gated with x402 micropayments.

## Overview

Slophub generates professional, branded landing pages using AI. Simply provide:

1. **Campaign Description** - Describe your marketing campaign or sales funnel
2. **CTA URL** - Your call-to-action destination URL
3. **Reference Images** (optional) - Upload images to guide the visual style

### How It Works

The agent orchestrates multiple AI services to create your landing page:

1. **🔍 Brand Extraction** - Firecrawl scrapes your URL to extract brand information, assets, and content
2. **📸 Design Analysis** - Captures screenshots of your site to understand your brand's visual style
3. **🔎 Market Research** - Perplexity searches the web for campaign insights and market trends
4. **📝 Spec Generation** - GPT-4o writes detailed landing page specifications and campaign copy
5. **🎨 Image Generation** - Fal.ai creates custom images matching your brand and campaign
6. **🚀 HTML Generation** - Claude Opus 4.5 generates complete, production-ready HTML with inline CSS
7. **💾 Deployment** - Instantly deploys your landing page to a public URL

**Result:** A fully functional, branded landing page ready in ~3-4 minutes.

---

## Tech Stack

- **[Vercel Workflow Kit](https://workflow.is)** - Durable, retryable workflow orchestration
- **[CDP Embedded Wallets](https://docs.cdp.coinbase.com/embedded-wallets)** - Seamless wallet authentication and onramp
- **[x402 Protocol](https://x402.org)** - Micropayment gating ($1.99 USDC on Base network)
- **Next.js 16** - React framework with App Router
- **MongoDB** - Data persistence and workflow state management
- **Vercel Blob** - Asset storage for images and screenshots

### AI Services

- **Claude Opus 4.5** (Anthropic) - HTML generation
- **GPT-4o** (OpenAI) - Landing page spec writing
- **Perplexity AI** - Web search and market research
- **Firecrawl** - Web scraping and brand extraction
- **Fal.ai** - AI image generation

---

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB database
- API keys for: Anthropic, OpenAI, Perplexity, Firecrawl, Fal.ai, Screenshot API
- Coinbase Developer Platform project
- Vercel Blob storage token

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd blog-agent
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys:
   ```env
   # AI Services
   WORKFLOW_ANTHROPIC_API_KEY=sk-ant-...
   OPENAI_API_KEY=sk-...
   PERPLEXITY_API_KEY=pplx-...
   FIRECRAWL_API_KEY=fc-...
   FAL_KEY=...
   SCREENSHOTAPI_TOKEN=...

   # Database
   MONGODB_URI=mongodb+srv://...

   # Storage
   BLOB_READ_WRITE_TOKEN=vercel_blob_...

   # CDP Embedded Wallets
   NEXT_PUBLIC_CDP_PROJECT_ID=...
   CDP_API_KEY_ID=...
   CDP_API_KEY_SECRET=...

   # x402 Payment
   NEXT_PUBLIC_NETWORK=base
   NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS=0x...
   FACILITATOR_URL=https://x402.org/facilitator
   ```

4. **Run the development server:**
   ```bash
   pnpm dev
   ```

5. **Open the app:**
   ```
   http://localhost:3000
   ```

### Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Delete old workflows (cleanup script)
pnpm delete-workflows

# Update landing page thumbnails
pnpm update-thumbnails
```

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│              (Form: URL + Campaign Description + Image)          │
│                  Home Page (/) with Wallet Auth                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            Payment Verification (x402 Protocol)                  │
│       POST /api/workflows/untitled-4 ($1.99 USDC on Base)      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Verify X-PAYMENT header with CDP Facilitator        │   │
│  │ 2. Check payment authorization signature               │   │
│  │ 3. Settle payment asynchronously                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ Payment Valid ✓
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Real-time Status Monitoring                      │
│                   /workflow/[runId] Page                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Polls /api/workflows/untitled-4/status every 1s      │   │
│  │ • Shows step-by-step progress with timeline            │   │
│  │ • Displays completion status and live preview          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Workflow Execution                          │
│             (Durable, Retryable Process - ~3-4 min)             │
│                                                                   │
│  Step 1: Scrape Website & Upload Assets          (~8s)          │
│           ├─ Firecrawl scrapes brand website                    │
│           ├─ Captures brand screenshot                          │
│           └─ Uploads assets to Vercel Blob                      │
│                                                                   │
│  Step 2: Research Campaign Data                   (~12s)        │
│           └─ Perplexity searches for market insights            │
│                                                                   │
│  Step 3: Generate Landing Page Spec               (~6s)         │
│           └─ GPT-4o creates detailed specification              │
│                                                                   │
│  Step 4: Generate Landing Page Images             (~18s)        │
│           ├─ Rehost brand images to Vercel Blob                 │
│           ├─ Fal.ai generates 3 custom images                   │
│           └─ Upload to Vercel Blob                              │
│                                                                   │
│  Step 5: Generate HTML with Claude Opus 4.5       (~10s)        │
│           └─ Claude generates complete HTML + CSS                │
│                                                                   │
│  Step 6: Save to MongoDB                          (~100ms)      │
│           ├─ Saves ALL data to 'workflows' collection           │
│           └─ Landing page now accessible at /landing/[runId]    │
│                                                                   │
│  Step 7: Capture Preview Screenshot               (~5s)         │
│           ├─ Wait 3s for Next.js to render                      │
│           ├─ Screenshot API captures /landing/[runId]           │
│           └─ Upload screenshot to Vercel Blob                   │
│                                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MongoDB Storage                            │
│      Database: blog-agent | Collections: workflows,              │
│              workflow_step_status, workflow_logs                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│          Public Landing Page: /landing/[runId]                   │
│              (Server-side rendered, no auth required)            │
│                                                                   │
│  Smart State Detection:                                          │
│  1. Completed workflow → Render landing page ✓                 │
│  2. Workflow in progress → Show "Generating... 3-4 min" 🔄     │
│  3. No workflow found → Return custom 404 page ❌               │
└─────────────────────────────────────────────────────────────────┘
```

### Workflow Steps (Detailed)

#### Step 1: Scrape Website & Upload Assets (~8s)
- Firecrawl scrapes target URL for metadata, content, and branding
- Captures screenshot of original website for visual reference
- Uploads brand assets (OG image, favicon) to Vercel Blob
- **Output:** Brand metadata, colors, fonts, personality, markdown content

#### Step 2: Research Campaign Data (~12s)
- Perplexity AI searches the web for market insights
- Gathers competitive analysis and industry trends
- Returns research findings with citations
- **Output:** Market research data and source URLs

#### Step 3: Generate Landing Page Spec (~6s)
- GPT-4o combines brand data + campaign description + research
- Writes detailed landing page specification
- Includes: headline, hero section, value props, features, CTAs, SEO
- **Output:** Complete landing page specification

#### Step 4: Generate Landing Page Images (~18s)
- Downloads and rehosts brand images to Vercel Blob
- Analyzes spec to determine image needs
- Fal.ai generates 3 custom images (hero, features, supporting)
- Uploads all images to Vercel Blob
- **Output:** Array of image URLs

#### Step 5: Generate HTML with Claude Opus 4.5 (~10s)
- Claude Opus 4.5 generates complete HTML document
- Includes inline CSS, responsive design, SEO meta tags
- Uses brand colors, fonts, and personality from Firecrawl
- Incorporates all generated images
- All CTAs link to target URL
- **Output:** Production-ready HTML

#### Step 6: Save to MongoDB (~100ms)
- **CRITICAL:** Saves all data to MongoDB BEFORE screenshot
- Makes landing page accessible at `/landing/[runId]`
- Prevents screenshot race condition (404 captures)
- **Output:** MongoDB document with all workflow data

#### Step 7: Capture Preview Screenshot (~5s)
- Waits 3 seconds for Next.js to render the page
- Screenshot API captures full-page screenshot
- Uploads screenshot to Vercel Blob
- Updates MongoDB with screenshot URL
- **Output:** Screenshot URL for gallery thumbnails

---

## Key Features

### 🔄 Durable Workflows
- Powered by Vercel Workflow Kit
- Automatic retry on transient failures
- State persists across server restarts
- Resume from last successful step

### 💳 Micropayments (x402)
- $1.99 USDC payment on Base network
- CDP Facilitator verification
- Embedded wallet integration
- Async settlement (doesn't block workflow)

### 🎨 Smart Landing Page States
1. **Completed** - Renders full HTML landing page
2. **In Progress** - Shows "Generating... 3-4 minutes" with progress link
3. **Not Found** - Custom 404 page with navigation

### 📊 Real-time Monitoring
- Live workflow status page (`/workflow/[runId]`)
- Polls status API every 1 second
- Step-by-step progress timeline
- Animated progress bar
- Preview on completion

### 🚀 Instant Deployment
- Landing pages immediately accessible at `/landing/[runId]`
- Fully public (no authentication required)
- Server-side rendered for SEO
- Gallery view of all generated pages

---

## API Endpoints

### POST `/api/workflows/untitled-4`
**Description:** Start landing page generation workflow

**Payment:** $1.99 USDC on Base (via x402)

**Headers:**
```
Content-Type: application/json
X-PAYMENT: <base64-encoded-payment-proof>
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "campaignDescription": "Q1 2024 product launch campaign",
  "imageUrl": "https://example.com/reference.jpg" // optional
}
```

**Response:**
```json
{
  "runId": "wrun_01KBP9Q8YCKHXD7W77BYCH33X9",
  "liveUrl": "https://slophub.xyz/landing/wrun_01KBP9Q8YCKHXD7W77BYCH33X9"
}
```

---

### GET `/api/workflows/untitled-4/status?runId={runId}`
**Description:** Get real-time workflow status

**Response:**
```json
{
  "status": "running",
  "steps": [
    {
      "stepId": "scrape",
      "stepLabel": "Scrape Website & Upload Assets",
      "status": "success",
      "timestamp": 1764906418901,
      "duration": 8234
    }
  ]
}
```

---

### GET `/landing/[runId]`
**Description:** Public landing page (no auth required)

**Smart Behavior:**
- If workflow complete → Render landing page
- If workflow in progress → Show loading state with ETA
- If no workflow exists → Show custom 404 page

---

### GET `/gallery`
**Description:** Gallery of all generated landing pages

**Features:**
- Grid view with thumbnails
- Shows brand title, industry, campaign description
- Links to individual landing pages

---

## Project Structure

```
blog-agent/
├── app/
│   ├── api/
│   │   └── workflows/untitled-4/
│   │       ├── route.ts              # Workflow API (x402 protected)
│   │       └── status/route.ts       # Status polling
│   ├── landing/[runId]/
│   │   └── page.tsx                  # Public landing pages
│   ├── workflow/[runId]/
│   │   └── page.tsx                  # Workflow monitoring
│   ├── gallery/
│   │   └── page.tsx                  # Gallery view
│   ├── not-found.tsx                 # Custom 404 page
│   ├── layout.tsx                    # Root layout with CDP
│   └── page.tsx                      # Home page
│
├── workflows/
│   ├── untitled-4.ts                 # Main workflow orchestrator
│   └── steps/                        # Individual workflow steps
│       ├── scrape-step.ts
│       ├── search-step.ts
│       ├── generate-text-step.ts
│       ├── fal-image-generation-step.ts
│       ├── claude-generate-html-step.ts
│       ├── screenshot-step.ts
│       └── save-to-mongodb-step.ts
│
├── lib/
│   ├── payment-verification.ts       # x402 payment logic
│   ├── rate-limit.ts                 # Rate limiting
│   └── workflow-cache.ts             # Real-time updates
│
├── components/
│   ├── Header.tsx                    # Main header with wallet
│   ├── WalletDropdown.tsx            # Wallet UI
│   ├── FloatingCTA.tsx               # Landing page CTA
│   └── workflow-*.tsx                # Workflow UI components
│
├── WORKFLOW.md                       # Detailed workflow docs
├── CLAUDE.md                         # Project instructions
└── README.md                         # This file
```

---

## MongoDB Collections

### `workflows`
Stores completed workflow results:
```json
{
  "runId": "wrun_...",
  "url": "https://example.com",
  "industry": "Technology",
  "landingPageHtml": "<!DOCTYPE html>...",
  "landingPageSpec": "...",
  "generatedImages": [...],
  "screenshotUrl": "https://blob.vercel-storage.com/...",
  "createdAt": 1764906418901
}
```

### `workflow_step_status`
Real-time step progress (enables loading state detection):
```json
{
  "runId": "wrun_...",
  "stepId": "generateHtml",
  "stepLabel": "Generate HTML with Claude Opus 4.5",
  "status": "success",
  "timestamp": 1764906418901,
  "duration": 10234
}
```

---

## Environment Variables

### Required

```env
# AI Services
WORKFLOW_ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
FIRECRAWL_API_KEY=fc-...
FAL_KEY=...
SCREENSHOTAPI_TOKEN=...

# Database
MONGODB_URI=mongodb+srv://...

# Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# CDP Embedded Wallets
NEXT_PUBLIC_CDP_PROJECT_ID=...
CDP_API_KEY_ID=...
CDP_API_KEY_SECRET=...

# x402 Payment Configuration
NEXT_PUBLIC_NETWORK=base
NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS=0x...
FACILITATOR_URL=https://x402.org/facilitator
USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

### Optional

```env
NEXT_PUBLIC_URL=https://slophub.xyz
VERCEL_TEAM_ID=team_...
VERCEL_TOKEN=...
```

---

## Deployment

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel:**
   - Import your GitHub repository in Vercel
   - Vercel will auto-detect Next.js

3. **Add environment variables:**
   - Go to Project Settings → Environment Variables
   - Add all required env vars from `.env.local`

4. **Deploy:**
   ```bash
   vercel deploy --prod
   ```

### Post-Deployment

- Landing pages will be accessible at `https://your-domain.com/landing/[runId]`
- Gallery at `https://your-domain.com/gallery`
- Workflow monitoring at `https://your-domain.com/workflow/[runId]`

---

## Key Architectural Decisions

### Screenshot Race Condition Fix
**Problem:** Screenshots were capturing 404 pages because MongoDB save happened AFTER screenshot.

**Solution:**
- Step 6 saves to MongoDB FIRST
- Step 7 waits 3 seconds, then captures screenshot
- Landing page data exists before screenshot is taken
- Even if screenshot fails, landing page still works

### Smart Landing Page States
**Problem:** Users saw 404s for workflows still in progress.

**Solution:**
- Check `workflows` collection for completed workflows
- Check `workflow_step_status` collection for in-progress workflows
- Show loading state with ETA if workflow is running
- Only show 404 if no workflow exists at all

### Public Landing Pages
**Decision:** Landing pages are publicly accessible (no authentication required).

**Rationale:**
- Landing pages are meant to be shared
- No sensitive data in generated pages
- Better SEO and shareability
- Users can view their pages immediately

---

## Troubleshooting

### Workflow fails at Step 1 (Scrape)
- Check `FIRECRAWL_API_KEY` is valid
- Verify target URL is accessible
- Check Firecrawl API quota

### Payment verification fails
- Ensure `CDP_API_KEY_ID` and `CDP_API_KEY_SECRET` are correct
- Verify `NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS` is valid
- Check user has sufficient USDC on Base network

### Screenshots show 404 pages
- Verify MongoDB save happens BEFORE screenshot (Step 6 before Step 7)
- Check `SCREENSHOTAPI_TOKEN` is valid
- Ensure landing page URL is publicly accessible

### Landing pages not rendering
- Check `MONGODB_URI` connection
- Verify workflow completed successfully
- Check browser console for errors

---

## Documentation

- **Detailed Workflow Documentation:** [WORKFLOW.md](./WORKFLOW.md)
- **Project Instructions:** [CLAUDE.md](./CLAUDE.md)
- **Vercel Workflow Docs:** [workflow.is](https://workflow.is)
- **CDP Embedded Wallets:** [docs.cdp.coinbase.com](https://docs.cdp.coinbase.com/embedded-wallets)
- **x402 Protocol:** [x402.org](https://x402.org)

---

## License

MIT

---

## Support

For issues and questions:
- Check [WORKFLOW.md](./WORKFLOW.md) for detailed documentation
- Review workflow logs in MongoDB
- Check Vercel deployment logs
- Verify all environment variables are set correctly
