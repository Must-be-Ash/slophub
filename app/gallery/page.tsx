'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Calendar, Globe } from 'lucide-react';

interface Workflow {
  _id: string;
  runId: string;
  url: string;
  industry?: string;
  campaignDescription: string;
  liveUrl: string;
  screenshotUrl?: string;
  createdAt: number;
  brandAssets?: {
    title?: string;
    description?: string;
  };
  generatedImages?: Array<{
    name: string;
    blobUrl: string;
  }>;
}

export default function GalleryPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await fetch('/api/gallery');

        if (!response.ok) {
          throw new Error('Failed to fetch workflows');
        }

        const data = await response.json();
        setWorkflows(data.workflows);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load gallery');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

      {/* Header */}
      <header className="relative py-6 px-6 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image
              src="/logo-ts.svg"
              alt="Slophub"
              width={60}
              height={60}
              className="object-contain"
            />
            <span className="text-lg font-semibold text-slate-900 group-hover:text-slate-600 transition-colors" style={{ fontFamily: 'var(--font-caprasimo)' }}>
              Slophub
            </span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
          >
            Create New
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 px-6 py-12 relative">
        <div className="max-w-7xl mx-auto">
          {/* Page title */}
          <div className="mb-12">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3" style={{ fontFamily: 'var(--font-caprasimo)' }}>
              Gallery
            </h1>
            <p className="text-lg text-slate-500">
              {loading ? 'Loading...' : `${workflows.length} landing pages created`}
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <svg className="w-8 h-8 text-slate-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-white rounded-2xl shadow-sm shadow-black/5 p-8">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {/* Gallery grid */}
          {!loading && !error && workflows.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm shadow-black/5 p-12 text-center">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 p-3">
                <Image
                  src="/logo-ts.svg"
                  alt="Slophub"
                  width={40}
                  height={40}
                  className="object-contain opacity-60"
                />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No landing pages yet
              </h3>
              <p className="text-slate-500 mb-6">
                Create your first landing page to get started
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-3 bg-black text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
              >
                Create Landing Page
              </Link>
            </div>
          )}

          {!loading && !error && workflows.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <Link
                  key={workflow.runId}
                  href={`/landing/${workflow.runId}`}
                  className="group bg-white rounded-2xl shadow-sm shadow-black/5 overflow-hidden hover:shadow-md hover:shadow-black/10 transition-all duration-200 hover:scale-[1.02]"
                >
                  {/* Screenshot/Preview with iframe fallback */}
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    {workflow.screenshotUrl ? (
                      <>
                        <Image
                          src={workflow.screenshotUrl}
                          alt={workflow.brandAssets?.title || 'Landing page'}
                          fill
                          className="object-cover object-top"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                          <ExternalLink className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </>
                    ) : workflow.generatedImages && workflow.generatedImages.length > 0 ? (
                      <>
                        <Image
                          src={workflow.generatedImages[0].blobUrl}
                          alt={workflow.brandAssets?.title || 'Landing page'}
                          fill
                          className="object-cover"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                          <ExternalLink className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Iframe preview for cards without screenshot */}
                        <iframe
                          src={workflow.liveUrl}
                          className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-[0.5] origin-top-left"
                          title={workflow.brandAssets?.title || 'Landing page preview'}
                          sandbox="allow-scripts allow-same-origin"
                          style={{
                            width: '200%',
                            height: '200%',
                          }}
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                          <ExternalLink className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1 group-hover:text-slate-600 transition-colors">
                      {workflow.brandAssets?.title || 'Untitled'}
                    </h3>
                    {workflow.brandAssets?.description && (
                      <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                        {workflow.brandAssets.description}
                      </p>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(workflow.createdAt)}</span>
                      </div>
                      {workflow.industry && (
                        <div className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                          {workflow.industry}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-400 relative border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        Powered by <span style={{ fontFamily: 'var(--font-caprasimo)' }}>Slophub</span>
      </footer>
    </main>
  );
}
