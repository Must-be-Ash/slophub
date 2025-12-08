# Blog Agent Workflow Documentation

## Overview

Blog Agent is an AI-powered landing page generator that creates conversion-focused landing pages from a brand URL and campaign description. The application uses the Vercel Workflow framework for durable, retryable execution and x402 payment protocol for monetization. Generated landing pages are publicly accessible at `/landing/[runId]`.

## Quick Summary

**Workflow Steps:**
1. Scrape Website & Upload Assets
2. Research Campaign Data
3. Generate Landing Page Spec
4. Generate Landing Page Images
5. Generate HTML with Claude Opus 4.5
6. Save to MongoDB (BEFORE screenshot)
7. Capture Preview Screenshot

**External Services:**
- Claude API (HTML generation)
- OpenAI (landing page spec writing)
- Perplexity (search)
- Firecrawl (scraping)
- Fal.ai (image generation)
- Screenshot API (preview capture)
- x402 Protocol (payment verification)

---

## Architecture

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
│       POST /api/workflows/untitled-4 ($0.01 USDC on Base)      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Verify X-PAYMENT header with CDP Facilitator        │   │
│  │ 2. Check payment authorization signature               │   │
│  │ 3. Settle payment asynchronously                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ Payment Valid ✓
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Start Workflow Execution                      │
│         (Returns runId, redirects to /workflow/[runId])         │
└────────────────────────┬────────────────────────────────────────┘
                         │
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
│  Step 6: Save to MongoDB (CRITICAL!)              (~100ms)      │
│           ├─ Saves ALL data to 'workflows' collection           │
│           ├─ Landing page now accessible at /landing/[runId]    │
│           └─ screenshotUrl initially undefined                  │
│                                                                   │
│  Step 7: Capture Preview Screenshot               (~5s)         │
│           ├─ Wait 3 seconds for Next.js to render page          │
│           ├─ Screenshot API captures /landing/[runId]           │
│           ├─ Upload screenshot to Vercel Blob                   │
│           └─ Update MongoDB with screenshotUrl                  │
│                                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MongoDB Storage                            │
│      Database: blog-agent | Collections: workflows,              │
│              workflow_step_status, workflow_logs                 │
│                                                                   │
│  workflows collection:                                           │
│    ├─ runId, url, industry, brandAssets                         │
│    ├─ landingPageHtml (complete HTML)                           │
│    ├─ landingPageSpec, generatedImages                          │
│    ├─ liveUrl, screenshotUrl, createdAt                         │
│    └─ Full workflow results                                     │
│                                                                   │
│  workflow_step_status collection:                               │
│    ├─ Real-time step progress tracking                          │
│    ├─ Used for cross-instance status checks                     │
│    └─ Powers loading state detection                            │
│                                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│          Public Landing Page: /landing/[runId]                   │
│              (Server-side rendered, no auth required)            │
│                                                                   │
│  Logic Flow:                                                     │
│  1. Check 'workflows' collection for completed page             │
│  2. If found + has HTML → Render landing page ✓                │
│  3. If not found → Check 'workflow_step_status' collection      │
│  4. If steps exist → Show "Generating... 3-4 min" 🔄          │
│  5. If no steps → Return 404 (custom page) ❌                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Critical Architecture Update: Screenshot Race Condition Fix

### Problem (Before)
The screenshot was being taken **BEFORE** the landing page data was saved to MongoDB:

```
Old Flow (BROKEN):
1. Generate HTML
2. Take screenshot of /landing/[runId]  ← Page tries to load
3. Landing page queries MongoDB         ← No data found!
4. Returns 404
5. Screenshot captures 404 page         ❌
6. Save data to MongoDB (too late!)
```

### Solution (Current)
MongoDB save happens **BEFORE** screenshot capture:

```
New Flow (FIXED):
1. Generate HTML
2. Save all data to MongoDB FIRST       ✓ Data is now available!
3. Wait 3 seconds for Next.js
4. Take screenshot of /landing/[runId]
5. Landing page queries MongoDB         ✓ Data found!
6. Renders correctly
7. Screenshot captures actual page      ✓
8. Update MongoDB with screenshot URL
```

**Key Changes:**
- Line 602-634 in `workflows/untitled-4.ts`: MongoDB save moved before screenshot
- Line 626: Initial save with `screenshotUrl: undefined`
- Line 667-696: Second MongoDB update adds screenshot URL after capture
- `saveToMongoDBStep` now uses `updateOne` with `upsert: true` instead of `insertOne`

