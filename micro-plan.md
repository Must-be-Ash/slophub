
⏺ I've read the Vercel microfrontends documentation, but I'm not sure microfrontends is what you need here. Let me clarify
   your intent:

  What Microfrontends Actually Do:
  - Microfrontends compose multiple separate applications into a single unified application
  - You'd have a "default app" (like blog-agent-nine.vercel.app) that acts as the shell
  - Other projects (like generated landing pages) would be mounted at specific routes
  - Example: blog-agent.com/landing1, blog-agent.com/landing2 all served from different deployments

  What I Think You Actually Want:
  - Each generated landing page is a standalone deployment
  - Each gets its own unique URL (like funnel-cryptocurrency-xyz.vercel.app)
  - Publicly accessible without requiring Vercel login

  The microfrontends approach would mean ALL landing pages need to be accessed through your main blog-agent domain, which
  doesn't seem right for generated funnels.

  Questions:

  1. Do you want each generated landing page to be a standalone site with its own URL? (Current behavior)
  2. Or do you want to compose them under a single parent application at different routes?

  If you want standalone sites (which I think you do), you just need to ensure deployments are public - which you've
  already done by disabling Deployment Protection. The current implementation is correct.

  If you actually want microfrontends, I need to understand the routing structure you want.

> no this blog-agent.com/landing1, blog-agent.com/landing2 actually sounds way better. I like that ALL landing pages could
 be just the same site instead of each being another site. compose them under a single parent application at different 
routes. '/var/folders/l1/f0mrsx4d2jbbdq4pt0w6cmbm0000gn/T/TemporaryItems/NSIRD_screencaptureui_2yl5vy/Screenshot 
2025-12-04 at 6.33.18 PM.png' here is the parent URL https://blog-agent-nine.vercel.app/ 

⏺ Perfect! That's a much better architecture. Using Vercel microfrontends means:
  - All landing pages under one domain: blog-agent-nine.vercel.app/landing-1, blog-agent-nine.vercel.app/landing-2
  - Each landing page is still its own deployment (can update independently)
  - Cleaner URLs, easier to manage

  Let me explore the codebase and plan how to implement this:

⏺ I'll create a comprehensive implementation plan for converting from standalone deployments to Vercel microfrontends
  architecture. Let me write this to the plan file.

⏺ Updated plan
  ⎿  Error writing file

⏺ Let me read the existing plan file first:

⏺ Reading Plan(~/.claude/plans/wise-rolling-platypus.md)
  ⎿  Read 1053 lines

⏺ Now I'll replace the old plan with the new microfrontends architecture plan:

⏺ Updated plan
  ⎿  /plan to preview · ~/.claude/plans/wise-rolling-platypus.md

⏺ Perfect! I've created a comprehensive implementation plan for converting your landing page generator to use Vercel
  Microfrontends architecture.

  The plan covers:

  ✅ Key Insight: Your current codebase IS the parent app - we're just adding routing configuration, not building a new
  parent

  ✅ 7 Implementation Phases:
  1. Create microfrontends.json config
  2. Registration step to update routes
  3. Git-based deployment (recommended) or API fallback
  4. Modify deployment to return project names
  5. Update main workflow with registration and commit steps
  6. Update MongoDB schema
  7. Update UI to show both microfrontend and standalone URLs

  ✅ Architecture: Each landing page still deploys as a separate Vercel project (for isolation), then gets registered in
  the parent app's routing config

  ✅ Recommended Approach: Git-based deployment (Phase 3) - commits microfrontends.json changes and pushes to trigger
  automatic Vercel deployment. More reliable and simpler than API redeployment.

  ✅ Error Handling: Complete fallback strategy - if microfrontends registration fails, standalone URLs always work

  ✅ Timeline: ~2 hours estimated implementation time

  The plan is ready for your review. Would you like me to proceed with implementation?

