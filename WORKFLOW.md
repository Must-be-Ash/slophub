# Blog Agent Workflow Documentation

## Overview

Blog Agent is an AI-powered landing page generator that creates conversion-focused landing pages from a brand URL and campaign description. The application uses the Vercel Workflow framework for durable, retryable execution and generates dynamic landing pages accessible at `/landing-{runId}`.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│                  (Form: URL + Campaign Description)              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Route: /api/workflows/untitled-4          │
│                    (POST with input data)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Workflow Execution                          │
│               (Durable, Retryable Process)                       │
│                                                                   │
│  Step 1: Scrape Website & Upload Assets                         │
│  Step 2: Research Campaign Data                                 │
│  Step 3: Generate Landing Page Spec                             │
│  Step 4: Generate Landing Page Images                           │
│  Step 5: Create Landing Page                                    │
│  Step 6: Render Landing Page HTML                               │
│  Step 7: Capture Preview Screenshot                             │
│                                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MongoDB Storage                            │
│           (Stores: HTML, Spec, Images, Metadata)                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Dynamic Route: /landing-[runId]                     │
│         (Fetches & Renders HTML from MongoDB)                   │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow Steps

### Step 1: Scrape Website & Upload Assets

**File:** `workflows/steps/scrape-step.ts`

**Purpose:** Extract brand information and assets from the target URL

**Process:**
1. Calls Firecrawl API to scrape the target website
2. Extracts:
   - Metadata (title, description, OG image, favicon)
   - Markdown content
   - Comprehensive branding data
   - Industry classification
3. Uploads OG image and favicon to Vercel Blob Storage

**External APIs:**
- Firecrawl API (`https://api.firecrawl.dev/v1/scrape`)
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
  branding: object;
  uploadedAssets: Array<{ name: string; blobUrl: string }>;
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
1. Analyzes landing page spec
2. Generates 3 different prompts for:
   - Hero image
   - Feature/benefit visualization
   - Supporting imagery
3. Uses Fal.ai Flux model to generate images
4. Uploads generated images to Vercel Blob Storage

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
}
```

---

### Step 5: Create Landing Page

**File:** `workflows/steps/create-chat-step.ts`

**Purpose:** Generate complete Next.js landing page code

**Process:**
1. Sends comprehensive prompt to V0.dev
2. Includes:
   - Landing page spec
   - Generated image URLs
   - Brand assets (OG image, favicon)
   - Target URL for CTAs
3. V0 generates production-ready TSX code

**External APIs:**
- V0.dev API (`https://api.v0.dev/api/generate`)

**Requirements:**
- All components inline in single file
- Full Tailwind CSS styling
- All links point to target URL
- No navigation menu or footer links
- Conversion-focused layout

**Output:**
```typescript
{
  blogPage: string;  // Complete TSX code
  model: string;     // V0 model used
}
```

---

### Step 6: Render Landing Page HTML

**File:** `workflows/steps/render-landing-page-html-step.ts`

**Purpose:** Convert TSX to standalone HTML

**Process:**
1. Takes TSX code from Step 5
2. Uses GPT-4o to convert to static HTML:
   - Extracts Tailwind classes → inline `<style>` tag
   - Converts React components → plain HTML
   - Removes JSX/React syntax
   - Adds complete `<!DOCTYPE html>` structure
   - Includes SEO meta tags
   - Makes all styles inline
3. Cleans up markdown code blocks if present

**AI Model:** GPT-4o via OpenAI API

**Output:**
```typescript
{
  html: string;  // Self-contained HTML document
}
```

---

### Step 7: Capture Preview Screenshot

**File:** `workflows/steps/screenshot-step.ts`

**Purpose:** Generate preview image of landing page

**Status:** Currently skipped (will be implemented after deployment)

**Planned Process:**
1. Wait for page to be live
2. Use screenshot service to capture page
3. Upload screenshot to Vercel Blob Storage

**Output:**
```typescript
{
  screenshotUrl?: string;
}
```

---

## Data Flow

### Input (API Request)

**Endpoint:** `POST /api/workflows/untitled-4`

**Request Body:**
```json
{
  "url": "https://example.com",
  "campaignDescription": "Q1 2024 product launch campaign...",
  "imageUrl": "https://example.com/reference.jpg" // Optional
}
```

### Processing

1. **Workflow Initialization**
   - Generates unique `runId`
   - Initializes all steps as "pending"
   - Creates real-time stream for progress updates

2. **Step Execution**
   - Each step runs sequentially
   - Status updates: `pending` → `running` → `success`/`error`
   - All step data logged to MongoDB
   - Automatic retries on transient failures

3. **MongoDB Storage**

**Collection:** `blog-agent.workflows`