---

## Landing Page States & UX

### State 1: Completed Workflow
**URL:** `/landing/[runId]` where workflow finished

**Behavior:**
- Fetches data from `workflows` collection
- Renders complete HTML with embedded styles
- Shows FloatingCTA button
- Fully public, no authentication required

**User Sees:** ✓ Beautiful landing page

---

### State 2: Workflow In Progress
**URL:** `/landing/[runId]` where workflow is running

**Behavior:**
- Checks `workflow_step_status` collection
- Finds step records → Workflow was started
- Shows loading UI with:
  - Animated spinner
  - "Your Landing Page is Being Generated"
  - "Typically takes 3-4 minutes" message
  - Progress bar (60% animated)
  - Link to `/workflow/[runId]` for real-time updates
  - "View Progress" CTA button

**User Sees:** 🔄 Loading state with clear expectations

---

### State 3: Non-Existent RunId
**URL:** `/landing/fake-run-id` or invalid runId

**Behavior:**
- No data in `workflows` collection
- No steps in `workflow_step_status` collection
- Returns Next.js `notFound()`
- Renders custom 404 page

**User Sees:** ❌ Custom 404 with navigation options

---

### Custom 404 Page
**File:** `/app/not-found.tsx`

**Features:**
- Simple header with logo (no authentication)
- Large "404" number with brand font
- Friendly "Page Not Found" message
- Navigation buttons:
  - "Go Home" → `/`
  - "Browse Gallery" → `/gallery`
- Subtle grid pattern background
- Fully public, server-side rendered

---

## Workflow Steps (Detailed)

### Step 1: Scrape Website & Upload Assets

**File:** `workflows/steps/scrape-step.ts`

**Purpose:** Extract brand information and assets from the target URL

**Process:**
1. Calls Firecrawl API to scrape the target website
2. Extracts:
   - Metadata (title, description, OG image, favicon)
   - Markdown content
   - Comprehensive branding data (colors, fonts, personality)
   - Industry classification
3. Captures screenshot of original brand website for visual reference
4. Uploads OG image and favicon to Vercel Blob Storage

**External APIs:**
- Firecrawl API (`https://api.firecrawl.dev/v1/scrape`)
- Screenshot API (for brand website)
- Vercel Blob Storage (`@vercel/blob`)

**Output:**
```typescript
{
  metadata: {
    title: string;
    description: string;
    ogImage: string;
    favicon: string;
    industry: string;
  };
  markdown: string;
  branding: {
    colorScheme: string;
    colors: { primary, secondary, accent };
    typography: { fontFamilies };
    personality: { tone, energy };
  };
  uploadedAssets: Array<{ name: string; blobUrl: string }>;
  brandScreenshotUrl: string; // NEW: Brand website screenshot
}
```

---

### Step 2: Research Campaign Data

**File:** `workflows/steps/search-step.ts`

**Purpose:** Gather market research and competitive insights

**Process:**
1. Constructs search query from campaign description
2. Calls Perplexity AI for internet research
3. Returns structured research results with citations

**External APIs:**
- Perplexity API (`https://api.perplexity.ai/chat/completions`)

**Output:**
```typescript
{
  results: string;      // Research findings
  citations: string[];  // Source URLs
}
```

---

### Step 3: Generate Landing Page Spec

**File:** `workflows/steps/generate-text-step.ts`

**Purpose:** Create detailed landing page specification

**Process:**
1. Combines brand data, campaign description, and research
2. Uses GPT-4o to generate comprehensive spec including:
   - Headline & subheadline
   - Hero section
   - Value propositions (3-5 benefits)
   - Social proof elements
   - Feature highlights
   - Final CTA section
   - SEO optimization

**AI Model:** GPT-4o via OpenAI API

**Prompt Includes:**
- ⚠️ CRITICAL FACTUAL ACCURACY INSTRUCTIONS
- Brand information from scrape
- Campaign description
- Market research data
- Brand content sample
- Target URL for CTAs

**Output:**
```typescript
{
  text: string;    // Detailed specification
  model: string;   // "gpt-4o"
  format: string;  // "text"
}
```

---

### Step 4: Generate Landing Page Images

**File:** `workflows/steps/fal-image-generation-step.ts`