──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 Ready to code?

 Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 Implementation Plan: Convert to Vercel Microfrontends Architecture

 Overview

 Convert the landing page generator from creating standalone Vercel deployments to composing all landing pages as
 microfrontends under a single parent application at different routes.

 Current Architecture:
 - Each landing page → Separate Vercel project with unique URL
 - Example: funnel-cryptocurrency-xyz.vercel.app, funnel-saas-abc.vercel.app

 Target Architecture:
 - All landing pages → Same parent domain at different routes
 - Parent: blog-agent-nine.vercel.app
 - Landing pages: blog-agent-nine.vercel.app/landing-{runId}

 ---
 Key Insight from Exploration

 The current codebase IS the parent application (blog-agent-nine.vercel.app). We're not creating a new parent app - we're
 modifying the existing workflow to:
 1. Keep deploying landing pages as separate Vercel projects (for isolation)
 2. Register each project in the parent app's microfrontends.json
 3. Parent app proxies requests to appropriate microfrontend based on route

 ---
 Critical Files

 - /workflows/steps/deploy-to-vercel-step.ts - Current deployment logic (creates standalone projects)
 - /workflows/untitled-4.ts - Main workflow orchestrator
 - /components/workflow-status-client.tsx - UI displaying results
 - /workflows/steps/save-to-mongodb-step.ts - MongoDB schema

 ---
 Implementation Plan

 Phase 1: Create Microfrontends Configuration

 File: /microfrontends.json (NEW - Root of project)

 Content:
 {
   "$schema": "https://openapi.vercel.sh/microfrontends.json",
   "applications": {
     "blog-agent": {
       "paths": {}
     }
   }
 }

 Notes:
 - Start with empty paths object
 - Paths will be dynamically added: "/landing-{runId}": "project-name"
 - After each update, parent app needs redeployment for routes to become active

 ---
 Phase 2: Create Microfrontend Registration Step

 File: /workflows/steps/register-microfrontend-step.ts (NEW)

 Purpose: Update microfrontends.json with new route after deploying landing page

 Implementation:
 'use step';

 import { readFile, writeFile } from 'fs/promises';
 import { join } from 'path';

 interface MicrofrontendsConfig {
   $schema: string;
   applications: {
     [key: string]: {
       paths: {
         [path: string]: string;
       };
     };
   };
 }

 export async function registerMicrofrontendStep({
   runId,
   projectName,
 }: {
   runId: string;
   projectName: string;
 }): Promise<{ path: string; registered: boolean }> {
   'use step';

   const configPath = join(process.cwd(), 'microfrontends.json');
   const route = `/landing-${runId}`;

   try {
     // Read existing config
     const configContent = await readFile(configPath, 'utf-8');
     const config: MicrofrontendsConfig = JSON.parse(configContent);

     // Ensure blog-agent application exists
     if (!config.applications['blog-agent']) {
       config.applications['blog-agent'] = { paths: {} };
     }

     // Add new route
     config.applications['blog-agent'].paths[route] = projectName;

     // Write updated config
     await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

     return {
       path: route,
       registered: true,
     };
   } catch (error) {
     console.error('Failed to register microfrontend:', error);
     throw new Error(
       `Failed to register microfrontend: ${error instanceof Error ? error.message : 'Unknown error'}`
     );
   }
 }

 Important: This modifies the parent app's configuration file. After this step, the parent app must be redeployed for routes
 to take effect.

 ---
 Phase 3: Create Git Commit and Push Step (Recommended Approach)

 File: /workflows/steps/commit-and-push-step.ts (NEW)

 Purpose: Commit microfrontends.json changes to Git and push, triggering automatic Vercel deployment

 Why this approach:
 - More scalable than API redeployment
 - Leverages Vercel's Git integration
 - Automatic deployment on push
 - Git history of all route changes
 - No need to manage deployment API complexity

 Implementation:
 'use step';

 import { exec } from 'child_process';
 import { promisify } from 'util';

 const execAsync = promisify(exec);

 export async function commitAndPushStep({
   runId,
   route,
 }: {
   runId: string;
   route: string;
 }): Promise<{ success: boolean; commitHash?: string }> {
   'use step';

   try {
     // Add microfrontends.json to staging
     await execAsync('git add microfrontends.json');

     // Create commit with descriptive message
     const commitMessage = `Add microfrontend route: ${route} (runId: ${runId})`;
     const { stdout: commitOutput } = await execAsync(
       `git commit -m "${commitMessage}"`
     );

     // Extract commit hash
     const commitHashMatch = commitOutput.match(/\[.+?\s+([a-f0-9]+)\]/);
     const commitHash = commitHashMatch ? commitHashMatch[1] : undefined;

     // Push to origin (triggers Vercel deployment)
     await execAsync('git push origin main');

     return {
       success: true,
       commitHash,
     };
   } catch (error) {
     console.error('Git commit/push failed:', error);

     // Check if error is because there are no changes
     if (error instanceof Error && error.message.includes('nothing to commit')) {
       return {
         success: true,
         commitHash: undefined,
       };
     }

     return {
       success: false,
     };
   }
 }

 Alternative: API-based redeployment (if Git approach not feasible - see Phase 3B below)

 ---
 Phase 3B: Alternative - API Redeployment Step (If Git Not Available)

 File: /workflows/steps/redeploy-parent-app-step.ts (NEW - Alternative to Git approach)

 Only implement this if Git-based deployment is not possible

 'use step';

 export async function redeployParentAppStep(): Promise<{
   success: boolean;
   deploymentUrl?: string;
 }> {
   'use step';

   const apiKey = process.env.VERCEL_TOKEN;
   const parentProjectId = process.env.VERCEL_PROJECT_ID; // blog-agent project ID

   if (!apiKey) {
     throw new Error('VERCEL_TOKEN is not configured');
   }

   if (!parentProjectId) {
     throw new Error('VERCEL_PROJECT_ID is not configured');
   }

   try {
     // Get latest production deployment
     const deploymentsResponse = await fetch(
       `https://api.vercel.com/v6/deployments?projectId=${parentProjectId}&target=production&limit=1`,
       {
         headers: {
           Authorization: `Bearer ${apiKey}`,
         },
       }
     );

     if (!deploymentsResponse.ok) {
       throw new Error(`Failed to fetch deployments: ${deploymentsResponse.status}`);
     }

     const deploymentsData = await deploymentsResponse.json();
     const latestDeployment = deploymentsData.deployments[0];

     if (!latestDeployment) {
       throw new Error('No production deployment found');
     }

     // Trigger redeploy
     const redeployResponse = await fetch(
       `https://api.vercel.com/v13/deployments`,
       {
         method: 'POST',
         headers: {
           Authorization: `Bearer ${apiKey}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           deploymentId: latestDeployment.uid,
           name: 'blog-agent',
           target: 'production',
         }),
       }
     );

     if (!redeployResponse.ok) {
       const errorText = await redeployResponse.text();
       throw new Error(`Redeploy failed: ${redeployResponse.status} - ${errorText}`);
     }

     const redeployData = await redeployResponse.json();

     return {
       success: true,
       deploymentUrl: redeployData.url,
     };
   } catch (error) {
     console.error('Parent app redeployment failed:', error);
     return {
       success: false,
     };
   }
 }

 ---
 Phase 4: Modify Deployment Step

 File: /workflows/steps/deploy-to-vercel-step.ts

 Changes:

 1. Simplify project naming (line 41):
 // OLD:
 const projectName = `funnel-${scrapeResult.metadata.industry.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`.slice(0,
 50);

 // NEW:
 const projectName = `landing-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`.slice(0, 50);

 2. Return projectName in response (after line 120):
 return {
   url: `https://${data.url}`,
   deploymentId: data.id,
   projectName: projectName, // NEW - needed for microfrontend registration
   inspectorUrl: data.inspectorUrl,
   readyState: data.readyState,
 };

 Note: Keep all other deployment logic unchanged - still creates separate Vercel projects

 ---
 Phase 5: Update Main Workflow

 File: /workflows/untitled-4.ts

 Changes:

 1. Update WORKFLOW_STEPS (lines 34-43):
 const WORKFLOW_STEPS = [
   { id: 'scrape', label: 'Scrape Website & Upload Assets' },
   { id: 'search', label: 'Research Campaign Data' },
   { id: 'generate', label: 'Generate Landing Page Spec' },
   { id: 'images', label: 'Generate Landing Page Images' },
   { id: 'create', label: 'Create Landing Page' },
   { id: 'deploy', label: 'Deploy to Vercel' },
   { id: 'register', label: 'Register Microfrontend' },     // NEW
   { id: 'commit', label: 'Update Parent Application' },    // NEW (Git approach)
   // OR
   // { id: 'redeploy', label: 'Update Parent Application' }, // NEW (API approach)
   { id: 'screenshot', label: 'Capture Preview Screenshot' },
 ];

 2. Import new steps (top of file):
 import { registerMicrofrontendStep } from './steps/register-microfrontend-step';
 import { commitAndPushStep } from './steps/commit-and-push-step'; // Git approach
 // OR
 // import { redeployParentAppStep } from './steps/redeploy-parent-app-step'; // API approach

 3. Add microfrontend registration (after deployment, before screenshot - around line 868):
 // Step 7: Register Microfrontend
 await updateStepStatusStep(writable, runId, 'register', 'running');
 let microfrontendPath: string | undefined;
 try {
   const startTime = Date.now();

   const registrationResult = await registerMicrofrontendStep({
     runId,
     projectName: deployResult.projectName,
   });

   microfrontendPath = registrationResult.path;

   await updateStepStatusStep(writable, runId, 'register', 'success', {
     detail: { path: microfrontendPath },
     duration: Date.now() - startTime,
   });

   await logStepDataStep({
     runId,
     stepName: 'register',
     stepData: {
       path: microfrontendPath,
       projectName: deployResult.projectName,
       timestamp: Date.now(),
     },
   });
 } catch (error) {
   console.error('Microfrontend registration failed:', error);
   await updateStepStatusStep(writable, runId, 'register', 'error', {
     error: 'Failed to register microfrontend - landing page still accessible via standalone URL',
   });
   // Don't throw - continue with standalone URL
 }

 // Step 8: Commit and Push (Git Approach - RECOMMENDED)
 await updateStepStatusStep(writable, runId, 'commit', 'running');
 let parentUpdated = false;
 try {
   const startTime = Date.now();

   const commitResult = await commitAndPushStep({
     runId,
     route: microfrontendPath || '/unknown',
   });

   parentUpdated = commitResult.success;

   await updateStepStatusStep(writable, runId, 'commit', 'success', {
     detail: {
       commitHash: commitResult.commitHash,
       pushed: commitResult.success,
     },
     duration: Date.now() - startTime,
   });

   await logStepDataStep({
     runId,
     stepName: 'commit',
     stepData: {
       success: commitResult.success,
       commitHash: commitResult.commitHash,
       route: microfrontendPath,
       timestamp: Date.now(),
     },
   });
 } catch (error) {
   console.error('Git commit/push failed:', error);
   await updateStepStatusStep(writable, runId, 'commit', 'error', {
     error: 'Parent app update pending - microfrontend will be available after next deployment',
   });
   // Don't throw - landing page is still accessible via standalone URL
 }

 4. Update screenshot URL (line 871+):
 // Step 9: Capture Screenshot (was Step 7)
 await updateStepStatusStep(writable, runId, 'screenshot', 'running');
 let screenshotUrl: string | undefined;
 try {
   const startTime = Date.now();

   // Determine which URL to screenshot
   const parentDomain = 'blog-agent-nine.vercel.app';

   // Wait a bit for parent app deployment if we just pushed
   // (Vercel typically deploys in 30-60 seconds)
   if (microfrontendPath && parentUpdated) {
     // Wait 45 seconds for parent deployment to complete
     await new Promise(resolve => setTimeout(resolve, 45000));
   }

   const urlToScreenshot = (microfrontendPath && parentUpdated)
     ? `https://${parentDomain}${microfrontendPath}`
     : deployResult.url;

   const { screenshotStep } = await import('./steps/screenshot-step');
   const screenshotResult = await screenshotStep({
     url: urlToScreenshot,
   });

   screenshotUrl = screenshotResult.screenshotUrl;

   await updateStepStatusStep(writable, runId, 'screenshot', 'success', {
     detail: {
       screenshotUrl,
       urlScreenshotted: urlToScreenshot,
     },
     duration: Date.now() - startTime,
   });

   await logStepDataStep({
     runId,
     stepName: 'screenshot',
     stepData: {
       url: urlToScreenshot,
       screenshotUrl,
       timestamp: Date.now(),
     },
   });
 } catch (error) {
   console.error('Screenshot capture failed:', error);
   await updateStepStatusStep(writable, runId, 'screenshot', 'error', {
     error: 'Screenshot capture failed - deployment still successful',
   });
 }

 5. Update return values (line 953+):
 const parentDomain = 'blog-agent-nine.vercel.app';
 const finalUrl = (microfrontendPath && parentUpdated)
   ? `https://${parentDomain}${microfrontendPath}`
   : deployResult.url;

 return {
   landingPage: blogResult.blogPage,
   liveUrl: finalUrl,                           // Microfrontend URL if available, else standalone
   standaloneUrl: deployResult.url,             // NEW - Always available as fallback
   microfrontendPath,                           // NEW - e.g., "/landing-abc123"
   deploymentId: deployResult.deploymentId,
   spec: specResult.text,
   scrapeMetadata: scrapeResult.metadata,
   campaignDescription: input.campaignDescription,
   targetUrl: input.url,
   researchResults: searchResult.results,
   citations: searchResult.citations,
   uploadedAssets,
   generatedImages,
   referenceImageUrl: input.imageUrl,
   screenshotUrl,
 };

 6. Update MongoDB save (line 938+):
 await saveToMongoDBStep({
   workflowData: {
     runId,
     url: input.url,
     industry: scrapeResult.metadata.industry,
     brandAssets: {
       title: scrapeResult.metadata.title,
       description: scrapeResult.metadata.description,
       ogImage: ogImageAsset?.blobUrl || scrapeResult.metadata.ogImage,
       favicon: faviconAsset?.blobUrl || scrapeResult.metadata.favicon,
       uploadedAssets,
     },
     branding: scrapeResult.branding,
     campaignDescription: input.campaignDescription,
     landingPageSpec: specResult.text,
     referenceImageUrl: input.imageUrl,
     generatedImages,
     liveUrl: finalUrl,                    // Microfrontend URL
     standaloneUrl: deployResult.url,      // NEW
     microfrontendPath,                    // NEW
     deploymentId: deployResult.deploymentId,
     screenshotUrl,
     createdAt: Date.now(),
   },
 });

 ---
 Phase 6: Update MongoDB Schema

 File: /workflows/steps/save-to-mongodb-step.ts

 Changes:
 export async function saveToMongoDBStep({
   workflowData,
 }: {
   workflowData: {
     runId: string;
     url: string;
     industry: string;
     brandAssets: any;
     branding?: any;
     campaignDescription: string;
     landingPageSpec: string;
     referenceImageUrl?: string;
     generatedImages?: Array<{
       name: string;
       blobUrl: string;
     }>;
     liveUrl?: string;
     standaloneUrl?: string;           // NEW
     microfrontendPath?: string;       // NEW
     deploymentId?: string;
     screenshotUrl?: string;
     createdAt: number;
   };
 }) {
   'use step';
   // ... implementation unchanged
 }

 ---
 Phase 7: Update UI

 File: /components/workflow-status-client.tsx

 Changes:

 1. Update result type (lines 23-30):
 interface WorkflowStatusClientProps {
   runId: string;
   initialData: {
     status: WorkflowStatus;
     result?: {
       liveUrl?: string;
       standaloneUrl?: string;        // NEW
       microfrontendPath?: string;    // NEW
       screenshotUrl?: string;
       // ... other fields
     };
     error?: string;
   };
 }

 2. Display both URLs (lines 213-280):
 {/* Live URL Card */}
 {hasLiveUrl && (
   <div className="bg-white rounded-2xl shadow-sm shadow-black/5 p-8">
     <h3 className="text-lg font-semibold text-slate-900 mb-6">Your landing page is live</h3>

     {/* Microfrontend URL (primary) */}
     {result.microfrontendPath && (
       <div className="mb-4">
         <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Microfrontend URL</p>
         <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 mb-2">
           <a
             href={liveUrl}
             target="_blank"
             rel="noopener noreferrer"
             className="text-emerald-700 hover:text-emerald-900 font-mono text-sm flex-1 truncate transition-colors 
 font-semibold"
           >
             {liveUrl}
           </a>
           <button
             onClick={() => handleCopy(liveUrl)}
             className="p-2 hover:bg-emerald-100 rounded-lg transition-colors flex-shrink-0"
             title="Copy URL"
           >
             {copied ? (
               <Check className="h-4 w-4 text-emerald-600" />
             ) : (
               <Copy className="h-4 w-4 text-emerald-600" />
             )}
           </button>
         </div>
         <p className="text-xs text-slate-500">
           Composed under parent application at: <code className="bg-slate-100 px-1 py-0.5 
 rounded">{result.microfrontendPath}</code>
         </p>
       </div>
     )}

     {/* Standalone URL (fallback) */}
     {result.standaloneUrl && (
       <details className="mb-6">
         <summary className="text-xs text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 mb-2">
           Standalone URL (Fallback)
         </summary>
         <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
           <a
             href={result.standaloneUrl}
             target="_blank"
             rel="noopener noreferrer"
             className="text-slate-600 hover:text-slate-900 font-mono text-sm flex-1 truncate transition-colors"
           >
             {result.standaloneUrl}
           </a>
           <button
             onClick={() => handleCopy(result.standaloneUrl!)}
             className="p-2 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
             title="Copy URL"
           >
             <Copy className="h-4 w-4 text-slate-400" />
           </button>
         </div>
       </details>
     )}

     {/* Screenshot preview - unchanged */}
     {screenshotUrl ? (
       <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
         {/* ... existing screenshot display code ... */}
       </div>
     ) : (
       <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 bg-slate-50 p-8 text-center">
         <p className="text-slate-500">Preview screenshot unavailable</p>
       </div>
     )}

     {/* Action buttons - update to use microfrontend URL */}
     <div className="flex gap-3">
       <a
         href={liveUrl}
         target="_blank"
         rel="noopener noreferrer"
         className="flex-1 py-3 px-5 bg-black text-white font-medium rounded-xl hover:bg-slate-800 active:scale-[0.98] 
 transition-all flex items-center justify-center gap-2"
       >
         Open Landing Page
         <ExternalLink className="h-4 w-4" />
       </a>
       <button
         onClick={() => router.push('/')}
         className="py-3 px-5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 active:scale-[0.98]
 transition-all"
       >
         Generate Another
       </button>
     </div>
   </div>
 )}

 ---
 Environment Variables

 Required for API Redeployment Approach (Phase 3B only):
 VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxx  # Parent project ID (blog-agent)

 How to get: Vercel Dashboard → blog-agent project → Settings → General → Project ID

 Note: Not needed for Git-based approach (Phase 3 - recommended)

 ---
 Data Flow

 ┌─────────────────────────────────────────────────────────────────┐
 │ 1. Deploy Landing Page                                          │
 │   └─> POST /v13/deployments                                     │
 │       └─> Creates: landing-1764899094965-abc123.vercel.app      │
 └─────────────────────────────────────────────────────────────────┘
                             ↓
 ┌─────────────────────────────────────────────────────────────────┐
 │ 2. Register Microfrontend                                       │
 │   └─> Update /microfrontends.json                               │
 │       └─> Add: "/landing-{runId}": "landing-xyz"                │
 └─────────────────────────────────────────────────────────────────┘
                             ↓
 ┌─────────────────────────────────────────────────────────────────┐
 │ 3. Commit and Push (Git Approach - RECOMMENDED)                 │
 │   └─> git commit -m "Add microfrontend route: /landing-xyz"     │
 │   └─> git push origin main                                      │
 │       └─> Vercel detects push                                   │
 │           └─> Auto-deploys parent app with new routes           │
 │               └─> Routes become active                          │
 └─────────────────────────────────────────────────────────────────┘
                             ↓
 ┌─────────────────────────────────────────────────────────────────┐
 │ 4. Wait for Deployment (~45 seconds)                            │
 └─────────────────────────────────────────────────────────────────┘
                             ↓
 ┌─────────────────────────────────────────────────────────────────┐
 │ 5. Capture Screenshot                                            │
 │   └─> URL: https://blog-agent-nine.vercel.app/landing-xyz       │
 └─────────────────────────────────────────────────────────────────┘
                             ↓
 ┌─────────────────────────────────────────────────────────────────┐
 │ 6. Return URLs                                                   │
 │   ├─> Primary: blog-agent-nine.vercel.app/landing-xyz          │
 │   └─> Fallback: landing-xyz.vercel.app                          │
 └─────────────────────────────────────────────────────────────────┘

 ---
 How Microfrontends Routing Works

 1. User visits: https://blog-agent-nine.vercel.app/landing-123
 2. Parent app receives request:
   - Reads microfrontends.json
   - Finds: "/landing-123": "landing-1764899094965-abc123"
   - Proxies request to: https://landing-1764899094965-abc123.vercel.app/
 3. Response:
   - Content served from microfrontend project
   - URL remains: blog-agent-nine.vercel.app/landing-123
   - User sees unified domain

 ---
 Error Handling & Fallbacks

 Scenario 1: Registration Fails

 Fallback: Standalone URL remains accessible
 User Impact: Minimal - just uses different domain
 Recovery: Manual registration or retry

 Scenario 2: Git Commit/Push Fails

 Fallback: Standalone URL fully functional
 User Impact: None - workflow succeeds with standalone URL
 Recovery: Manual commit or next workflow run will include route

 Scenario 3: Parent Deployment Slow (>45s)

 Fallback: Screenshot uses standalone URL
 User Impact: Preview shows standalone URL, but microfrontend URL in result
 Recovery: Microfrontend URL becomes accessible once deployment completes

 Scenario 4: Screenshot Fails

 Fallback: Display "Preview unavailable" message
 User Impact: Minimal - can still access live URLs
 Recovery: Manual screenshot or retry

 ---
 File Summary

 | File                                            | Action | Description                                |
 |-------------------------------------------------|--------|--------------------------------------------|
 | /microfrontends.json                            | CREATE | Routing configuration                      |
 | /workflows/steps/register-microfrontend-step.ts | CREATE | Update config with new route               |
 | /workflows/steps/commit-and-push-step.ts        | CREATE | Git-based deployment trigger (RECOMMENDED) |
 | /workflows/steps/redeploy-parent-app-step.ts    | CREATE | API-based deployment (alternative)         |
 | /workflows/steps/deploy-to-vercel-step.ts       | MODIFY | Return projectName                         |
 | /workflows/untitled-4.ts                        | MODIFY | Add registration and commit steps          |
 | /workflows/steps/save-to-mongodb-step.ts        | MODIFY | Update schema                              |
 | /components/workflow-status-client.tsx          | MODIFY | Display both URLs                          |

 Total: 3-4 new files (depending on Git vs API approach), 4 modified files

 ---
 Benefits

 ✨ Unified Domain: All landing pages under blog-agent-nine.vercel.app

 🎯 Independent Deployment: Each landing page still deployed separately (isolation)

 🔄 Automatic Routing: Parent app proxies based on microfrontends.json

 📊 Better Analytics: Single domain for tracking

 🔒 Simplified Security: Manage protection at parent level

 ⚡ Fallback Safety: Standalone URLs always work

 🚀 Scalable: Support hundreds of landing pages

 ---
 Testing Checklist

 Pre-deployment:

 1. ✅ Create /microfrontends.json with empty paths
 2. ✅ Commit and push to Git
 3. ✅ Verify Vercel deployment succeeds

 Post-deployment:

 4. ✅ Generate one landing page
 5. ✅ Verify microfrontend registration updates config
 6. ✅ Verify Git commit created
 7. ✅ Verify Git push triggers Vercel deployment
 8. ✅ Wait 60 seconds, verify route accessible
 9. ✅ Verify standalone URL still works
 10. ✅ Verify screenshot displays correctly

 Multiple landing pages:

 11. ✅ Generate 3 landing pages in succession
 12. ✅ Verify all routes registered
 13. ✅ Verify no route conflicts
 14. ✅ Verify all microfrontend URLs work

 UI:

 15. ✅ Verify microfrontend URL shown as primary
 16. ✅ Verify standalone URL shown as fallback
 17. ✅ Verify copy buttons work for both
 18. ✅ Verify links open in new tabs

 ---
 Implementation Order

 1. Phase 1: Create /microfrontends.json (5 min)
 2. Phase 2: Create registration step (15 min)
 3. Phase 3: Create commit/push step (20 min)
 4. Phase 4: Modify deployment step (10 min)
 5. Phase 5: Update main workflow (30 min)
 6. Phase 6: Update MongoDB schema (5 min)
 7. Phase 7: Update UI (20 min)

 Total estimated time: ~2 hours

 ---
 Recommended Approach

 Use Git-based deployment (Phase 3) instead of API redeployment because:
 - More reliable (leverages Vercel's Git integration)
 - Automatic deployment on push
 - Git history of route changes
 - No need for VERCEL_PROJECT_ID env var
 - Easier to debug and rollback

 Only use API approach (Phase 3B) if:
 - Git access not available in workflow environment
 - Need synchronous deployment confirmation
 - Custom deployment requirements
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

 Would you like to proceed?

 ❯ 1. Yes, and auto-accept edits
   2. Yes, and manually approve edits
   3. Type here to tell Claude what to change

 ctrl-g to edit in Vim