**Document Structure:**
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
    "uploadedAssets": [...]
  },
  "branding": { /* Comprehensive Firecrawl data */ },
  "campaignDescription": "Q1 2024 product launch...",
  "landingPageSpec": "Detailed spec text...",
  "landingPageHtml": "<!DOCTYPE html>...",
  "referenceImageUrl": "https://example.com/reference.jpg",
  "generatedImages": [
    {
      "name": "hero-image",
      "blobUrl": "https://blob.vercel-storage.com/..."
    }
  ],
  "liveUrl": "https://blog-agent-nine.vercel.app/landing-wrun_...",
  "screenshotUrl": null,
  "createdAt": 1764906418901
}
```

### Output (API Response)

```json
{
  "runId": "wrun_01KBP9Q8YCKHXD7W77BYCH33X9",
  "liveUrl": "https://blog-agent-nine.vercel.app/landing-wrun_01KBP9Q8YCKHXD7W77BYCH33X9"
}
```

---

## API Endpoints

### 1. Start Workflow

**POST** `/api/workflows/untitled-4`

**Description:** Initiates landing page generation workflow

**Request:**
```typescript
{
  url: string;                 // Target brand URL
  campaignDescription: string; // Campaign details
  imageUrl?: string;          // Optional reference image
}
```

**Response:**
```typescript
{
  runId: string;   // Workflow execution ID
  liveUrl: string; // Landing page URL
}
```

**Example:**
```bash
curl -X POST https://blog-agent-nine.vercel.app/api/workflows/untitled-4 \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "campaignDescription": "Launch campaign for new product"
  }'
```

---

### 2. Render Landing Page

**GET** `/landing-[runId]`

**Description:** Displays generated landing page

**Parameters:**
- `runId` (path): Workflow execution ID

**Process:**
1. Fetches workflow data from MongoDB
2. Renders HTML using `dangerouslySetInnerHTML`
3. Returns 404 if not found

**Example:**
```
https://blog-agent-nine.vercel.app/landing-wrun_01KBP9Q8YCKHXD7W77BYCH33X9
```

---

## Environment Variables

### Required

```env
# OpenAI API Key (for GPT-4o)
OPENAI_API_KEY=sk-...

# Firecrawl API Key
FIRECRAWL_API_KEY=fc-...

# Perplexity API Key
PERPLEXITY_API_KEY=pplx-...

# V0.dev API Key
V0_API_KEY=v0-...

# Fal.ai API Key
FAL_KEY=...

# MongoDB Connection String
MONGODB_URI=mongodb+srv://...

# Vercel Blob Storage Token
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### Optional

```env
# Vercel Team ID (for deployments)
VERCEL_TEAM_ID=team_...

# Vercel API Token
VERCEL_TOKEN=...
```

---

## External Services

### 1. Firecrawl
- **Purpose:** Web scraping and brand extraction
- **API:** `https://api.firecrawl.dev/v1/scrape`
- **Used In:** Step 1 (Scrape Website)

### 2. Perplexity AI
- **Purpose:** Market research and data gathering
- **API:** `https://api.perplexity.ai/chat/completions`
- **Model:** `sonar-pro`
- **Used In:** Step 2 (Research Campaign)

### 3. OpenAI
- **Purpose:** AI text generation
- **API:** OpenAI Chat Completions
- **Model:** `gpt-4o`
- **Used In:** Steps 3 (Spec), 6 (HTML Rendering)

### 4. V0.dev (Vercel)
- **Purpose:** Landing page code generation
- **API:** `https://api.v0.dev/api/generate`
- **Used In:** Step 5 (Create Landing Page)

### 5. Fal.ai
- **Purpose:** AI image generation
- **API:** Fal.ai SDK
- **Model:** `fal-ai/flux/schnell`
- **Used In:** Step 4 (Generate Images)

### 6. Vercel Blob Storage
- **Purpose:** Asset storage (images)
- **Used In:** Steps 1, 4 (Upload assets)

### 7. MongoDB
- **Purpose:** Data persistence
- **Database:** `blog-agent`
- **Collection:** `workflows`
- **Used In:** All steps (logging), Final storage

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
- Frontend can display live progress

### Error Handling
- **Graceful degradation:** Non-critical failures don't stop workflow
- **Detailed logging:** All step data saved to MongoDB
- **Status tracking:** Each step has clear success/error state

---

## File Structure

```
blog-agent/
├── app/
│   ├── api/
│   │   └── workflows/
│   │       └── untitled-4/
│   │           └── route.ts          # API endpoint
│   └── landing-[runId]/
│       └── page.tsx                  # Dynamic landing page route
│
├── workflows/
│   ├── untitled-4.ts                 # Main workflow orchestrator
│   └── steps/
│       ├── scrape-step.ts            # Step 1: Scraping
│       ├── search-step.ts            # Step 2: Research
│       ├── generate-text-step.ts     # Step 3: Spec generation
│       ├── fal-image-generation-step.ts  # Step 4: Image gen
│       ├── create-chat-step.ts       # Step 5: Page creation
│       ├── render-landing-page-html-step.ts  # Step 6: HTML render
│       ├── screenshot-step.ts        # Step 7: Screenshot
│       ├── upload-assets-step.ts     # Helper: Asset upload
│       ├── save-to-mongodb-step.ts   # Helper: Data storage
│       └── log-step-data.ts          # Helper: Step logging
│
├── lib/
│   └── workflow-cache.ts             # Real-time updates cache
│
├── microfrontends.json               # Microfrontends config
├── next.config.ts                    # Next.js config
└── .env.local                        # Environment variables
```