**Purpose:** Create 3 custom images for the landing page

**Process:**
1. Filters brand images to supported formats (PNG, JPG, WEBP - excludes SVG, ICO)
2. Downloads and rehosts brand images to Vercel Blob
3. Analyzes landing page spec
4. Generates 3 different prompts for:
   - Hero image
   - Feature/benefit visualization
   - Supporting imagery
5. Uses Fal.ai Flux model to generate images
6. Uploads generated images to Vercel Blob Storage

**External APIs:**
- Fal.ai API (`fal-ai/flux/schnell`)
- Vercel Blob Storage

**Output:**
```typescript
{
  generatedImages: Array<{
    name: string;
    blobUrl: string;
  }>;
  method: string; // "user_reference" | "brand_assets" | "spec_only"
}
```

---

### Step 5: Generate HTML with Claude Opus 4.5

**File:** `workflows/steps/claude-generate-html-step.ts`

**Purpose:** Generate complete, standalone HTML landing page with inline CSS

**Process:**
1. Calls Anthropic API with Claude Opus 4.5 model
2. Provides comprehensive prompt including:
   - Landing page specification from Step 3
   - Brand assets (title, description, OG image, favicon)
   - Generated images from Step 4 with blob URLs
   - Brand screenshot URL for visual guidance
   - Full Firecrawl branding data (colors, fonts, personality)
   - Target URL for all CTAs
3. Claude generates:
   - Complete HTML document starting with `<!DOCTYPE html>`
   - All CSS inline in `<style>` tag in `<head>`
   - Modern, responsive design with Tailwind-style utility classes
   - Conversion-focused layout with clear visual hierarchy
   - Proper SEO meta tags (title, description, og:tags)
   - All images strategically placed using generated blob URLs
   - All buttons/CTAs linking to target URL
4. Cleans up any markdown code blocks if present
5. Validates HTML structure

**AI Model:** Claude Opus 4.5 (`claude-opus-4-5-20251101`) via Anthropic API

**Key Features:**
- **Max Tokens:** 35,000 (allows complete page generation)
- **No external dependencies:** Everything inline (CSS, images via URLs)
- **No JavaScript:** Pure HTML and CSS only
- **Mobile-first:** Fully responsive design
- **Conversion-optimized:** Clear CTAs, visual hierarchy, compelling copy
- **Brand-consistent:** Uses Firecrawl branding data

**External APIs:**
- Anthropic API (`https://api.anthropic.com/v1/messages`)

**Output:**
```typescript
{
  html: string;  // Complete HTML document (<!DOCTYPE html>...)
}
```

---

### Step 6: Save to MongoDB (CRITICAL - Before Screenshot!)

**File:** `workflows/steps/save-to-mongodb-step.ts`

**Purpose:** Persist all workflow data to make landing page accessible

**Timing:** This happens **BEFORE** the screenshot is taken (fixed race condition)

**Process:**
1. Uses `updateOne` with `upsert: true` (allows both insert and update)
2. Saves complete workflow data to `workflows` collection
3. Initially sets `screenshotUrl: undefined`
4. Landing page is now accessible at `/landing/[runId]`

**MongoDB Collection:** `blog-agent.workflows`

**Document Structure:**
```typescript
{
  runId: string;
  url: string;
  industry: string;
  brandAssets: {
    title: string;
    description: string;
    ogImage: string;
    favicon: string;
    uploadedAssets: Array<{name, blobUrl}>;
    brandScreenshotUrl: string; // Brand website screenshot
  };
  branding: object; // Full Firecrawl branding data
  campaignDescription: string;
  landingPageSpec: string;
  landingPageHtml: string; // Complete HTML
  referenceImageUrl?: string;
  generatedImages: Array<{name, blobUrl}>;
  liveUrl: string;
  screenshotUrl: undefined; // Will be updated after screenshot
  createdAt: number;
}
```

**Why This Step is Critical:**
- Landing page MUST have data before screenshot is taken
- Prevents 404 screenshots
- Allows users to visit `/landing/[runId]` immediately
- Even if screenshot fails, landing page still works

---

### Step 7: Capture Preview Screenshot

**File:** `workflows/steps/screenshot-step.ts`

**Purpose:** Generate preview image of landing page for gallery

**Timing:** Happens **AFTER** MongoDB save (fixed race condition)

