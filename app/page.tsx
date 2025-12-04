'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
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
    <main className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Subtle grid pattern background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.03) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-xl">
          {/* Logo/Brand mark */}
          <div className="flex justify-center mb-12">
            <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3">
              Blog Generator
            </h1>
            <p className="text-slate-500 text-lg">
              Transform any website into an SEO-optimized blog post
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div 
                className={`
                  relative bg-white rounded-2xl transition-all duration-300
                  ${focused ? 'shadow-lg shadow-black/5 ring-2 ring-black/5' : 'shadow-sm shadow-black/5'}
                `}
              >
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Enter website URL"
                  className="w-full px-5 py-4 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-base rounded-2xl"
                  disabled={loading}
                />
              </div>
              
              {error && (
                <p className="absolute -bottom-6 left-0 text-sm text-red-500 font-medium">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className={`
                w-full py-4 px-6 rounded-2xl font-medium text-base
                flex items-center justify-center gap-2
                transition-all duration-200
                ${loading || !url.trim() 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-slate-800 active:scale-[0.98]'
                }
              `}
            >
              {loading ? (
                <TextShimmer
                  duration={1.2}
                  className="text-base font-medium [--base-color:theme(colors.slate.500)] [--base-gradient-color:theme(colors.slate.300)]"
                >
                  Generating your blog...
                </TextShimmer>
              ) : (
                <>
                  Generate Blog
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Features hint */}
          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Brand-aware</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span>SEO-optimized</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Auto-deployed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-400 relative">
        Powered by AI
      </footer>
    </main>
  );
}