---

## Workflow Execution Timeline

```
┌──────────────────────────────────────────────────────────────────┐
│ User submits form                                                 │
│ ↓ ~100ms                                                         │
│ API receives request, generates runId                            │
│ ↓ ~500ms                                                         │
│ Step 1: Firecrawl scrapes website (5-10s)                       │
│ ↓ ~8s                                                            │
│ Step 2: Perplexity researches campaign (10-15s)                 │
│ ↓ ~12s                                                           │
│ Step 3: GPT-4o generates spec (5-8s)                            │
│ ↓ ~6s                                                            │
│ Step 4: Fal.ai generates 3 images (15-20s)                      │
│ ↓ ~18s                                                           │
│ Step 5: V0 creates landing page (10-15s)                        │
│ ↓ ~12s                                                           │
│ Step 6: GPT-4o renders HTML (5-8s)                              │
│ ↓ ~6s                                                            │
│ Step 7: Screenshot (skipped) (0s)                               │
│ ↓ ~100ms                                                         │
│ MongoDB save & workflow complete                                │
│ ↓ instant                                                        │
│ Landing page live at /landing-{runId}                           │
└──────────────────────────────────────────────────────────────────┘

Total: ~60-80 seconds
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
Access workflow progress via `workflow-cache.ts`:

```typescript
import { getStepUpdates } from '@/lib/workflow-cache';

const updates = getStepUpdates(runId);
// Returns array of step statuses
```

### MongoDB Logs
Each step logs detailed data:

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
console.log('[WORKFLOW] Step started', { timestamp: Date.now() });
console.log('[WORKFLOW] Step completed', { duration, result });
```

---

## Best Practices

### Adding New Steps
1. Create step file in `workflows/steps/`
2. Use `"use step"` directive
3. Add to `WORKFLOW_STEPS` array
4. Import in `untitled-4.ts`
5. Call in workflow sequence
6. Update progress tracking

### Modifying Existing Steps
1. Read step file first
2. Maintain input/output interface
3. Test retry behavior
4. Update MongoDB schema if needed

### Testing Failures
Simulate random failures for testing:

```typescript
async function myStep() {
  "use step";

  // 30% failure rate for testing
  if (Math.random() < 0.3) {
    throw new Error('Simulated failure');
  }

  // actual logic
}
```

---

## Performance Optimization

### Parallel Execution
Where possible, steps run in parallel:

```typescript
const [result1, result2] = await Promise.all([
  step1(),
  step2()
]);
```

### Caching
- Workflow state cached in memory
- MongoDB queries optimized
- Blob storage uses CDN

### Cost Optimization
- Use appropriate AI models (GPT-4o only where needed)
- Compress images before upload
- Efficient MongoDB queries

---

## Security

### API Keys
- All sensitive keys in environment variables
- Never committed to git
- Different keys for dev/production

### Input Validation
- URL validation before processing
- Sanitize campaign descriptions
- Rate limiting on API endpoints

### MongoDB Security
- Connection string encrypted
- Read/write permissions scoped
- Regular backups

---

## Future Enhancements

### Planned Features
- [ ] Screenshot capture implementation
- [ ] A/B testing support
- [ ] Custom branding themes
- [ ] Analytics integration
- [ ] Multi-language support
- [ ] Template library

### Potential Optimizations
- [ ] Parallel image generation
- [ ] Incremental static regeneration
- [ ] Edge caching for landing pages
- [ ] Webhook notifications on completion

---

## Troubleshooting

### Common Issues

**Issue:** "OPENAI_API_KEY is not configured"
- **Solution:** Add API key to `.env.local`

**Issue:** Workflow stuck on a step
- **Solution:** Check MongoDB logs, verify external API status

**Issue:** Landing page not rendering
- **Solution:** Check MongoDB for `landingPageHtml` field

**Issue:** Images not loading
- **Solution:** Verify Vercel Blob Storage token, check CORS

**Issue:** Build error with imports
- **Solution:** Ensure all dependencies installed: `pnpm install`

---

## Support & Documentation

- **Vercel Workflow Docs:** `/Users/ashnouruzi/workflow-docs/`
- **Quick Reference:** `WORKFLOW_QUICK_REFERENCE.md`
- **Examples Analysis:** `WORKFLOW_EXAMPLES_ANALYSIS.md`
- **Project Instructions:** `CLAUDE.md`

---

## Version History

- **v1.0.0** - Initial release with standalone deployments
- **v2.0.0** - Migrated to dynamic routes (current)
- **v2.1.0** - Added HTML rendering step

Last Updated: December 4, 2025