**Process:**
1. Wait 3 seconds for Next.js to process MongoDB data and render page
2. Call Screenshot API with `/landing/[runId]` URL
3. Screenshot API loads the page (data exists in MongoDB!)
4. Captures full-page screenshot
5. Upload screenshot to Vercel Blob Storage
6. Update MongoDB with screenshot URL using second `saveToMongoDBStep` call

**External APIs:**
- Screenshot API (`https://shot.screenshotapi.net/screenshot`)
- Vercel Blob Storage

**Error Handling:**
- Non-critical step - workflow continues if screenshot fails
- Step marked as "success" with `skipped: true` if it fails
- Landing page works fine without screenshot (iframe fallback in gallery)

**Output:**
```typescript
{
  screenshotUrl: string; // Blob storage URL of screenshot
}
```

**MongoDB Update:**
After successful screenshot, the same workflow document is updated with the screenshot URL.

---

## Payment System (x402 Protocol)

### Overview
The workflow endpoint is protected by the x402 payment protocol, requiring $0.01 USDC on Base network.

### Payment Flow

```
1. User submits workflow request with embedded wallet
   ↓
2. Frontend uses @coinbase/cdp-hooks to create payment
   ↓
3. Payment signed with embedded wallet
   ↓
4. X-PAYMENT header added to request
   ↓
5. Server verifies payment with CDP Facilitator
   ↓
6. If valid → Start workflow
   If invalid → Return 402 Payment Required
   ↓
7. Payment settled asynchronously (doesn't block workflow)
```

### Payment Verification

**File:** `lib/payment-verification.ts`

**Functions:**
- `createPaymentRequirements()` - Defines payment terms
- `verifyPayment()` - Validates X-PAYMENT header using CDP Facilitator
- `settlePayment()` - Processes payment on-chain (async)
- `create402Response()` - Returns 402 error with payment info

**Key Components:**
```typescript
// Payment requirements
{
  scheme: 'exact',
  network: 'base',
  maxAmountRequired: '10000', // $0.01 in USDC wei
  resource: 'https://slophub.xyz/api/workflows/untitled-4',
  description: 'Generate AI landing page with workflow execution',
  payTo: process.env.NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS,
  asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
  maxTimeoutSeconds: 120,
}
```

**CDP Facilitator:**
- Used for payment verification on Base mainnet
- Handles EVM payment authorization validation
- Returns payer address and transaction details

**Payment States:**
- **No payment:** Returns 402 with payment requirements
- **Invalid payment:** Returns 402 with error details
- **Valid payment:** Workflow starts, payment settles async

---

## Data Flow

### Input (API Request)

**Endpoint:** `POST /api/workflows/untitled-4`

**Payment:** $0.01 USDC on Base (x402 protocol)

**Request Headers:**
```
Content-Type: application/json
X-PAYMENT: <base64-encoded-payment-proof>
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "campaignDescription": "Q1 2024 product launch campaign...",
  "imageUrl": "https://example.com/reference.jpg" // Optional
}
```

---

### Processing

1. **Payment Verification**
   - Verify X-PAYMENT header with CDP Facilitator
   - Check payment authorization signature
   - Validate amount, network, and asset
   - Settle payment asynchronously

2. **Rate Limiting**
   - Check client IP/identifier
   - 10 requests per hour limit
   - Returns 429 if exceeded

3. **Workflow Initialization**
   - Generates unique `runId`
   - Initializes all steps as "pending"
   - Creates real-time stream for progress updates
   - Saves step status to `workflow_step_status` collection

4. **Step Execution**
   - Each step runs sequentially
   - Status updates: `pending` → `running` → `success`/`error`
   - All step data logged to MongoDB
   - Automatic retries on transient failures
   - Critical: MongoDB save before screenshot

5. **MongoDB Storage**
   - Main workflow data in `workflows` collection
   - Step-by-step progress in `workflow_step_status` collection
   - Detailed logs in `workflow_logs` collection

---

### MongoDB Collections

#### 1. `blog-agent.workflows`
**Purpose:** Stores completed workflow results

