import React from 'react';
import Link from 'next/link';
import { Sparkles, Key, ChevronRight, CheckCircle2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ keyword: string }>;
}

export default async function KeywordPage({ params }: PageProps) {
  const resolvedParams = await params;
  const keywordRaw = resolvedParams.keyword;
  const keywordClean = decodeURIComponent(keywordRaw).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#04020a] text-foreground grid-bg relative">
      <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

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
            Optimize Resume Free
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        <div className="space-y-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" /> Resume Keyword Spotlight
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            How to Include &ldquo;{keywordClean}&rdquo; on a Resume
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Many applicant tracking systems score resumes based on exact keyword presence. Discover how to phrase, format, and represent {keywordClean} on your resume effectively.
          </p>
        </div>

        {/* Why it matters */}
        <section className="border border-border rounded-xl p-6 bg-card/20 space-y-4">
          <h3 className="font-bold text-white text-base">ATS Scanning Logic for &ldquo;{keywordClean}&rdquo;</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The ATS algorithm searches for both the primary keyword &ldquo;{keywordClean}&rdquo; and its commonly associated acronyms or synonyms. To maximize match scoring, place it in your skills section and reinforce it within a work history bullet point detailing a project where you applied it.
          </p>
        </section>

        {/* Action guidelines */}
        <section className="space-y-4">
          <h3 className="font-bold text-white text-base">Best Placement Guidelines</h3>
          <ul className="space-y-3">
            <li className="flex gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4.5 h-4.5 text-primary flex-shrink-0 mt-0.5" />
              <span>Place in <strong>Skills Section</strong> under its appropriate technical classification.</span>
            </li>
            <li className="flex gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4.5 h-4.5 text-primary flex-shrink-0 mt-0.5" />
              <span>Weave into <strong>Experience Bullet Points</strong> alongside a quantitative result (e.g. &ldquo;overhauled system with {keywordClean}, boosting efficiency by 15%&rdquo;).</span>
            </li>
            <li className="flex gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4.5 h-4.5 text-primary flex-shrink-0 mt-0.5" />
              <span>Avoid duplicate mentions in adjacent lines to protect keyword density from stuffing flags.</span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <div className="flex justify-center pt-6">
          <Link
            href="/"
            className="px-6 py-3 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition flex items-center gap-2"
          >
            Check Your Keyword Match <ChevronRight className="w-4.5 h-4.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
