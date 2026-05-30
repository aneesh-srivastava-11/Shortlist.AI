import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Sparkles, CheckCircle2, ChevronRight, Cpu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free ATS Resume Checker & Scanner | Shortlist.AI',
  description:
    'Test your resume against Applicant Tracking Systems (ATS) instantly. Find formatting errors, check keyword match rate, and get recruiter simulation feedback.',
};

export default function AtsResumeCheckerPage() {
  return (
    <div className="min-h-screen bg-[#04020a] text-foreground grid-bg relative">
      {/* Background glow */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

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
            Launch Optimizer Free
          </Link>
        </div>
      </header>

      {/* Main SEO Content */}
      <main className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Free Online <span className="text-primary">ATS Resume Checker</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ensure your resume passes automated filters. Our recruiter-grade parser checks formatting, keywords, and density metrics instantly.
          </p>
          <div className="flex justify-center pt-4">
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold rounded-xl transition hover:shadow-lg hover:shadow-primary/25 flex items-center gap-2"
            >
              Scan Your Resume Now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Explain ATS */}
        <section className="border border-border rounded-2xl p-8 bg-card/20 backdrop-blur space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" /> How Does an ATS Scanner Work?
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Applicant Tracking Systems (ATS) are software suites used by over 98% of Fortune 500 companies to filter, screen, and rank job applicants. Instead of reading your resume visually, the ATS parses your document into a text-only representation. If your resume contains unreadable formatting (like tables, columns, charts, or non-standard headers), the system will fail to extract your experience and reject you automatically.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="font-bold text-white text-sm">Text Parsing</h3>
              <p className="text-xs text-muted-foreground">The parser strips layouts to look for skills, experiences, and degrees.</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">2</div>
              <h3 className="font-bold text-white text-sm">Keyword Comparison</h3>
              <p className="text-xs text-muted-foreground">It checks if your experiences match the target job description keywords.</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">3</div>
              <h3 className="font-bold text-white text-sm">Ranking & Shortlist</h3>
              <p className="text-xs text-muted-foreground">Candidates with matching scores are placed in the shortlist for recruiters to read.</p>
            </div>
          </div>
        </section>

        {/* Features Checklist */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">What does Shortlist.AI check?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-3 border border-border p-4 rounded-xl bg-card/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm">Formatting Compliance</h4>
                <p className="text-xs text-muted-foreground">Flags columns, text boxes, and images that break database parsers.</p>
              </div>
            </div>
            <div className="flex gap-3 border border-border p-4 rounded-xl bg-card/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm">Keyword Match Percentage</h4>
                <p className="text-xs text-muted-foreground">Highlights missing skills, tools, and experience indicators from the job details.</p>
              </div>
            </div>
            <div className="flex gap-3 border border-border p-4 rounded-xl bg-card/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm">Keyword Stuffing Guard</h4>
                <p className="text-xs text-muted-foreground">Alerts you if keyword density exceeds 4%, protecting you from spam filters.</p>
              </div>
            </div>
            <div className="flex gap-3 border border-border p-4 rounded-xl bg-card/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm">Contact Details Extraction</h4>
                <p className="text-xs text-muted-foreground">Ensures contact info (email, location, phone) is parsed correctly.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
