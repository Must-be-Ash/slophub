'use client';

import { useState } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackLayout,
} from '@codesandbox/sandpack-react';

interface BlogPreviewProps {
  blogPageContent: string;
}

// Extract React code from v0 markdown output
function extractCodeFromV0Output(content: string): string {
  // Look for ```tsx or ```jsx code blocks
  const codeBlockRegex = /```(?:tsx|jsx)(?:\s+file="[^"]*")?\s*\n([\s\S]*?)```/;
  const match = content.match(codeBlockRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no code block found, return the content as-is (might already be code)
  return content;
}

// Transform the code for Sandpack compatibility
function transformCodeForSandpack(code: string): string {
  let transformed = code;
  
  // Remove 'use client' directive if present
  transformed = transformed.replace(/['"]use client['"];\s*/g, '');
  
  // Remove Metadata export (not needed for preview)
  transformed = transformed.replace(/export const metadata:\s*Metadata\s*=\s*\{[\s\S]*?\};\s*/g, '');
  
  // Replace next/image with a simple img shim
  transformed = transformed.replace(
    /import Image from ['"]next\/image['"]/g,
    "const Image = ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />"
  );
  
  // Replace next/link with a simple anchor shim
  transformed = transformed.replace(
    /import Link from ['"]next\/link['"]/g,
    "const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>"
  );
  
  // Remove Metadata import
  transformed = transformed.replace(/import\s*{\s*Metadata\s*}\s*from\s*['"]next['"]\s*;?\s*/g, '');
  
  return transformed;
}

// Next.js shims for Sandpack
const nextShims = `
// Next.js shims for preview
export const Image = ({ src, alt, width, height, className, ...props }) => (
  <img src={src} alt={alt} width={width} height={height} className={className} {...props} />
);

export const Link = ({ href, children, className, ...props }) => (
  <a href={href} className={className} {...props}>{children}</a>
);

export const Metadata = {};
`;

export function BlogPreview({ blogPageContent }: BlogPreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  
  // Extract and transform the code
  const extractedCode = extractCodeFromV0Output(blogPageContent);
  const transformedCode = transformCodeForSandpack(extractedCode);
  
  // Sandpack files configuration
  const files = {
    '/App.js': {
      code: transformedCode,
      active: true,
    },
    '/next-shims.js': {
      code: nextShims,
      hidden: true,
    },
    '/styles.css': {
      code: `
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Reset and base styles */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
`,
      hidden: true,
    },
  };

  return (
    <div className="w-full">
      {/* Tab buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'preview'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'code'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Code
        </button>
      </div>

      {/* Sandpack container */}
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <SandpackProvider
          template="react"
          files={files}
          customSetup={{
            dependencies: {
              'lucide-react': 'latest',
            },
          }}
          options={{
            externalResources: [
              'https://cdn.tailwindcss.com',
            ],
            classes: {
              'sp-wrapper': 'custom-sandpack-wrapper',
              'sp-layout': 'custom-sandpack-layout',
            },
          }}
          theme="auto"
        >
          <SandpackLayout>
            {activeTab === 'preview' ? (
              <SandpackPreview
                showNavigator={false}
                showRefreshButton={true}
                style={{ height: '600px', width: '100%' }}
              />
            ) : (
              <SandpackCodeEditor
                showTabs={false}
                showLineNumbers={true}
                showInlineErrors={true}
                wrapContent={true}
                style={{ height: '600px', width: '100%' }}
              />
            )}
          </SandpackLayout>
        </SandpackProvider>
      </div>

      {/* Raw code fallback for copying */}
      {activeTab === 'code' && (
        <div className="mt-4">
          <button
            onClick={() => navigator.clipboard.writeText(extractedCode)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
          >
            Copy Original Code
          </button>
        </div>
      )}
    </div>
  );
}