**Document Example:**
```json
{
  "runId": "wrun_01KBP9Q8YCKHXD7W77BYCH33X9",
  "url": "https://example.com",
  "industry": "Technology",
  "brandAssets": {
    "title": "Example Corp",
    "description": "Leading tech solutions",
    "ogImage": "https://blob.vercel-storage.com/...",
    "favicon": "https://blob.vercel-storage.com/...",
    "uploadedAssets": [...],
    "brandScreenshotUrl": "https://blob.vercel-storage.com/..."
  },
  "branding": {
    "colorScheme": "modern",
    "colors": { "primary": "#1a73e8", "secondary": "#ea4335" },
    "typography": { "fontFamilies": { "primary": "Inter" } },
    "personality": { "tone": "professional", "energy": "dynamic" }
  },
  "campaignDescription": "Q1 2024 product launch...",
  "landingPageSpec": "Detailed spec text...",
  "landingPageHtml": "<!DOCTYPE html>...",
  "referenceImageUrl": "https://example.com/reference.jpg",
  "generatedImages": [
    { "name": "hero-image", "blobUrl": "https://blob.vercel-storage.com/..." }
  ],
  "liveUrl": "https://slophub.xyz/landing/wrun_...",
  "screenshotUrl": "https://blob.vercel-storage.com/...",
  "createdAt": 1764906418901
}
```

---

#### 2. `blog-agent.workflow_step_status`
**Purpose:** Real-time step progress tracking (cross-instance support)

**Used For:**
- Status API endpoint
- Loading state detection in landing pages
- Progress monitoring in `/workflow/[runId]`

**Document Example:**
```json
{
  "runId": "wrun_01KBP9Q8YCKHXD7W77BYCH33X9",
  "stepId": "generateHtml",
  "stepLabel": "Generate HTML with Claude Opus 4.5",
  "status": "success",
  "timestamp": 1764906418901,
  "detail": {
    "htmlLength": 45678,
    "model": "claude-opus-4-5-20251101"
  },
  "duration": 10234,
  "updatedAt": "2024-01-04T12:00:18.901Z"
}
```

---

### Output (API Response)

**Success (200):**
```json
{
  "runId": "wrun_01KBP9Q8YCKHXD7W77BYCH33X9",
  "liveUrl": "https://slophub.xyz/landing/wrun_01KBP9Q8YCKHXD7W77BYCH33X9"
}
```

**Payment Required (402):**
```json
{
  "x402Version": 1,
  "error": "Payment required",
  "accepts": [
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "10000",
      "resource": "https://slophub.xyz/api/workflows/untitled-4",
      "description": "Generate AI landing page with workflow execution",
      "payTo": "0xAbF01df9428EaD5418473A7c91244826A3Af23b3",
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "maxTimeoutSeconds": 120
    }
  ]
}
```

---

## API Endpoints

### 1. Start Workflow (Protected)

**POST** `/api/workflows/untitled-4`

**Description:** Initiates landing page generation workflow

**Payment:** $0.01 USDC on Base

**Headers:**
```
Content-Type: application/json
X-PAYMENT: <base64-encoded-payment-proof>
```

**Request:**
```typescript
{
  url: string;                 // Target brand URL
  campaignDescription: string; // Campaign details
  imageUrl?: string;          // Optional reference image
}
```

**Response (Success - 200):**
```typescript
{
  runId: string;   // Workflow execution ID
  liveUrl: string; // Landing page URL
}
```

**Response (Payment Required - 402):**
```typescript
{
  x402Version: number;
  error: string;
  accepts: PaymentRequirements[];
}
```

**Response (Rate Limited - 429):**
```typescript
{
  error: string;
  retryAfter: number; // Seconds until next allowed request
}
```

---

### 2. Workflow Status

**GET** `/api/workflows/untitled-4/status?runId={runId}`

**Description:** Get real-time workflow execution status

**Query Parameters:**
- `runId` (required): Workflow execution ID
- `stream` (optional): Enable streaming updates

**Response:**
```typescript
{
  status: 'running' | 'completed' | 'failed' | 'error';
  steps: Array<{
    stepId: string;
    stepLabel: string;
    status: 'pending' | 'running' | 'success' | 'error';
    timestamp: number;
    detail?: any;
    duration?: number;
  }>;
  result?: {
    liveUrl: string;
    screenshotUrl?: string;
  };
}
```

---

### 3. Render Landing Page (Public)

**GET** `/landing/[runId]`

**Description:** Displays generated landing page (publicly accessible)

**Parameters:**
- `runId` (path): Workflow execution ID

**Behavior:**

1. **Check completed workflows:**
   - Queries `workflows` collection
   - If found + has `landingPageHtml` → Render page

