import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';

interface PageProps {
  params: Promise<{ role: string }>;
}

const ROLE_DATA: Record<string, { title: string; keywords: string[]; advice: string[]; example: string }> = {
  'software-engineer': {
    title: 'Software Engineer Resume Guide',
    keywords: ['TypeScript', 'React', 'Next.js', 'PostgreSQL', 'Docker', 'REST APIs', 'CI/CD'],
    advice: [
      'Focus on technical stack and architectures you built.',
      'Quantify API latency reductions, conversion rates, and developer velocity optimizations.',
      'Group skills into clear technical categories (Languages, Frameworks, Cloud, Databases).',
    ],
    example: 'Built scalable REST APIs using NestJS and PostgreSQL serving 50k+ daily active users, lowering database query times by 32%.',
  },
  'ai-engineer': {
    title: 'AI Engineer Resume Guide',
    keywords: ['Python', 'PyTorch', 'Gemini API', 'LLMs', 'Vector Databases', 'LangChain', 'Fine-tuning'],
    advice: [
      'List specific AI frameworks and models you have deployed to production.',
      'Highlight expertise in prompt engineering, embedding chunking strategies, and caching.',
      'Address safety measures and token budget management.',
    ],
    example: 'Engineered a RAG embedding pipeline using Vector Databases, improving context recall accuracy by 18% and cutting API token usage by $1,200/month.',
  },
  'product-manager': {
    title: 'Technical Product Manager Resume Guide',
    keywords: ['Product Roadmap', 'SQL', 'A/B Testing', 'Stripe API', 'Scrum', 'Analytics', 'SaaS metrics'],
    advice: [
      'Emphasize metrics-driven leadership and product growth.',
      'Highlight cross-functional alignment and technical specification documentation.',
      'Quantify product adoption rates and subscription revenue contributions.',
    ],
    example: 'Led the cross-functional squad to overhaul checkout subscriptions, resulting in a 14% lift in user signup conversion and $220k incremental annual recurring revenue.',
  },
  'data-analyst': {
    title: 'Data Analyst Resume Guide',
    keywords: ['SQL', 'Python', 'Tableau', 'Excel', 'Data Warehousing', 'ETL', 'Statistical Modeling'],
    advice: [
      'Detail your expertise in structured database schemas and data mining.',
      'Focus on dashboards that led directly to executive decisions.',
      'Quantify time saved by automating recurring reports.',
    ],
    example: 'Constructed an automated ETL ingestion pipeline using SQL and Python, saving the financial operations squad 12 hours of manual auditing weekly.',
  },
};

export default async function GuidePage({ params }: PageProps) {
  const resolvedParams = await params;
  const roleSlug = resolvedParams.role;
  const guide = ROLE_DATA[roleSlug] || {
    title: `${roleSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Resume Guide`,
    keywords: ['Communication', 'Teamwork', 'Organization', 'Problem Solving', 'Project Management'],
    advice: [
      'Include clear, action-verb led achievements rather than job task lists.',
      'Integrate keywords from the target job posting naturally inside your bullet points.',
      'Maintain clean, standard section headings.',
    ],
    example: 'Collaborated on cross-functional initiatives to optimize internal workflows, saving 4 team hours weekly.',
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
            Optimize Resume Free
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        <div className="space-y-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Programmatic Guide
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">{guide.title}</h1>
          <p className="text-muted-foreground text-sm">
            Step-by-step strategies to tailor your resume for a {resolvedParams.role.replace(/-/g, ' ')} position.
          </p>
        </div>

        {/* Core Keywords */}
        <section className="border border-border rounded-xl p-6 bg-card/20 space-y-4">
          <h3 className="font-bold text-white text-base">Key ATS Keywords to Target</h3>
          <div className="flex flex-wrap gap-2">
            {guide.keywords.map((kw, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded bg-secondary text-white border border-border">
                {kw}
              </span>
            ))}
          </div>
        </section>

        {/* Custom Advice */}
        <section className="space-y-4">
          <h3 className="font-bold text-white text-base">Structuring Strategy</h3>
          <ul className="space-y-3">
            {guide.advice.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                <CheckCircle2 className="w-4.5 h-4.5 text-primary flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Optimized Example */}
        <section className="border-l-4 border-primary pl-4 py-1.5 space-y-2">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Example High-Impact Bullet</h4>
          <p className="text-sm italic text-foreground leading-relaxed">
            &ldquo;{guide.example}&rdquo;
          </p>
        </section>

        {/* CTA */}
        <div className="flex justify-center pt-6">
          <Link
            href="/"
            className="px-6 py-3 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition flex items-center gap-2"
          >
            Launch Live Optimizer <ChevronRight className="w-4.5 h-4.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
