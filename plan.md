Project overview:

1. based on user's manually input URL. 2. scrape the site and it's brand (brand assets, colour palate, font, favicon, logo, metadata, og image, and style). 3. search the web for related news based on the site's industry (for example if it's crypto related, search for crypto news). 5. write a spec (prompt for a site page) make a blog post site that's SEO optomized using an LLM. 6. have v0 make a blog page

This plan outlines a phased MVP approach to build the URL input frontend with workflow tracking and results display.

  Key Highlights of the Plan:

  5 Critical Files:
  1. /app/page.tsx - Replace with URL input form
  2. /app/api/workflows/untitled-4/route.ts - Modify to return runId
  3. /app/api/workflows/untitled-4/status/route.ts - New status endpoint
  4. /app/workflow/[runId]/page.tsx - New status page
  5. /components/workflow-status-client.tsx - New polling component

  Implementation Features:
  - URL validation on the form
  - Workflow triggering with runId tracking
  - Status polling every 2 seconds
  - Three UI states: running, completed, failed
  - Navigation flow: home → status page → back to home
  - Dark mode support (already configured)
  - Error handling throughout

  Important Note: The plan accounts for the fact that the workflow step implementations
  (scrape-step.ts, search-step.ts, etc.) don't exist yet, but the frontend will work once those
   are implemented separately.

  The plan is ready for your review and approval!
                                                                                              