2. **Check workflows in progress:**
   - Queries `workflow_step_status` collection
   - If step records exist → Show loading state
   - Message: "Your Landing Page is Being Generated"
   - Estimated time: "Typically takes 3-4 minutes"
   - Link to `/workflow/[runId]` for real-time progress

3. **Return 404:**
   - No data in either collection
   - Shows custom 404 page with navigation

**Example:**
```
https://slophub.xyz/landing/wrun_01KBP9Q8YCKHXD7W77BYCH33X9
```

---

### 4. Gallery

**GET** `/gallery`

**Description:** Shows all generated landing pages

**Process:**
- Fetches all workflows from MongoDB
- Displays grid of landing page thumbnails
- Each card shows:
  - Screenshot (if available) or iframe preview
  - Brand title and industry
  - Campaign description
  - Created date
  - "View Page" link to `/landing/[runId]`

---

### 5. Workflow Monitoring

**GET** `/workflow/[runId]`

**Description:** Real-time workflow execution monitoring

**Features:**
- Server-side fetches initial status
- Client-side polls every 1 second
- Shows step-by-step progress with timeline
- Animated progress bar
- Live updates until completion
- On complete: Shows iframe preview + links

---

## Environment Variables

### Required

```env
# Anthropic API Key (for Claude Opus 4.5)
WORKFLOW_ANTHROPIC_API_KEY=sk-ant-...

# OpenAI API Key (for GPT-4o - spec generation)
OPENAI_API_KEY=sk-...

# Firecrawl API Key
FIRECRAWL_API_KEY=fc-...

# Perplexity API Key
PERPLEXITY_API_KEY=pplx-...

# Fal.ai API Key
FAL_KEY=...

# MongoDB Connection String
MONGODB_URI=mongodb+srv://...

# Vercel Blob Storage Token
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Screenshot API Token
SCREENSHOTAPI_TOKEN=...

# Coinbase Developer Platform (CDP) - Embedded Wallets
NEXT_PUBLIC_CDP_PROJECT_ID=...
CDP_API_KEY_ID=...
CDP_API_KEY_SECRET=...

# x402 Network Configuration
FACILITATOR_URL=https://x402.org/facilitator
NEXT_PUBLIC_NETWORK=base
USDC_CONTRACT_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS=0x...
```

### Optional

```env
# Vercel Team ID (for deployments)
VERCEL_TEAM_ID=team_...

# Vercel API Token
VERCEL_TOKEN=...

# Public URL
NEXT_PUBLIC_URL=https://slophub.xyz
```

---

## External Services

### 1. Firecrawl
- **Purpose:** Web scraping and brand extraction
- **API:** `https://api.firecrawl.dev/v1/scrape`
- **Used In:** Step 1 (Scrape Website)
- **Features:** Metadata extraction, branding analysis, industry classification

### 2. Perplexity AI
- **Purpose:** Market research and data gathering
- **API:** `https://api.perplexity.ai/chat/completions`
- **Model:** `sonar-pro`
- **Used In:** Step 2 (Research Campaign)

### 3. OpenAI
- **Purpose:** AI text generation
- **API:** OpenAI Chat Completions
- **Model:** `gpt-4o`
- **Used In:** Step 3 (Landing Page Spec Generation)

### 4. Anthropic
- **Purpose:** HTML landing page generation
- **API:** `https://api.anthropic.com/v1/messages`
- **Model:** `claude-opus-4-5-20251101`
- **Used In:** Step 5 (Generate HTML with Claude Opus 4.5)

### 5. Fal.ai
- **Purpose:** AI image generation
- **API:** Fal.ai SDK
- **Model:** `fal-ai/flux/schnell`
- **Used In:** Step 4 (Generate Images)

### 6. Screenshot API
- **Purpose:** Capture landing page previews
- **API:** `https://shot.screenshotapi.net/screenshot`
- **Used In:** Step 1 (brand website), Step 7 (landing page)

### 7. Vercel Blob Storage
- **Purpose:** Asset storage (images, screenshots)
- **Used In:** Steps 1, 4, 7 (Upload assets)

### 8. MongoDB
- **Purpose:** Data persistence
- **Database:** `blog-agent`
- **Collections:** `workflows`, `workflow_step_status`, `workflow_logs`
- **Used In:** All steps (logging), Final storage

