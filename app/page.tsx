'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { ArrowRight, Sparkles, Grid3x3 } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [campaignDescription, setDescription] = useState('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [focusedCampaign, setFocusedCampaign] = useState(false);
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

  const validateCampaign = (description: string): string | null => {
    if (!description.trim()) return 'Campaign description is required';
    if (description.trim().length < 20) {
      return 'Campaign description must be at least 20 characters';
    }
    return null;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setReferenceImage(file);
      setError(null);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[Form Submit] Starting submission');
    console.log('[Form Submit] URL:', url);
    console.log('[Form Submit] Campaign description length:', campaignDescription.length);
    console.log('[Form Submit] Reference image:', !!referenceImage, referenceImage?.name);

    const urlError = validateUrl(url);
    if (urlError) {
      console.error('[Form Submit] URL validation failed:', urlError);
      setError(urlError);
      return;
    }

    const campaignError = validateCampaign(campaignDescription);
    if (campaignError) {
      console.error('[Form Submit] Campaign validation failed:', campaignError);
      setError(campaignError);
      return;
    }

    setLoading(true);
    setError(null);

    let imageUrl: string | undefined;

    // Upload image if provided
    if (referenceImage) {
      console.log('[Upload] Starting image upload:', referenceImage.name, referenceImage.size, 'bytes');
      try {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', referenceImage);

        console.log('[Upload] Sending POST to /api/upload');
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        console.log('[Upload] Response status:', uploadResponse.status);

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          console.error('[Upload] Upload failed:', errorData);
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.blobUrl;
        console.log('[Upload] ✓ Upload successful:', imageUrl);
      } catch (err) {
        console.error('[Upload] Upload error:', err);
        setError('Failed to upload reference image. Continuing without it...');
        // Continue without image - don't fail the workflow
      } finally {
        setUploadingImage(false);
      }
    } else {
      console.log('[Upload] No reference image provided, skipping upload');
    }

    // Start workflow with optional imageUrl
    try {
      const response = await fetch('/api/workflows/untitled-4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, campaignDescription, imageUrl }),
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

      {/* Header */}
      <header className="relative py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-end">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-all"
          >
            <Grid3x3 className="h-4 w-4" />
            Gallery
          </Link>
        </div>
      </header>

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
              Landing Page Generator
            </h1>
            <p className="text-slate-500 text-lg">
              Create conversion-focused landing pages for your campaigns
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

            <div className="relative">
              <p className="text-sm text-slate-500 mb-2">
                Describe who you're targeting and what this campaign is about
              </p>
              <div
                className={`
                  relative bg-white rounded-2xl transition-all duration-300
                  ${focusedCampaign ? 'shadow-lg shadow-black/5 ring-2 ring-black/5' : 'shadow-sm shadow-black/5'}
                `}
              >
                <textarea
                  value={campaignDescription}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (error) setError(null);
                  }}
                  onFocus={() => setFocusedCampaign(true)}
                  onBlur={() => setFocusedCampaign(false)}
                  placeholder="Example: Target small business owners who need simple invoicing software. Focus on saving time and reducing paperwork hassle."
                  rows={4}
                  className="w-full px-5 py-4 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-base rounded-2xl resize-none"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="relative pt-2">
              <label htmlFor="image" className="block text-sm font-medium text-slate-700 mb-2">
                Reference Image (Optional)
              </label>
              <div className="relative bg-white rounded-2xl shadow-sm shadow-black/5 p-4">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:transition-colors"
                  disabled={loading}
                />
                {imagePreview && (
                  <div className="mt-4 flex items-start gap-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setReferenceImage(null);
                        setImagePreview(null);
                      }}
                      className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  Upload a reference image to guide the style of generated assets
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim() || !campaignDescription.trim() || campaignDescription.trim().length < 20}
              className={`
                w-full py-4 px-6 rounded-2xl font-medium text-base
                flex items-center justify-center gap-2
                transition-all duration-200
                ${loading || !url.trim() || !campaignDescription.trim() || campaignDescription.trim().length < 20
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
                  Creating your landing page...
                </TextShimmer>
              ) : (
                <>
                  Generate Landing Page
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Features hint */}
          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Conversion-focused</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Brand-consistent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Single-purpose CTAs</span>
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
