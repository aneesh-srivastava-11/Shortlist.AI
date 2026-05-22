import React from 'react';
import Link from 'next/link';
import { Sparkles, FileText, ChevronRight, Check } from 'lucide-react';

interface PageProps {
  params: Promise<{ role: string }>;
}

const MOCK_EXAMPLES: Record<string, { title: string; bullets: string[]; summary: string }> = {
  'software-engineer': {
    title: 'Software Engineer Resume Example',
    summary: 'Senior Software Engineer with 5+ years of experience optimizing full stack JavaScript applications, scaling microservices, and leading scrum squads.',
    bullets: [
      'Refactored database schema structures and PostgreSQL queries, shaving off 120ms of API server response latency.',
      'Designed and deployed responsive web layouts in Next.js and Tailwind, lifting user conversion metrics by 14%.',
      'Orchestrated automated CI/CD deployment pipelines on Vercel, reducing production delivery times by 4 hours weekly.',
    ],
  },
  'ai-engineer': {
    title: 'AI Engineer Resume Example',
    summary: 'AI Engineer specializing in RAG architectures, neural fine-tuning, and scalable developer inference tools.',
    bullets: [
      'Engineered semantic vector search features using Pinecone and LangChain, enhancing model response recall by 22%.',
      'Optimized LLM model routing workflows, reducing API token expenditures by 25% while maintaining response quality.',
      'Fine-tuned small language models (SLMs) on custom proprietary support logs to achieve a 92% automated issue resolution rate.',
    ],
  },
  'product-manager': {
    title: 'Product Manager Resume Example',
    summary: 'Technical Product Manager focused on product adoption, subscription growth, and cross-functional development cycles.',
    bullets: [
      'Overhauled onboarding checkout funnels using A/B testing, resulting in a 19% growth in Premium subscription conversions.',
      'Wrote technical product specifications and mapped product roadmaps alongside engineering leads for SaaS features.',
      'Directed cross-functional sprints for payment system updates, improving transaction reliability indices to 99.9%.',
    ],
  },
  'data-analyst': {
    title: 'Data Analyst Resume Example',
    summary: 'Data Analyst with database schema design and visual dashboard reporting expertise.',
    bullets: [
      'Programmed Python automation scripts to extract data from multiple APIs, eliminating 8 hours of manual data mining weekly.',
      'Designed Tableau business intelligence dashboards for executive teams, driving a 15% reduction in yearly operating costs.',
      'Audited database storage pipelines to clean deprecated records, saving 12% in data warehousing infrastructure costs.',
    ],
  },
};

export default async function ExamplesPage({ params }: PageProps) {
  const resolvedParams = await params;
  const roleSlug = resolvedParams.role;
  const example = MOCK_EXAMPLES[roleSlug] || {
    title: `${roleSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Resume Example`,
    summary: `Professional in the ${roleSlug.replace(/-/g, ' ')} industry with a history of driving efficiency improvements.`,
    bullets: [
      'Collaborated on cross-functional teams to outline goals and establish key performance metrics.',
      'Initiated software/workflow upgrades, leading to a 10% reduction in processing cycle times.',
      'Managed document controls and drafted user reports to align with company standards.',
    ],
  };

  return (
    <div className="min-h-screen bg-[#04020a] text-foreground grid-bg relative">
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

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
            Create Resume Free
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        <div className="space-y-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Resume Templates & Examples
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">{example.title}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Copy these recruiter-approved, metrics-focused bullet points to optimize your resume for your target role.
          </p>
        </div>

        {/* Summary Example */}
        <section className="border border-border rounded-xl p-6 bg-card/20 space-y-3">
          <h3 className="font-bold text-white text-base">Example Summary Section</h3>
          <p className="text-sm text-muted-foreground leading-relaxed italic bg-background/40 p-3 rounded-lg border border-border">
            &ldquo;{example.summary}&rdquo;
          </p>
        </section>

        {/* Experience Bullets Examples */}
        <section className="space-y-4">
          <h3 className="font-bold text-white text-base">Tailored Bullet Point Examples</h3>
          <div className="space-y-3">
            {example.bullets.map((bullet, i) => (
              <div key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-3 py-0.5">
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Tips list */}
        <section className="border border-border/50 rounded-xl p-5 bg-primary/5 space-y-3">
          <h4 className="text-sm font-bold text-white">How to adapt these examples:</h4>
          <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
            <li>Replace the metrics (percentages and numbers) with your actual estimated values.</li>
            <li>Incorporate the specific tech terms that match your past projects.</li>
            <li>Use strong action verbs (e.g. Refactored, Engineered, Overhauled, Audited) at the start of each bullet point.</li>
          </ul>
        </section>

        {/* CTA */}
        <div className="flex justify-center pt-6">
          <Link
            href="/"
            className="px-6 py-3 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition flex items-center gap-2"
          >
            Launch Builder with Examples <ChevronRight className="w-4.5 h-4.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
