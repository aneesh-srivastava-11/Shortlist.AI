import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Sparkles, FileText, CheckCircle2, ChevronRight, Award, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Resume Optimizer | Tailor Resumes for Jobs | Shortlist.AI',
  description:
    'Optimize and tailor your resume for specific job descriptions. Rewrite weak bullet points with quantifiable metrics using recruiter-grade AI.',
};

export default function ResumeOptimizerPage() {
  return (
    <div className="min-h-screen bg-[#04020a] text-foreground grid-bg relative">
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

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
            Tailor Your Resume with <span className="text-primary">AI Resume Optimizer</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stop sending the same generic resume. Our real-time editor allows you to weave in required hard skills, refine bullet points, and check scores on the fly.
          </p>
          <div className="flex justify-center pt-4">
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold rounded-xl transition hover:shadow-lg hover:shadow-primary/25 flex items-center gap-2"
            >
              Optimize Your Resume <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Explain Tailoring */}
        <section className="border border-border rounded-2xl p-8 bg-card/20 backdrop-blur space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" /> Why Tailoring Resumes is Mandatory
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Recruiters spend an average of 6 seconds looking at a resume. When you tailor your resume to the exact wording of the job description, the recruiter (and the ATS) can immediately see that you fit the role. Rather than general summaries, you need metrics-focused achievements matching their criteria.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="border border-border/40 p-5 rounded-xl bg-background/25">
              <h3 className="font-bold text-rose-300 text-sm">Generic Resume (6% Interview Rate)</h3>
              <p className="text-xs text-muted-foreground mt-2">&ldquo;Worked on React apps and optimized SQL database queries.&rdquo;</p>
            </div>
            <div className="border border-primary/40 p-5 rounded-xl bg-primary/5">
              <h3 className="font-bold text-emerald-300 text-sm">Tailored Resume (38% Interview Rate)</h3>
              <p className="text-xs text-muted-foreground mt-2">&ldquo;Designed responsive frontends in Next.js, and refactored PostgreSQL indexing to cut query latency by 23%.&rdquo;</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
