import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Sparkles, FileText, CheckCircle2, ChevronRight, Sliders, CheckSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ATS Resume Keyword Scanner & Density Checker | Shortlist.AI',
  description:
    'Scan job descriptions for key skills, frameworks, and qualifications. Compare keyword density in your resume to avoid keyword stuffing.',
};

export default function ResumeKeywordScannerPage() {
  return (
    <div className="min-h-screen bg-[#04020a] text-foreground grid-bg relative">
      {/* Background glow */}
      <div className="absolute top-[30%] right-[5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-border bg-background/30 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Shortlist<span className="text-primary">.AI</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            Launch Scanner Free
          </Link>
        </div>
      </header>

      {/* Main SEO Content */}
      <main className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Identify Gaps with <span className="text-primary">Resume Keyword Scanner</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Scan job descriptions in seconds. Our scanner extracts hard skills, tools, and experience indicators and highlights matches and gaps in your resume.
          </p>
          <div className="flex justify-center pt-4">
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold rounded-xl transition hover:shadow-lg hover:shadow-primary/25 flex items-center gap-2"
            >
              Scan Your Keywords <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Explain Keyword scan */}
        <section className="border border-border rounded-2xl p-8 bg-card/20 backdrop-blur space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-primary" /> Balances ATS Keywords + Human Readability
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Many tools suggest stuffing as many keywords as possible into a tiny white-colored font at the bottom of the page. This backfires when a human recruiter reviews it. Our engine suggests placing keywords naturally inside achievement bullet points to satisfy both the algorithm and the hiring manager.
          </p>
        </section>
      </main>
    </div>
  );
}
