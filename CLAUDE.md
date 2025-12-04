# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application built with the Vercel Workflow framework (workflow.is) for creating and executing durable, retryable workflows. The project uses Next.js 16 with the App Router, React 19, TypeScript, and Tailwind CSS 4.

**Workflow Documentation**: Complete Workflow framework documentation is available at `/Users/ashnouruzi/workflow-docs/`. Key files:
- `START_HERE.md` - Overview and navigation guide
- `WORKFLOW_QUICK_REFERENCE.md` - Essential code snippets and patterns
- `WORKFLOW_EXAMPLES_ANALYSIS.md` - Deep dive into implementation patterns
- `WORKFLOW_EXAMPLES_MATRIX.md` - Feature comparison and pattern lookup

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server (localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Architecture Overview

### Workflow Framework Integration

This project uses the Vercel Workflow framework which provides durable, retryable workflows for reliable AI applications:

- **Workflow Compiler**: The project uses the `workflow` TypeScript plugin (configured in `tsconfig.json`) and Next.js integration via `withWorkflow()` in `next.config.ts`
- **"use workflow"** directive: Marks functions as workflow entry points - makes the entire process durable with automatic state persistence
- **"use step"** directive: Marks functions as retryable operations that automatically retry on failure

**Key Workflow APIs**:
- `start(workflow, args)` - Start a workflow execution (from `workflow/api`)
- `fetch` - Override for AI SDK integration (from `workflow`)
- `createWebhook()` - Create webhooks for external callbacks (from `workflow`)
- `sleep(duration)` - Delay execution (supports '5s', '24h', etc.) (from `workflow`)
- `FatalError` - Mark errors as non-recoverable (from `workflow`)
- `defineHook()` - Create event hooks for actor patterns (from `workflow`)

### Directory Structure

- **`/workflows`**: Contains workflow definitions (e.g., `untitled-4.ts`)
  - Workflows import step functions and define the execution flow
  - Auto-generated files with warning comments about manual editing
  - Each workflow is a function marked with `"use workflow"`

- **`/app/api/workflows/[workflow-name]`**: API routes for triggering workflows
  - Uses `start()` from `workflow/api` to execute workflows
  - Accepts POST requests with JSON payloads
  - Returns success/error responses

- **`/lib/steps`**: Reusable step implementations
  - `http-request.ts`: HTTP request step with flexible headers/body handling
  - `condition.ts`: Conditional branching step
  - `database-query.ts`: PostgreSQL query execution (requires `DATABASE_URL` env var)

- **`/lib/credential-helper.ts`**: Environment-based credential management
  - Maps integration types to environment variables
  - Used by steps that need API keys or credentials

### Key Architectural Patterns

1. **Step Functions**: Individual operations that can be composed into workflows
   - Each step is an async function with a single input object parameter
   - Steps are marked with `"use step"` directive
   - Return structured data that can be referenced in later steps
   - **Automatic Retry**: Steps retry on transient failures by default

2. **Template Interpolation**: Workflows use `{{step-name.field}}` syntax to reference outputs from previous steps

3. **Environment Variables**:
   - Store credentials and configuration in `.env.local`
   - Integration-specific env vars defined in `INTEGRATION_ENV_VARS` mapping
   - Database connection via `DATABASE_URL`

4. **Error Handling**:
   - **Default behavior**: Thrown errors trigger automatic retry
   - **FatalError**: Use for non-recoverable errors that should not retry
   - Steps can return error objects for graceful degradation

5. **AI SDK Integration**:
   - Must override `globalThis.fetch` with workflow's fetch for durability
   - Example: `import { fetch } from 'workflow'; globalThis.fetch = fetch;`
   - Allows AI SDK calls (`generateText`, `streamText`, etc.) to be retryable

6. **Workflow Patterns** (8 core patterns available):
   - **Sequential**: Step-by-step with quality checks
   - **Parallel**: Multiple concurrent operations with `Promise.all()`
   - **Routing**: Classify input → route to different handlers
   - **Evaluator Loop**: Generate → evaluate → improve cycle
   - **Orchestrator/Worker**: Plan → execute by workers
   - **Webhook**: Wait for external callbacks with `createWebhook()`
   - **Actor**: Long-running stateful processes with `defineHook()`
   - **DurableAgent**: Conversational AI with tool calling

## Working with Workflows

### Creating a New Workflow

Basic workflow structure:

```typescript
import { start } from 'workflow/api';

export async function myWorkflow(input: string) {
  "use workflow";

  const result1 = await step1(input);
  const result2 = await step2(result1);

  return result2;
}

// In API route:
export async function POST(request: Request) {
  const body = await request.json();
  const result = await start(myWorkflow, [body.input]);
  return Response.json({ result: await result.returnValue });
}
```

### Creating a New Workflow Step

Steps should follow this pattern:

```typescript
export async function myCustomStep(input: {
  param1: string;
  param2?: number;
}) {
  "use step";

  // Throw for retryable errors (will auto-retry)
  if (transientError) {
    throw new Error('Temporary failure');
  }

  // Use FatalError for non-recoverable errors
  if (permanentError) {
    throw new FatalError('Cannot recover');
  }

  return { success: true, data: result };
}
```

### AI SDK Integration Pattern

```typescript
import { generateText } from 'ai';
import { fetch } from 'workflow';

// REQUIRED: Override fetch for workflow durability
globalThis.fetch = fetch;

async function generateContent(prompt: string) {
  "use step";

  const { text } = await generateText({
    model: 'openai/gpt-4o',
    prompt: prompt
  });

  return text;
}
```

### Parallel Execution

```typescript
async function parallelWorkflow(input: string) {
  "use workflow";

  // Execute multiple steps concurrently
  const [image, text, metadata] = await Promise.all([
    generateImage(input),
    generateText(input),
    generateMetadata(input)
  ]);

  return { image, text, metadata };
}
```

### Webhook Pattern (Wait for External Callbacks)

```typescript
import { createWebhook } from 'workflow';

async function approvalWorkflow(email: string) {
  "use workflow";

  const webhook = createWebhook();

  // Send email with webhook.url
  await sendApprovalEmail(email, webhook.url);

  // Wait for callback (pauses workflow until webhook is called)
  const request = await webhook;
  const params = new URL(request.url).searchParams;

  return { approved: params.get('status') === 'approved' };
}
```

### Modifying Workflows

- Workflow files in `/workflows` are auto-generated from a visual workflow builder
- The comment `DO NOT EDIT MANUALLY` should be respected
- To modify workflows, use the workflow editor at workflow.is
- Step implementations in `/lib/steps` can be edited directly

### Adding New Integrations

1. Add required env var keys to `INTEGRATION_ENV_VARS` in `lib/credential-helper.ts`
2. Add corresponding values to `.env.local`
3. Use `fetchCredentials()` in step implementations to access credentials

### Common Workflow Patterns

Refer to `/Users/ashnouruzi/workflow-docs/WORKFLOW_QUICK_REFERENCE.md` for:
- Pattern decision tree (which pattern to use)
- 40+ ready-to-use code snippets
- Common issues and solutions
- Deployment checklist

## TypeScript Configuration

- Target: ES2017
- JSX: react-jsx (React 19 automatic JSX runtime)
- Module Resolution: bundler (Vite-style)
- Path alias: `@/*` maps to project root

## Important Notes

- This project uses Next.js App Router (not Pages Router)
- Tailwind CSS 4 uses `@tailwindcss/postcss` plugin
- The workflow plugin must remain in `tsconfig.json` for proper compilation
- **CRITICAL**: Always override `globalThis.fetch` with workflow's fetch when using AI SDK
- Steps marked with `"use step"` automatically retry on failure
- Use `FatalError` for errors that should NOT retry
- Workflows maintain state across failures and retries
- All workflow code must be serializable (no closures over external state)

## Testing & Debugging

### Simulating Failures

Test retry behavior by adding random failures:

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

### Logging Best Practices

```typescript
console.log('[WORKFLOW] Step started', { timestamp: Date.now() });
const result = await operation();
console.log('[WORKFLOW] Step completed', {
  duration: Date.now() - startTime,
  result
});
```

## Common Issues

| Issue | Solution |
|-------|----------|
| AI SDK calls don't retry | Wrap in `'use step'` function and override fetch |
| `globalThis.fetch` undefined | Import from workflow: `import { fetch } from 'workflow'` |
| Webhook never resolves | Ensure callback URL is publicly accessible |
| State lost after restart | Workflows automatically persist state (no action needed) |
| Type errors with AI output | Use `generateObject()` with Zod schema |

## Deployment

Before deploying to Vercel:

- [ ] All `'use workflow'` and `'use step'` directives in place
- [ ] Environment variables configured in Vercel project settings
- [ ] `globalThis.fetch` overridden where needed
- [ ] Error handling with `FatalError` for non-recoverable errors
- [ ] Logging patterns consistent
- [ ] Test retry behavior with simulated failures