### 9. Coinbase CDP (x402)
- **Purpose:** Payment verification and settlement
- **Service:** CDP Facilitator
- **Network:** Base mainnet
- **Used In:** Payment verification before workflow starts

---

## Workflow Features

### Durability
- **"use workflow"** directive makes entire process durable
- State persists across failures and restarts
- Workflows can be resumed from last successful step

### Retryability
- **"use step"** directive marks functions as retryable
- Automatic retry on transient failures
- Failed steps don't restart entire workflow

### Real-time Updates
- Uses `WritableStream<StepUpdate>` for progress
- Each step reports status changes
- Saves to `workflow_step_status` collection for cross-instance support
- Frontend can display live progress via polling

### Error Handling
- **Graceful degradation:** Non-critical failures don't stop workflow
- **Detailed logging:** All step data saved to MongoDB
- **Status tracking:** Each step has clear success/error state
- **Screenshot resilience:** Landing page works even if screenshot fails

### Payment Protection
- x402 protocol integration
- $0.01 USDC payment required
- CDP Facilitator verification
- Async settlement (doesn't block workflow)

---

## File Structure

```
blog-agent/
├── app/
│   ├── api/
│   │   ├── workflows/
│   │   │   └── untitled-4/
│   │   │       ├── route.ts          # API endpoint (x402 protected)
│   │   │       └── status/
│   │   │           └── route.ts      # Status polling endpoint
│   │   ├── screenshot/
│   │   │   └── route.ts              # Screenshot endpoint (x402 protected)
│   │   ├── upload/
│   │   │   └── route.ts              # Image upload (origin validated)
│   │   └── gallery/
│   │       └── route.ts              # Gallery data endpoint
│   ├── landing/
│   │   └── [runId]/
│   │       └── page.tsx              # Dynamic landing page (public)
│   ├── workflow/
│   │   └── [runId]/
│   │       └── page.tsx              # Workflow monitoring page
│   ├── gallery/
│   │   └── page.tsx                  # Gallery page
│   ├── not-found.tsx                 # Custom 404 page
│   ├── layout.tsx                    # Root layout with CDP providers
│   ├── providers.tsx                 # CDP wallet providers
│   └── page.tsx                      # Home page with form
│
├── workflows/
│   ├── untitled-4.ts                 # Main workflow orchestrator
│   └── steps/
│       ├── scrape-step.ts            # Step 1: Scraping
│       ├── search-step.ts            # Step 2: Research
│       ├── generate-text-step.ts     # Step 3: Spec generation
│       ├── fal-image-generation-step.ts  # Step 4: Image gen
│       ├── claude-generate-html-step.ts  # Step 5: HTML generation
│       ├── screenshot-step.ts        # Step 7: Screenshot
│       ├── download-and-rehost-images-step.ts  # Helper: Image rehosting
│       ├── upload-assets-step.ts     # Helper: Asset upload
│       ├── save-to-mongodb-step.ts   # Step 6: Data storage
│       └── log-step-data.ts          # Helper: Step logging
│
├── lib/
│   ├── workflow-cache.ts             # Real-time updates cache
│   ├── payment-verification.ts       # x402 payment functions
│   ├── rate-limit.ts                 # Rate limiting utilities
│   ├── payment-logger.ts             # Payment logging
│   └── config.ts                     # CDP configuration
│
├── components/
│   ├── Header.tsx                    # Main header with wallet
│   ├── WalletDropdown.tsx            # Wallet UI component
│   ├── FloatingCTA.tsx               # Landing page CTA
│   ├── workflow-status-client.tsx    # Client-side status polling
│   ├── workflow-progress-bar.tsx     # Progress bar component
│   └── workflow-step-timeline.tsx    # Step timeline component
│
├── scripts/
│   ├── delete-workflows.ts           # Workflow cleanup script
│   └── update-thumbnails.ts          # Thumbnail update script
│
├── next.config.ts                    # Next.js config (with workflow plugin)
├── WORKFLOW.md                       # This file
├── CLAUDE.md                         # Project instructions
└── .env.local                        # Environment variables
```

---

## Workflow Execution Timeline

```
┌──────────────────────────────────────────────────────────────────┐
│ User submits form with embedded wallet                           │
│ ↓ ~100ms                                                         │
│ Payment created and signed                                       │
│ ↓ ~200ms                                                         │
│ API verifies payment with CDP Facilitator                        │
│ ↓ ~300ms                                                         │
│ Payment valid → Workflow starts, payment settles async          │
│ ↓ ~100ms                                                         │
│ Redirect to /workflow/[runId] for live monitoring               │
│ ↓ ~500ms                                                         │
│ Step 1: Firecrawl scrapes + brand screenshot (5-10s)           │
│ ↓ ~8s                                                            │
│ Step 2: Perplexity researches campaign (10-15s)                 │
│ ↓ ~12s                                                           │
│ Step 3: GPT-4o generates spec (5-8s)                            │
│ ↓ ~6s                                                            │
│ Step 4: Fal.ai generates 3 images (15-20s)                      │
│ ↓ ~18s                                                           │
│ Step 5: Claude Opus 4.5 generates HTML (8-12s)                  │
│ ↓ ~10s                                                           │
│ Step 6: Save to MongoDB (100ms) ✓ CRITICAL                      │
│ ↓ ~100ms                                                         │
│ Landing page now accessible at /landing/[runId]                 │
│ ↓ ~3s (wait for Next.js to render)                             │
│ Step 7: Screenshot API captures page (3-5s)                     │
│ ↓ ~5s                                                            │
│ Update MongoDB with screenshot URL                              │
│ ↓ ~100ms                                                         │
│ Workflow complete with screenshot                               │
└──────────────────────────────────────────────────────────────────┘

Total: ~60-80 seconds (~3-4 minutes with buffers)
```

---

## Error Recovery

### Automatic Retry
Steps with transient failures (API timeouts, rate limits) automatically retry:

```typescript
async function myStep() {
  "use step";  // Marks this as retryable

  // If this throws, step retries automatically
  const result = await externalAPI();

  return result;
}
```

### Non-Recoverable Errors
Use `FatalError` for errors that shouldn't retry:

```typescript
import { FatalError } from 'workflow';

async function myStep() {
  "use step";

  if (invalidInput) {
    throw new FatalError('Invalid configuration');
  }
}
```

### Workflow Resumption
If server crashes during execution:
1. Workflow state is persisted
2. On restart, workflow resumes from last completed step
3. No need to re-run expensive operations

---

## Monitoring & Debugging

### Real-time Progress
Access workflow progress via status API:

```typescript
const response = await fetch(
  `/api/workflows/untitled-4/status?runId=${runId}`
);
const { status, steps } = await response.json();
```

### MongoDB Logs
Each step logs detailed data to MongoDB:

```typescript
await logStepDataStep({
  runId,
  stepName: 'scrape',
  stepData: {
    metadata: {...},
    timestamp: Date.now()
  }
});
```

### Console Logging
All steps include descriptive console.log statements:

```typescript
console.log('[Workflow] Step started', { timestamp: Date.now() });
console.log('[Workflow] Step completed', { duration, result });
```

---

## Support & Documentation

**Vercel Workflow Docs:** `/Users/ashnouruzi/workflow-docs/`
**Quick Reference:** `WORKFLOW_QUICK_REFERENCE.md`
**Examples Analysis:** `WORKFLOW_EXAMPLES_ANALYSIS.md`
**Project Instructions:** `CLAUDE.md`
**x402 Documentation:** `/Users/ashnouruzi/x402-docs/`

---

## Best Practices

### Adding New Steps
1. Create a step file in `workflows/steps/`.
2. Add the `"use step"` directive.
3. Add your step to the `WORKFLOW_STEPS` array.
4. Import the step in `untitled-4.ts`.
5. Call the step in the workflow sequence.
6. Update progress tracking.
7. **IMPORTANT:** If step affects landing page data, ensure MongoDB save happens before screenshot!

### Modifying Existing Steps
1. Review the step file first.
2. Maintain the input/output interface.
3. Test the retry behavior.
4. Update the MongoDB schema if needed.
5. **CRITICAL:** Don't change the order of MongoDB save (Step 6) and screenshot (Step 7)!

### Payment Integration
1. Use `payment-verification.ts` functions
2. Always verify before starting expensive operations
3. Settle async to avoid blocking workflow
4. Log all payment events for debugging

### Landing Page States
1. Always check both `workflows` and `workflow_step_status` collections
2. Provide clear user feedback for all states (completed, in-progress, 404)
3. Link to workflow monitoring page for real-time updates
4. Keep landing pages public (no auth required)
