# Untitled 4

This is a Next.js workflow project generated from Workflow Builder.

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Workflow API

Your workflow is available at `/api/workflows/untitled-4`.

Send a POST request with a JSON body to trigger the workflow:

```bash
curl -X POST http://localhost:3000/api/workflows/untitled-4 \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

## Deployment

Deploy your workflow to Vercel:

```bash
vercel deploy
```

For more information, visit the [Workflow documentation](https://workflow.is).
# blog-agent