⏺ User approved Claude's plan
  ⎿  Plan saved to: ~/.claude/plans/wise-rolling-platypus.md · /plan to edit
     Implementation Plan: URL Input Frontend for Blog Generation Workflow

     Overview

     Build a Next.js frontend that allows users to input a URL, trigger the blog generation 
     workflow, and track progress with real-time updates showing the final generated blog page.

     User Requirements

     - Input: Form with URL input field on home page
     - Trigger: Submit form starts the workflow
     - Redirect: After submission, navigate to status/results page
     - Progress: Show workflow progress (4 steps: scrape → search → generate spec → create 
     blog)
     - Results: Display the final generated blog page

     Implementation Approach: Phased MVP

     Phase 1: Core Functionality (MVP)

     Basic working flow without advanced features. Estimated time: 4-6 hours.

     ---
     Critical Files

     Files to Modify

     1. /app/page.tsx - Replace with URL input form (client component)
     2. /app/api/workflows/untitled-4/route.ts - Modify to return runId for tracking

     Files to Create

     3. /app/workflow/[runId]/page.tsx - Dynamic status page (server component)
     4. /components/workflow-status-client.tsx - Status polling and display (client component)
     5. /app/api/workflows/untitled-4/status/route.ts - GET endpoint for status checking

     ---
     Detailed Implementation Steps

     Step 1: Replace Home Page with URL Input Form

     File: /app/page.tsx

     Action: Replace entire content with a client component form

     Key Implementation Details:
     'use client';

     import { useState } from 'react';
     import { useRouter } from 'next/navigation';

     export default function Home() {
       const [url, setUrl] = useState('');
       const [loading, setLoading] = useState(false);
       const [error, setError] = useState<string | null>(null);
       const router = useRouter();

       const validateUrl = (url: string): string | null => {
         if (!url.trim()) return 'URL is required';
         try {
           const parsed = new URL(url);
           if (!parsed.protocol.startsWith('http')) {
             return 'URL must start with http:// or https://';
           }
           return null;
         } catch {
           return 'Please enter a valid URL';
         }
       };

       const handleSubmit = async (e: React.FormEvent) => {
         e.preventDefault();

         const validationError = validateUrl(url);
         if (validationError) {
           setError(validationError);
           return;
         }

         setLoading(true);
         setError(null);

         try {
           const response = await fetch('/api/workflows/untitled-4', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ url }),
           });

           if (!response.ok) {
             const data = await response.json();
             throw new Error(data.error || 'Failed to start workflow');
           }

           const { runId } = await response.json();
           router.push(`/workflow/${runId}`);
         } catch (err) {
           setError(err instanceof Error ? err.message : 'Failed to start workflow');
           setLoading(false);
         }
       };

       return (
         <main className="min-h-screen flex items-center justify-center p-8">
           <div className="w-full max-w-2xl">
             <div className="text-center mb-8">
               <h1 className="text-4xl font-bold mb-4">Blog Generator</h1>
               <p className="text-gray-600 dark:text-gray-400">
                 Generate SEO-optimized blog posts from any website
               </p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <input
                   type="text"
                   value={url}
                   onChange={(e) => setUrl(e.target.value)}
                   placeholder="https://example.com"
                   className="w-full px-4 py-3 rounded-lg border border-gray-300 
     dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground focus:outline-none 
     focus:ring-2 focus:ring-blue-500"
                   disabled={loading}
                 />
                 {error && (
                   <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                     {error}
                   </p>
                 )}
               </div>

               <button
                 type="submit"
                 disabled={loading}
                 className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
      text-white font-medium rounded-lg transition-colors"
               >
                 {loading ? 'Starting Workflow...' : 'Generate Blog'}
               </button>
             </form>
           </div>
         </main>
       );
     }

     Styling Notes:
     - Uses Tailwind CSS classes consistent with existing codebase
     - Supports dark mode via dark: variants (already configured in globals.css)
     - Centered layout with max-width container
     - Accessible form with proper labels and error states

     ---
     Step 2: Modify API Route to Return runId

     File: /app/api/workflows/untitled-4/route.ts

     Action: Modify the POST handler to return runId from the workflow execution

     Changes:
     import { start } from 'workflow/api';
     import { untitled4Workflow } from '@/workflows/untitled-4';
     import { NextResponse } from 'next/server';

     export async function POST(request: Request) {
       try {
         const body = await request.json();

         // Validate URL
         if (!body.url || typeof body.url !== 'string') {
           return NextResponse.json(
             { error: 'URL is required and must be a string' },
             { status: 400 }
           );
         }

         // Basic URL validation
         try {
           new URL(body.url);
         } catch {
           return NextResponse.json(
             { error: 'Invalid URL format' },
             { status: 400 }
           );
         }

         // Start the workflow execution
         const run = await start(untitled4Workflow, [body]);

         // CHANGED: Return runId instead of just success
         return NextResponse.json({
           success: true,
           runId: run.runId,
           message: 'Workflow started successfully',
         });
       } catch (error) {
         console.error('Workflow start error:', error);
         return NextResponse.json(
           {
             success: false,
             error: error instanceof Error ? error.message : 'Unknown error',
           },
           { status: 500 }
         );
       }
     }

     Key Changes:
     - Added URL validation before starting workflow
     - Changed return to include runId: run.runId
     - Added error logging for debugging
     - Return 400 status for validation errors, 500 for server errors

     ---
     Step 3: Create Status API Endpoint

     File: /app/api/workflows/untitled-4/status/route.ts (NEW)

     Action: Create GET endpoint to check workflow status

     Implementation:
     import { getRun } from 'workflow/api';
     import { NextResponse } from 'next/server';

     export async function GET(request: Request) {
       try {
         const { searchParams } = new URL(request.url);
         const runId = searchParams.get('runId');

         if (!runId) {
           return NextResponse.json(
             { error: 'runId query parameter is required' },
             { status: 400 }
           );
         }

         // Retrieve the workflow run by ID
         const run = getRun(runId);

         // Get current status
         const status = await run.status;

         // If completed, get the result (non-blocking since already complete)
         let result = null;
         if (status === 'completed') {
           result = await run.returnValue;
         }

         return NextResponse.json({
           status,  // 'running' | 'completed' | 'failed'
           result,
           runId,
         });
       } catch (error) {
         console.error('Status check error:', error);
         return NextResponse.json(
           {
             error: error instanceof Error ? error.message : 'Workflow not found',
           },
           { status: 404 }
         );
       }
     }

     API Contract:
     - Request: GET /api/workflows/untitled-4/status?runId=abc123
     - Response (running): { status: 'running', result: null, runId: 'abc123' }
     - Response (completed): { status: 'completed', result: { ... }, runId: 'abc123' }
     - Response (failed): { status: 'failed', result: null, runId: 'abc123' }

     ---
     Step 4: Create Status Page (Server Component)

     File: /app/workflow/[runId]/page.tsx (NEW)

     Action: Create dynamic route for workflow status page

     Implementation:
     import { WorkflowStatusClient } from '@/components/workflow-status-client';

     export default async function WorkflowPage({
       params
     }: {
       params: { runId: string }
     }) {
       // Fetch initial status server-side
       const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

       let initialData;
       try {
         const response = await fetch(
           `${baseUrl}/api/workflows/untitled-4/status?runId=${params.runId}`,
           { cache: 'no-store' }
         );

         if (!response.ok) {
           initialData = { status: 'error', error: 'Workflow not found' };
         } else {
           initialData = await response.json();
         }
       } catch (error) {
         initialData = { status: 'error', error: 'Failed to fetch workflow status' };
       }

       return (
         <main className="min-h-screen p-8">
           <WorkflowStatusClient
             runId={params.runId}
             initialData={initialData}
           />
         </main>
       );
     }

     // Optional: Generate metadata for SEO
     export function generateMetadata({ params }: { params: { runId: string } }) {
       return {
         title: `Blog Generation - ${params.runId.slice(0, 8)}`,
         description: 'Generating your SEO-optimized blog post',
       };
     }

     Notes:
     - Server component (no 'use client')
     - Fetches initial status server-side for faster initial render
     - Passes data to client component for polling
     - Uses cache: 'no-store' to ensure fresh data
     - Requires NEXT_PUBLIC_URL environment variable (or defaults to localhost)

     ---
     Step 5: Create Status Client Component

     File: /components/workflow-status-client.tsx (NEW)

     Action: Create client component for polling and displaying status

     Implementation:
     'use client';

     import { useState, useEffect } from 'react';
     import { useRouter } from 'next/navigation';

     type WorkflowStatus = 'running' | 'completed' | 'failed' | 'error';

     interface WorkflowStatusClientProps {
       runId: string;
       initialData: {
         status: WorkflowStatus;
         result?: any;
         error?: string;
       };
     }

     export function WorkflowStatusClient({
       runId,
       initialData
     }: WorkflowStatusClientProps) {
       const [status, setStatus] = useState<WorkflowStatus>(initialData.status);
       const [result, setResult] = useState(initialData.result);
       const [error, setError] = useState(initialData.error);
       const router = useRouter();

       useEffect(() => {
         // Don't poll if already in terminal state
         if (status === 'completed' || status === 'failed' || status === 'error') {
           return;
         }

         // Poll every 2 seconds
         const interval = setInterval(async () => {
           try {
             const response = await fetch(
               `/api/workflows/untitled-4/status?runId=${runId}`
             );

             if (!response.ok) {
               setStatus('error');
               setError('Failed to check workflow status');
               return;
             }

             const data = await response.json();
             setStatus(data.status);

             if (data.status === 'completed') {
               setResult(data.result);
             }
           } catch (err) {
             console.error('Polling error:', err);
             setStatus('error');
             setError('Network error while checking status');
           }
         }, 2000);

         return () => clearInterval(interval);
       }, [runId, status]);

       // Render different UI based on status
       if (status === 'error' || status === 'failed') {
         return (
           <div className="max-w-2xl mx-auto">
             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 
     dark:border-red-800 rounded-lg p-6">
               <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">
                 Workflow Failed
               </h2>
               <p className="text-red-700 dark:text-red-300 mb-4">
                 {error || 'An error occurred while generating the blog post.'}
               </p>
               <button
                 onClick={() => router.push('/')}
                 className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
     transition-colors"
               >
                 Try Again
               </button>
             </div>
           </div>
         );
       }

       if (status === 'running') {
         return (
           <div className="max-w-2xl mx-auto">
             <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 
     dark:border-blue-800 rounded-lg p-8">
               <h2 className="text-2xl font-bold mb-4">Generating Blog Post...</h2>

               <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="animate-spin h-5 w-5 border-2 border-blue-600 
     border-t-transparent rounded-full"></div>
                   <span className="text-gray-700 dark:text-gray-300">
                     Workflow is running
                   </span>
                 </div>

                 <p className="text-sm text-gray-600 dark:text-gray-400">
                   This may take a few minutes. The workflow includes:
                 </p>

                 <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                   <li className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                     Scraping the website
                   </li>
                   <li className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                     Searching for industry news
                   </li>
                   <li className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                     Generating blog specification
                   </li>
                   <li className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                     Creating the blog page
                   </li>
                 </ul>
               </div>
             </div>
           </div>
         );
       }

       if (status === 'completed' && result) {
         return (
           <div className="max-w-4xl mx-auto">
             <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 
     dark:border-green-800 rounded-lg p-6 mb-6">
               <h2 className="text-2xl font-bold text-green-900 dark:text-green-200">
                 ✓ Blog Post Generated Successfully!
               </h2>
             </div>

             <div className="bg-white dark:bg-gray-800 border border-gray-200 
     dark:border-gray-700 rounded-lg p-8">
               <h3 className="text-xl font-bold mb-4">Generated Content</h3>
               <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-4 
     rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                 {JSON.stringify(result, null, 2)}
               </pre>
             </div>

             <div className="mt-6 flex gap-4">
               <button
                 onClick={() => router.push('/')}
                 className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
     transition-colors"
               >
                 Generate Another Blog
               </button>
             </div>
           </div>
         );
       }

       return null;
     }

     Features:
     - Polling with 2-second interval
     - Three UI states: running, completed, failed
     - Automatic cleanup of interval on unmount
     - Loading animation with spinner
     - Displays workflow result when completed
     - "Try Again" and "Generate Another" buttons for navigation

     ---
     Environment Setup

     Required Environment Variables:

     Add to .env.local (if not already present):
     # For server-side API calls
     NEXT_PUBLIC_URL=http://localhost:3000  # Change to production URL when deploying

     # Already configured in .env.local:
     FIRECRAWL_API_KEY=fc-055ec30708674630b656ac0718e69b3f
     PERPLEXITY_API_KEY=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
     AI_GATEWAY_API_KEY=vck_0EJkkGnRLRIZrjCjH1WvWCGrGvjXg60d3K8ItpiYlL9njxCAgz0pKDU5
     V0_API_KEY=v1:team_bo3xaOOnc2SnYVyRXAJzVWd9:yfPdd2g6dqu3g6IKN8kDcDXO
     OPENAI_API_KEY=sk-proj-...

     ---
     Important Notes

     Workflow Input Handling

     The workflow file shows this template syntax: {{mVzHdOrlgSbQT7r5ILhno.url}}

     This ID (mVzHdOrlgSbQT7r5ILhno) represents the workflow input. The Workflow framework 
     automatically injects the arguments passed to start():

     // API route passes body as first argument
     await start(untitled4Workflow, [body]);

     // Body structure: { url: "https://example.com" }
     // In workflow, accessed via: {{mVzHdOrlgSbQT7r5ILhno.url}}

     No changes needed to the workflow file - the template system handles parameter access 
     automatically.

     Workflow File Warning

     The workflow file (/workflows/untitled-4.ts) has a warning:
     DO NOT EDIT MANUALLY - regenerate from the workflow editor instead.

     For MVP: We will NOT modify this file. The template interpolation works with the current 
     structure.

     For Phase 2 (future enhancement): If we need to add progress updates with getWritable(), 
     we should either:
     1. Check if the workflow editor supports adding progress events
     2. Or carefully edit the file and document the changes

     Missing Step Implementations

     The workflow imports 4 step functions that don't exist yet:
     - /workflows/steps/scrape-step.ts
     - /workflows/steps/search-step.ts
     - /workflows/steps/generate-text-step.ts
     - /workflows/steps/create-chat-step.ts

     These step files must be created before the workflow can run successfully. However, they 
     are out of scope for this frontend task. The frontend implementation will work once these 
     steps are implemented separately.

     ---
     Testing the Implementation

     Local Development Testing

     1. Start dev server: pnpm dev
     2. Navigate to: http://localhost:3000
     3. Test flow:
       - Enter a valid URL (e.g., https://anthropic.com)
       - Click "Generate Blog"
       - Should redirect to /workflow/[runId]
       - Should show "Generating Blog Post..." with spinner
       - Should poll status every 2 seconds

     Test Cases

     Form Validation:
     - Empty input → Shows "URL is required"
     - Invalid URL (not-a-url) → Shows "Please enter a valid URL"
     - Non-HTTP URL (ftp://example.com) → Shows "URL must start with http:// or https://"
     - Valid URL → Submits successfully

     Workflow Status:
     - Invalid runId → Shows error state
     - Running workflow → Shows loading state with polling
     - Completed workflow → Shows success with result
     - Failed workflow → Shows error with "Try Again" button

     Navigation:
     - From home to status page → Works via router.push
     - From status page back to home → "Try Again" or "Generate Another" buttons
     - Direct link to status page → Works with server-side initial data fetch

     ---
     Success Criteria

     ✅ User can input a URL on the home page
     ✅ Form validates URL format before submission
     ✅ Workflow starts and returns a runId
     ✅ User is redirected to status page with runId in URL
     ✅ Status page polls for updates every 2 seconds
     ✅ Loading state shows while workflow is running
     ✅ Completed state shows workflow result
     ✅ Error state handles failures gracefully
     ✅ User can navigate back to start a new workflow

     ---
     Next Steps (Future Enhancements)

     After MVP is working, consider:

     1. Step-level progress tracking - Show which specific step is running (scraping vs 
     searching vs generating)
     2. Real-time streaming - Use Server-Sent Events instead of polling for instant updates
     3. Better result display - Format blog content nicely instead of raw JSON
     4. Copy/download features - Let users copy or download the generated blog
     5. History page - Show list of previously generated blogs
     6. Improved animations - Add transitions between states
     7. Accessibility improvements - ARIA labels, keyboard navigation, screen reader support

     ---
     File Summary

     | File                                         | Action   | Description                        |
     |----------------------------------------------|----------|------------------------------------|
     | /app/page.tsx                                | REPLACE  | URL input form with validation     |
     | /app/api/workflows/untitled-4/route.ts       | MODIFY   | Return runId in response           |
     | /app/api/workflows/untitled-4/status/route.ts| CREATE   | Status checking endpoint           |
     | /app/workflow/[runId]/page.tsx               | CREATE   | Status page server component       |
     | /components/workflow-status-client.tsx        | CREATE   | Polling and display logic          |
     | .env.local                                   | UPDATE   | Add NEXT_PUBLIC_URL                |

     (Total: 6 files. 2 modified, 4 created/added)