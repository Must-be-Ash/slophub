'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { ArrowRight, Grid3x3 } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [url, setUrl] = useState('');
  const [campaignDescription, setDescription] = useState('');
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [focusedCampaign, setFocusedCampaign] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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

  const addImages = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const previews: string[] = [];

    // Can only have 2 images max
    const remainingSlots = 2 - referenceImages.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    for (const file of filesToProcess) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Images must be less than 10MB each');
        continue;
      }
      // Validate file type - only PNG, JPEG, JPG, WebP
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        setError('Please upload PNG, JPEG, or WebP images only');
        continue;
      }
      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === validFiles.length) {
          setImagePreviews([...imagePreviews, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    }

    if (validFiles.length > 0) {
      setReferenceImages([...referenceImages, ...validFiles]);
      setError(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addImages(e.target.files);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files) {
      addImages(files);
    }
  };

  const removeImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[Form Submit] Starting submission');
    console.log('[Form Submit] URL:', url);
    console.log('[Form Submit] Campaign description length:', campaignDescription.length);
    console.log('[Form Submit] Reference images:', referenceImages.length, referenceImages.map(i => i.name));

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

    // Upload first image if provided (keeping backward compatibility)
    if (referenceImages.length > 0) {
      console.log('[Upload] Starting image upload:', referenceImages[0].name, referenceImages[0].size, 'bytes');
      try {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', referenceImages[0]);

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
      console.log('[Upload] No reference images provided, skipping upload');
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
            <Image
              src="/logo-ts.svg"
              alt="Slophub"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3" style={{ fontFamily: 'var(--font-caprasimo)' }}>
              Slophub
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reference Images (Optional)
              </label>

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`
                  relative bg-white rounded-2xl shadow-sm shadow-black/5 p-6 transition-all duration-200 cursor-pointer
                  ${isDragging ? 'ring-2 ring-black/20 bg-slate-50' : ''}
                `}
              >
                {/* Upload Input */}
                <input
                  type="file"
                  id="image"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading || referenceImages.length >= 2}
                />

                {/* Drop Zone */}
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center py-8 cursor-pointer"
                >
                  <svg
                    className="w-12 h-12 text-slate-300 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    {isDragging ? 'Drop images here' : 'Drag & drop images or click to browse'}
                  </p>
                  <p className="text-xs text-slate-400">
                    PNG, JPEG, or WebP • Max 2 images
                  </p>
                </label>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl border-2 border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-xs text-slate-400 text-center">
                  Images will guide the style of generated assets
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
          <div className="mt-12 flex items-center justify-center gap-3 md:gap-6 text-[11px] md:text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="whitespace-nowrap">Conversion-focused</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="whitespace-nowrap">Brand-consistent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="whitespace-nowrap">Single-purpose CTAs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-400 relative">
        Powered by <span style={{ fontFamily: 'var(--font-caprasimo)' }}>Slophub</span>
      </footer>
    </main>
  );
}
