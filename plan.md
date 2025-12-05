This is the project we had:

1. based on user's manually input URL. 2. scrape the site and it's brand (brand assets, colour palate, font, favicon, logo, metadata, og image, and style). 3. search the web for related news based on the site's industry (for example if it's crypto related, search for crypto news). 5. write a spec (prompt for a site page) make a blog post site that's SEO optomized using an LLM. 6. have v0 make a blog page

We also have a script for quality checking the outputs from scraping for brand assets (colour palate, font, favicon, logo, metadata, og image, and style), web search, prompt generation and v0 blog generation

Now we are transforming your blog generator into a funnel/landing page generator.

Instead of making a blog I want to make funnels (still a one page website but dedicated to a sales funnel like a unique landing page). This would be one page site campaings that leads (CTA) to the main site (the URL that's input). Give me an input to describe my campaign (mention who i want to tartget and what I want the campagin to be about). I want to mention the content I want to have myself instead of the industry identifying I want to give the context but we want to still keep the scraping we are fetching brand assets and identity and context from. this is the blog that was generated from the last run '/var/folders/l1/f0mrsx4d2jbbdq4pt0w6cmbm0000gn/T/TemporaryItems/NSIRD_screencaptureui_CqXB2J/Screenshot 2025-12-04 at 3.51.08 PM.png' '/var/folders/l1/f0mrsx4d2jbbdq4pt0w6cmbm0000gn/T/TemporaryItems/NSIRD_screencaptureui_hNVaBL/Screenshot 2025-12-04 at 3.52.00 PM.png' it's great but there is one tiny problem, there are a lot of links and buttons (navigation, CTA, footer, hyperlinks) which don't lead anywhere. We don't want out funnel one page site to have any links, buttons or navigation aparat from what leads to our main site (the URL entered in the beginning of the workflow). So the CTA, hyperlink or any other things that are there should only be there to lead to the URL entered. have the LLM that generates the prompt make a sells funnel instead of telling v0 to make a blog 

     Implementation Plan: Transform Blog Generator to Funnel/Landing Page Generator

     Overview

     Transform the current blog generator into a funnel/landing page generator that creates conversion-focused, 
     single-purpose landing pages. All CTAs, buttons, and links will direct users only to the main brand URL (the input 
     URL), eliminating navigation menus and footer links.

     ---
     Problem Statement

     Current System:
     - Generates multi-section blog posts with navigation, footer, external links
     - Uses industry news to create content automatically
     - No user control over campaign messaging

     Issues Identified from Generated Blog:
     - Top navigation (Products, Learn, Company) with dead links
     - Multiple "Read More" links pointing nowhere
     - Extensive footer navigation (Products, Learn, Company sections)
     - Footer links (Privacy Policy, Terms, Cookie Policy) with no destination
     - Content is industry-focused, not campaign-focused

     User Requirements:
     1. Create sales funnels/landing pages instead of blogs
     2. User provides campaign description (target audience + campaign topic)
     3. Keep URL scraping for brand assets (colors, fonts, logos)
     4. Critical: ALL links, buttons, CTAs must point ONLY to the input URL
     5. NO navigation menus or footer links
     6. Single-purpose, conversion-focused design

     ---
     Architecture Changes

     Input Changes

     Current: URL only
     New: URL + Campaign Description

     Workflow Changes

     | Step | Current                        | New                                                  |
     |------|--------------------------------|------------------------------------------------------|
     | 1    | Scrape Website & Upload Assets | Keep - Still need brand assets                       |
     | 2    | Search Industry News           | Remove - User provides content direction             |
     | 3    | Generate Blog Spec             | Change - Generate Funnel/Landing Page Spec           |
     | 4    | Create Blog Page               | Change - Create Landing Page (all links → input URL) |
     | 5    | Deploy to Vercel               | Keep - Same deployment process                       |

     ---
     Implementation Plan

     Phase 1: Update Input Form

     File: /app/page.tsx

     Changes:

     1. Add campaign description state (after line 9):
     const [url, setUrl] = useState('');
     const [campaignDescription, setDescription] = useState('');

     2. Add textarea for campaign description (after line 96):
     <div className="space-y-2">
       <label htmlFor="campaign" className="block text-sm font-medium text-foreground">
         Campaign Description
       </label>
       <textarea
         id="campaign"
         value={campaignDescription}
         onChange={(e) => setDescription(e.target.value)}
         placeholder="Example: Target small business owners who need simple invoicing software. Focus on saving time and 
     reducing paperwork hassle."
         rows={4}
         className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 
     focus:ring-blue-500 transition-colors resize-none"
       />
       <p className="text-xs text-gray-500">
         Describe who you're targeting and what this campaign is about
       </p>
     </div>

     3. Update validation (line 15):
     const isValidUrl = (url: string) => {
       return /^https?:\/\/.+/.test(url);
     };

     const isValidCampaign = (description: string) => {
       return description.trim().length >= 20; // Minimum 20 characters
     };

     4. Update submit handler (line 44):
     body: JSON.stringify({
       url,
       campaignDescription
     })

     5. Update button disabled state (line 139):
     disabled={!url || !campaignDescription || !isValidUrl(url) || !isValidCampaign(campaignDescription) || isLoading}

     6. Update UI labels:
     - Line 84: Change "Blog Generator" → "Landing Page Generator"
     - Line 85: Change "Create SEO-optimized..." → "Create conversion-focused landing pages..."
     - Line 87-89: Update feature bullets:
       - "Conversion-focused design"
       - "Brand-consistent styling"
       - "Single-purpose CTAs"
     - Line 138: Change "Generate Blog" → "Generate Landing Page"
     - Line 140: Change "Generating your blog..." → "Creating your landing page..."

     ---
     Phase 2: Update API Route

     File: /app/api/workflows/untitled-4/route.ts

     Changes:

     1. Update request validation (lines 14-19):
     const { url, campaignDescription } = await request.json();

     if (!url || typeof url !== 'string') {
       return NextResponse.json({ error: 'URL is required' }, { status: 400 });
     }

     if (!campaignDescription || typeof campaignDescription !== 'string') {
       return NextResponse.json({ error: 'Campaign description is required' }, { status: 400 });
     }

     2. Pass both to workflow (line 28):
     const runId = await untitled4Workflow({
       url,
       campaignDescription
     });

     ---
     Phase 3: Update Workflow Interface

     File: /workflows/untitled-4.ts

     Changes:

     1. Update function signature (line 43):
     export async function untitled4Workflow(input: {
       url: string;
       campaignDescription: string;
     }) {

     2. Update step labels (lines 34-40):
     const WORKFLOW_STEPS = [
       { id: 'scrape', label: 'Scrape Website & Upload Assets' },
       { id: 'generate', label: 'Generate Landing Page Spec' },
       { id: 'create', label: 'Create Landing Page' },
       { id: 'deploy', label: 'Deploy to Vercel' },
     ];

     3. Remove search step (delete lines 172-205):
     - Delete entire search step execution
     - Delete search result logging
     - Remove searchResult variable

     ---
     Phase 4: Update Spec Generation (Remove News, Add Campaign Focus)

     File: /workflows/untitled-4.ts

     Changes:

     Replace spec generation prompt (lines 212-233):

     // Step 2: Generate Landing Page Spec
     await updateStepStatusStep(writable, runId, 'generate', 'running');
     let specResult;
     try {
       const startTime = Date.now();

       specResult = await generateTextStep({
         aiPrompt: `Create a conversion-focused landing page specification based on this campaign:

     BRAND INFORMATION:
     Website: ${input.url}
     Brand Title: ${scrapeResult.metadata.title}
     Brand Description: ${scrapeResult.metadata.description}
     Industry: ${scrapeResult.metadata.industry}

     CAMPAIGN BRIEF:
     ${input.campaignDescription}

     BRAND CONTENT SAMPLE:
     ${scrapeResult.markdown.slice(0, 2000)}

     Create a detailed landing page spec that:

     1. **HEADLINE & SUBHEADLINE:**
        - Attention-grabbing headline that addresses the target audience from the campaign brief
        - Supporting subheadline that clarifies the value proposition

     2. **HERO SECTION:**
        - Compelling opening statement
        - Clear benefit-driven messaging
        - Primary CTA that leads to: ${input.url}

     3. **VALUE PROPOSITIONS (3-5 KEY BENEFITS):**
        - Based on campaign description
        - Focus on solving target audience's pain points
        - Use benefit-oriented language

     4. **SOCIAL PROOF/TRUST ELEMENTS:**
        - Testimonials framework (if applicable to campaign)
        - Trust badges or credibility indicators
        - Statistics or results (if relevant)

     5. **FEATURE HIGHLIGHTS:**
        - 3-5 key features relevant to the campaign
        - Benefit-focused descriptions
        - Visual representation suggestions

     6. **FINAL CTA SECTION:**
        - Strong closing statement
        - Clear call-to-action
        - Urgency or incentive messaging
        - Link destination: ${input.url}


     CRITICAL REQUIREMENTS:
     - All CTAs and links MUST point to: ${input.url}
     - NO navigation menu
     - NO footer navigation links
     - NO external links except to ${input.url}
     - Single-purpose conversion focus
     - Brand-consistent messaging tone

     Return a detailed specification with all sections clearly outlined.`,
       });

       await updateStepStatusStep(writable, runId, 'generate', 'success', {
         detail: {
           specLength: specResult.text.length,
           targetUrl: input.url,
         },
         duration: Date.now() - startTime,
       });

       // Log complete spec generation data to MongoDB
       await logStepDataStep({
         runId,
         stepName: 'generate',
         stepData: {
           prompt: input.campaignDescription,
           spec: specResult.text,
           model: specResult.model,
           targetUrl: input.url,
           timestamp: Date.now(),
         },
       });
     } catch (error) {
       await updateStepStatusStep(writable, runId, 'generate', 'error', {
         error: error instanceof Error ? error.message : String(error),
       });
       throw error;
     }

     ---
     Phase 5: Update V0 Prompt (Landing Page with Link Restrictions)

     File: /workflows/untitled-4.ts

     Changes:

     Replace V0 prompt generation (lines 364-391):

     blogResult = await createChatStep({
       message: `Create a complete, production-ready SINGLE-PAGE Next.js landing page based on this specification:

     ${specResult.text}

     ${brandInfo}

     TARGET URL FOR ALL CTAs: ${input.url}

     CRITICAL REQUIREMENTS:

     1. **LANDING PAGE STRUCTURE (NOT A BLOG):**
        - Hero section with headline, subheadline, and primary CTA
        - Value propositions section (3-5 benefits)
        - Features/highlights section
        - Social proof section (testimonials/trust badges)
        - Final CTA section
        - NO navigation menu
        - NO footer with links

     2. **LINK RESTRICTIONS (EXTREMELY IMPORTANT):**
        - ALL buttons must link to: ${input.url}
        - ALL CTAs must link to: ${input.url}
        - ALL clickable elements must link to: ${input.url}
        - DO NOT create navigation menus
        - DO NOT create footer navigation
        - DO NOT create "Read More" or blog-style links
        - Only brand logo can be clickable (linking to ${input.url})

     3. **STYLING & BRANDING:**
        - Apply the brand's color palette throughout
        - Use brand fonts and typography
        - Include brand logo in top-left
        - Match brand personality and tone
        - Responsive and mobile-friendly design
        - Style with Tailwind CSS

     4. **TECHNICAL REQUIREMENTS:**
        - Create SINGLE-PAGE Next.js app (app/page.tsx)
        - Include ALL code in ONE file
        - Include proper metadata with OG tags using Next.js metadata API
        - Include favicon reference
        - NO separate component files
        - Ready to deploy as-is

     5. **CONVERSION OPTIMIZATION:**
        - Clear visual hierarchy
        - Prominent CTAs above and below the fold
        - Benefit-driven copy
        - Scannable layout
        - Action-oriented button text

     6. **EXAMPLES OF CORRECT CTA IMPLEMENTATION:**
        \`\`\`tsx
        // Primary CTA Button
        <a
          href="${input.url}"
          className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Get Started
        </a>

        // Logo Link
        <a href="${input.url}">
          <Image src={logoUrl} alt="Brand" width={120} height={40} />
        </a>

        // Text CTA
        <a
          href="${input.url}"
          className="text-blue-600 font-medium hover:underline"
        >
          Learn more →
        </a>
        \`\`\`

     OUTPUT FORMAT:
     Return ONLY the complete page.tsx file content with:
     1. Metadata export with SEO-optimized title, description, OG tags
     2. All components inline in the same file
     3. Full Tailwind CSS styling
     4. All links pointing to ${input.url}
     5. NO navigation menu or footer links
     6. Conversion-focused landing page layout`,
     });

     Update variable naming (for clarity, optional):
     - Line 394: blogResult → Consider renaming to landingPageResult throughout
     - Line 395: blogPage → Consider renaming to landingPage

     ---
     Phase 6: Update Deployment Project Naming

     File: /workflows/untitled-4.ts

     Changes:

     Update project name generation (line 511):
     const projectName = `funnel-${scrapeResult.metadata.industry.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

     ---
     Phase 7: Update Return Values and MongoDB Save

     File: /workflows/untitled-4.ts

     Changes:

     1. Update workflow return value (lines 678-686):
     return {
       landingPage: blogResult.blogPage, // Keep internal field name for now
       liveUrl: deployResult.url,
       deploymentId: deployResult.deploymentId,
       spec: specResult.text,
       scrapeMetadata: scrapeResult.metadata,
       campaignDescription: input.campaignDescription,
       targetUrl: input.url,
       runId,
     };

     2. Update MongoDB save data (lines 653-668):
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
         liveUrl: deployResult.url,
         deploymentId: deployResult.deploymentId,
         createdAt: Date.now(),
       },
     });

     3. Update MongoDB interface in /workflows/steps/save-to-mongodb-step.ts:
     workflowData: {
       runId: string;
       url: string;
       industry: string;
       brandAssets: any;
       branding?: any;
       campaignDescription: string; // NEW
       landingPageSpec: string; // NEW (renamed from blogSpec)
       liveUrl?: string;
       deploymentId?: string;
       createdAt: number;
     };

     ---
     Phase 8: Update Status Page UI Labels

     File: /app/workflow/[runId]/page.tsx

     Changes:

     1. Update page title (line 42):
     title: 'Landing Page Status',

     2. Update link text (line 51):
     <Link href="/">← Back to Landing Page Generator</Link>

     File: /components/workflow-status-client.tsx

     Changes:

     1. Update heading text (line 563):
     <h2 className="text-2xl font-bold mb-4">Creating Your Landing Page</h2>

     2. Update success message (line 587):
     <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mb-2">
       ✓ Landing Page Created Successfully!
     </h2>

     3. Update button text (line 614):
     Generate Another Landing Page

     4. Update error message (line 533):
     {error || 'An error occurred while generating the landing page.'}

     ---
     File Summary

     | File                                     | Action | Key Changes                                         |
     |------------------------------------------|--------|-----------------------------------------------------|
     | /app/page.tsx                            | MODIFY | Add campaign description field, update labels       |
     | /app/api/workflows/untitled-4/route.ts   | MODIFY | Accept campaignDescription parameter                |
     | /workflows/untitled-4.ts                 | MODIFY | Remove search step, update prompts for funnel focus |
     | /app/workflow/[runId]/page.tsx           | MODIFY | Update page title and labels                        |
     | /components/workflow-status-client.tsx   | MODIFY | Update UI text from "blog" to "landing page"        |
     | /workflows/steps/save-to-mongodb-step.ts | MODIFY | Add campaignDescription field to interface          |

     Total: 6 files modified (no new files)

     ---
     Testing Checklist

     Functional Testing

     1. ✅ Input Form:
       - URL field accepts valid URLs
       - Campaign description field requires minimum 20 characters
       - Form validates both fields before submission
       - Submit button disabled when fields are invalid
     2. ✅ Workflow Execution:
       - Scraping step extracts brand assets successfully
       - Spec generation creates funnel-focused content
       - V0 creates landing page (not blog) structure
       - Deployment succeeds to Vercel
     3. ✅ Generated Landing Page:
       - NO navigation menu at top
       - NO footer navigation links
       - ALL buttons link to input URL
       - ALL CTAs link to input URL
       - Brand logo links to input URL (if clickable)
       - NO "Read More" or external links
       - Hero section with clear CTA
       - Value propositions section
       - Features section
       - Final CTA section
     4. ✅ Link Verification:
       - Inspect deployed page HTML
       - Verify all <a href> tags point to input URL only
       - Verify all <button> click handlers link to input URL
       - NO links to "#" or "javascript:void(0)" or dead pages
     5. ✅ Brand Consistency:
       - Colors match scraped brand
       - Fonts match brand typography
       - Logo displayed correctly
       - Tone matches brand personality

     UI Testing

     6. ✅ Status Page:
       - Shows correct step labels (no "Search Industry News")
       - Progress bar updates correctly
       - Success state shows "Landing Page Created"
       - Error messages reference "landing page" not "blog"
     7. ✅ Home Page:
       - Title says "Landing Page Generator"
       - Features list is conversion-focused
       - Submit button says "Generate Landing Page"

     ---
     Example Campaign Descriptions

     Provide these as examples to users:

     Example 1 - SaaS Product:
     Target small business owners who struggle with manual invoicing.
     Campaign focus: Promote our automated invoicing software that
     saves 10+ hours per week. Emphasize ease of use and time savings.

     Example 2 - E-commerce:
     Target fashion-conscious millennials looking for sustainable clothing.
     Campaign: Promote our new eco-friendly summer collection.
     Highlight sustainable materials and ethical manufacturing.

     Example 3 - Service Business:
     Target homeowners planning kitchen renovations. Campaign: Promote
     free design consultation service. Focus on stress-free renovation
     experience and expert guidance.

     ---
     Benefits of Funnel/Landing Page vs Blog

     Previous (Blog):
     - Multi-purpose content
     - Navigation to other pages
     - External links
     - Information-focused
     - Longer reading time

     New (Funnel/Landing Page):
     - Single-purpose conversion
     - NO navigation or exits
     - ALL links to main site
     - Action-focused
     - Quick decision path
     - Higher conversion potential

     ---
     Potential Issues & Solutions

     Issue 1: V0 Still Generates Navigation

     Solution: Add explicit negative constraints in V0 prompt:
     DO NOT INCLUDE:
     - Navigation menus (<nav>, header links)
     - Footer links
     - Breadcrumbs
     - External links
     - Blog-style "Read More" links

     Issue 2: Campaign Description Too Vague

     Solution: Add validation and examples:
     - Minimum 20 characters
     - Show placeholder with good example
     - Validate for key elements (target + topic)

     Issue 3: Links Still Point to "#"

     Solution: Add post-generation validation:
     // Validate that all links point to input URL
     if (pageCode.includes('href="#"') || pageCode.includes('href=""')) {
       throw new Error('Generated code contains invalid links');
     }

     ---
     Future Enhancements (Out of Scope)

     1. Campaign Templates: Pre-built templates for common funnel types
     2. A/B Testing: Generate multiple variations
     3. Analytics Integration: Add conversion tracking
     4. Form Integration: Embed lead capture forms
     5. Custom CTA Text: Let users specify button text
     6. Landing Page Library: Save and reuse successful campaigns
     7. Performance Metrics: Track conversion rates

     ---
     Implementation Notes

     Critical Requirements Recap

     1. ALL links must point to input URL - This is the most important requirement
     2. Remove search step - User provides content direction via campaign description
     3. Change prompts from blog to funnel - Spec and V0 prompts must be conversion-focused
     4. Update all UI labels - No references to "blog" should remain

     Prompt Engineering Tips

     For Spec Generation:
     - Focus on benefits over features
     - Use action-oriented language
     - Include urgency/scarcity elements
     - Structure for scanability

     For V0 Prompt:
     - Repeat link restriction 3-4 times
     - Provide examples of correct link implementation
     - Explicitly state what NOT to include
     - Emphasize single-purpose conversion focus

     Validation Strategy

     After V0 generates code, add validation:
     // Check for forbidden elements
     const forbiddenPatterns = [
       /<nav\s/i,           // Navigation elements
       /href="#"/,          // Empty links
       /href="javascript:/, // JavaScript links
       /Learn More/i,       // Blog-style CTAs
     ];

     for (const pattern of forbiddenPatterns) {
       if (pattern.test(pageCode)) {
         console.warn(`Generated code contains forbidden pattern: ${pattern}`);
       }
     }


> perfect. it worked great! now let's add a step before what we are giving to v0 to have assets (images) generated by Nano
 Banana model provided through Fal. Let me upload an image where I am providing context and URL, if I do provide an image,
 use the image along brand Abscess and identity we have collected to provide the model with context and use this image 
model /Users/ashnouruzi/blog-agent/docs/fal-image-2-image.md and have assets made for v0 to use in the funnel site. if i 
didn't provide and image just use the material from brand idenity we have scraped or context of the funnel we are creating
 to produce the images. whether I upload an image to provide additional style, the prompt we use to generate the images 
should be baed on the design language and style of the brand identity and according and relevant to the funnel campagin we
 are making. If I do provide an image, give that way more weight as the style of the images we are making, i want the 
assets to be more influenced by images that I upload if I do upload any. 

read the Fal documentation to understand the API


we need to:

  1. Add optional image upload to input form
  2. Create Fal image generation step using Nano Banana Pro
  3. Pass generated images to V0 for use in landing page


⏺ This is a new feature request. Let me explore the codebase to understand how to add image generation with Fal:

 · How many images should we generate for each landing page? → no hero image. just 3 supporting images for value 
     props/features sections or call to action
     · When the user uploads an image, how should we use it with Fal's image-to-image model? → Use uploaded image as style
      guide along with brand identity context and campaign content and generate completly new images matching aesthetic of
      images provided primarily and if no images are provided just brand identity details we have scraped, images we 
     collected and with campaign-relevant content
     · What should happen if image generation fails or no image is uploaded? → if we have no images at all, no user 
     uploaded ones or brand assets (OG image, favicon), then use this text to image model to provide campagin details and 
     a prompt. here are the docs /Users/ashnouruzi/blog-agent/docs/fal-text-2-image.md it's also nano banana pro provided 
     by fal but its an text to image one


     · What aspect ratios should we use for the generated images? → 1:1 square