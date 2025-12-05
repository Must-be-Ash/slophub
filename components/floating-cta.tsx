'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { TextShimmer } from '@/components/ui/text-shimmer';

export function FloatingCTA() {
  return (
    <Link
      href="https://blog-agent-nine.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-24 right-24 z-[9999]"
    >
      <div className="relative">
        {/* 3D Button with depth - shadow layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 rounded-full transform translate-y-1 translate-x-1 blur-sm opacity-40" />

        {/* Main button */}
        <div className="relative bg-gradient-to-br from-slate-900 to-black text-white pl-5 pr-6 py-3 rounded-full shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border border-slate-700/50">
          <div className="flex items-center justify-center gap-3">
            {/* Sparkles icon - no shimmer */}
            <Sparkles className="h-5 w-5 flex-shrink-0" />

            {/* Shimmering text */}
            <TextShimmer
              duration={2}
              className="text-base font-semibold whitespace-nowrap [--base-color:theme(colors.white)] [--base-gradient-color:theme(colors.slate.400)]"
            >
              Made with AI
            </TextShimmer>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-all duration-500" />
        </div>
      </div>
    </Link>
  );
}
