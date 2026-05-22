'use/client';
'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Briefcase,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  RefreshCw,
  Info,
  Check,
  ChevronRight,
  ShieldCheck,
  Award,
  Zap,
} from 'lucide-react';

// Static role samples to help testing
const SAMPLE_JDS = {
  swe: {
    title: 'Senior React Developer',
    company: 'Vercel Inc.',
    text: `We are looking for a Senior React Developer to join our core dashboard team. 
Required skills: TypeScript, React, Next.js, tailwindcss, PostgreSQL, REST APIs.
You will optimize rendering performance, integrate state-management tools, and collaborate on API endpoints.
Expected experience: 5+ years building production-grade web applications. Highlight database query optimization and performance tuning.`,
  },
  ai: {
    title: 'AI Engineer',
    company: 'Anthropic',
    text: `Looking for an AI Engineer to build developer platforms.
Required skills: Python, PyTorch, LLMs, Vector Databases, Gemini API, TypeScript.
Responsibilities include training fine-tuning adapters, managing vector embedding pipelines, and optimizing agent inference speeds.
Experience with prompt engineering and structured JSON outputs from models is a big plus.`,
  },
  pm: {
    title: 'Technical Product Manager',
    company: 'Stripe',
    text: `Join the Stripe checkout experience team as a Technical PM.
Required skills: Product Roadmap, SQL, Stripe API, User Experience design, A/B Testing.
You will write technical specifications, analyze transaction success rates, plan features for subscription monetization, and lead developer teams.
Strong technical communication and metrics-driven leadership are required.`,
  },
};

export default function Home() {
  // Navigation & General App State
  const [userId, setUserId] = useState<string | null>(null);
  const [premiumUser, setPremiumUser] = useState(false);
  const [activeTab, setActiveTab] = useState<'score' | 'keywords' | 'recruiter' | 'cover' | 'formatting'>('score');

  // File Uploading & Parsing State
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [jdText, setJdText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parseStep, setParseStep] = useState('');

  // Structured Resume state (editable in editor)
  const [rawText, setRawText] = useState('');
  const [structuredResume, setStructuredResume] = useState<any>(null);

  // Analysis result state
  const [analysis, setAnalysis] = useState<any>(null);
  const [jobDetails, setJobDetails] = useState<any>(null);

  // Bullet rewriter state
  const [selectedBulletIndex, setSelectedBulletIndex] = useState<{ jobIndex: number; bulletIndex: number } | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteSuggestion, setRewriteSuggestion] = useState<any>(null);

  // Cover letter state
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);

  // Standard File Input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill a Job Description
  const handlePreFillJD = (key: keyof typeof SAMPLE_JDS) => {
    setJdText(SAMPLE_JDS[key].text);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type === 'application/pdf' ||
        droppedFile.name.endsWith('.pdf') ||
        droppedFile.name.endsWith('.docx')
      ) {
        setFile(droppedFile);
      } else {
        alert('Invalid file format. Please upload a PDF or DOCX resume.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Upload and parse file
  const handleUploadAndParse = async () => {
    if (!file) {
      alert('Please upload a resume file first.');
      return;
    }
    if (!jdText.trim()) {
      alert('Please paste or select a Job Description.');
      return;
    }

    setIsParsing(true);
    setParseStep('Parsing document bytes...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/resumes/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse the uploaded file.');
      }

      setParseStep('Structuring section data using AI...');
      const data = await response.json();

      setRawText(data.rawText);
      setStructuredResume(data.structuredData);

      // Trigger analysis immediately
      await runAnalysis(data.structuredData, data.rawText);
    } catch (err: any) {
      alert(err.message || 'Error occurred during parsing.');
    } finally {
      setIsParsing(false);
      setParseStep('');
    }
  };

  // Trigger analysis
  const runAnalysis = async (resumeData: any, rawResume: string) => {
    setIsAnalyzing(true);
    setParseStep('Comparing credentials to job description...');

    try {
      const response = await fetch('/api/resumes/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredResume: resumeData,
          jdText,
          rawResumeText: rawResume,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze the resume.');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setJobDetails(data.jobDetails);
      setActiveTab('score');
    } catch (err: any) {
      alert(err.message || 'Error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
      setParseStep('');
    }
  };

  // Handle live editing changes
  const updateContactInfo = (field: string, value: string) => {
    setStructuredResume((prev: any) => {
      const updated = { ...prev };
      updated.contactInfo[field] = value;
      return updated;
    });
  };

  const updateWorkHistoryBullet = (jobIndex: number, bulletIndex: number, value: string) => {
    setStructuredResume((prev: any) => {
      const updated = { ...prev };
      updated.workExperience[jobIndex].bullets[bulletIndex] = value;
      return updated;
    });
  };

  const addNewBullet = (jobIndex: number) => {
    setStructuredResume((prev: any) => {
      const updated = { ...prev };
      updated.workExperience[jobIndex].bullets.push('New achievement bullet point. Add quantifiable metrics...');
      return updated;
    });
  };

  const deleteBullet = (jobIndex: number, bulletIndex: number) => {
    setStructuredResume((prev: any) => {
      const updated = { ...prev };
      updated.workExperience[jobIndex].bullets.splice(bulletIndex, 1);
      return updated;
    });
  };

  // Bullet rewriter trigger
  const handleRewriteBullet = async (jobIndex: number, bulletIndex: number) => {
    const bulletText = structuredResume.workExperience[jobIndex].bullets[bulletIndex];
    setSelectedBulletIndex({ jobIndex, bulletIndex });
    setIsRewriting(true);
    setRewriteSuggestion(null);

    try {
      const response = await fetch('/api/resumes/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullet: bulletText,
          keywords: analysis?.missingKeywords || [],
        }),
      });

      if (!response.ok) {
        throw new Error('Bullet rewrite failed.');
      }

      const data = await response.json();
      setRewriteSuggestion(data);
    } catch (err: any) {
      alert(err.message || 'Failed to generate AI rewrite.');
    } finally {
      setIsRewriting(false);
    }
  };

  const applyRewrite = () => {
    if (selectedBulletIndex && rewriteSuggestion) {
      updateWorkHistoryBullet(
        selectedBulletIndex.jobIndex,
        selectedBulletIndex.bulletIndex,
        rewriteSuggestion.rewritten
      );
      setSelectedBulletIndex(null);
      setRewriteSuggestion(null);
      // Trigger dynamic re-analyze after application
      triggerRecalculate();
    }
  };

  // Trigger quick re-run of scoring engine
  const triggerRecalculate = async () => {
    if (!structuredResume) return;
    setIsAnalyzing(true);
    setParseStep('Re-evaluating ATS checklist...');
    try {
      // Use clean raw text joined from latest structured edits for rule-based check
      let simulatedRaw = `${structuredResume.contactInfo.name}\n${structuredResume.contactInfo.email}\n${structuredResume.contactInfo.phone}\n`;
      structuredResume.skills.forEach((s: any) => (simulatedRaw += ` ${s.name}`));
      structuredResume.workExperience.forEach((job: any) => {
        simulatedRaw += `\n${job.company} ${job.role}\n${job.bullets.join(' ')}`;
      });

      const response = await fetch('/api/resumes/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredResume,
          jdText,
          rawResumeText: simulatedRaw,
        }),
      });

      if (!response.ok) throw new Error('Re-scoring failed.');
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
      setParseStep('');
    }
  };

  // Generate Cover Letter
  const triggerCoverLetter = async () => {
    if (!structuredResume) return;
    setIsGeneratingCoverLetter(true);
    setCoverLetter('');

    try {
      let simulatedRaw = `${structuredResume.contactInfo.name}\n${structuredResume.contactInfo.email}\n`;
      structuredResume.workExperience.forEach((job: any) => {
        simulatedRaw += `\n${job.company} ${job.role}\n${job.bullets.join(' ')}`;
      });

      const response = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: simulatedRaw,
          jdText,
        }),
      });

      if (!response.ok) throw new Error('Cover letter failed.');
      const data = await response.json();
      setCoverLetter(data.coverLetter);
    } catch (err: any) {
      alert(err.message || 'Failed to generate cover letter.');
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const copyCoverLetterToClipboard = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      setCopiedCoverLetter(true);
      setTimeout(() => setCopiedCoverLetter(false), 2000);
    }
  };

  // Export ATS safe PDF (print standard viewport)
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col grid-bg min-h-screen relative">
      {/* Glow Backdrops */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Navigation */}
      <header className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              ATS<span className="text-primary">Optimizer</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setPremiumUser((p) => !p)}
              className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition ${
                premiumUser
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground border border-border'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              {premiumUser ? 'Premium Mode Active' : 'Upgrade to Premium'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center">
        {/* Loading overlay */}
        {(isParsing || isAnalyzing) && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="bg-card border border-border p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl glow-primary flex flex-col items-center gap-4 animate-fade-in">
              <RefreshCw className="w-10 h-10 text-primary animate-spin" />
              <h3 className="font-semibold text-lg text-white">Analyzing Resume</h3>
              <p className="text-sm text-muted-foreground">{parseStep}</p>
              <div className="w-full bg-muted h-1 rounded-full overflow-hidden mt-2">
                <div className="bg-primary h-full rounded-full animate-pulse-slow w-[65%]" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: INITIAL UPLOAD & PASTING */}
        {!analysis && (
          <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
            {/* Title / Intro */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" /> Recruiter-Grade ATS Evaluation & Assistance
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
                Optimize Your Resume for the <span className="text-primary">Shortlist</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Identify parsing warnings, optimize keyword densities, rewrite impact bullets, and simulate hiring reviews instantly.
              </p>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition gap-4 cursor-pointer relative bg-card/40 ${
                  dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Upload className="w-7 h-7" />
                </div>
                {file ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-white">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-semibold text-white">Upload your resume</p>
                    <p className="text-sm text-muted-foreground">Drag & drop or browse from explorer</p>
                    <p className="text-xs text-muted-foreground mt-2">Supports PDF or DOCX (Max 5MB)</p>
                  </div>
                )}
              </div>

              {/* Job Description Box */}
              <div className="border border-border rounded-2xl p-6 bg-card/40 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" /> Target Job Description
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreFillJD('swe')}
                      className="text-xs bg-muted hover:bg-muted-foreground/20 px-2.5 py-1 rounded text-white"
                    >
                      Pre-fill SWE
                    </button>
                    <button
                      onClick={() => handlePreFillJD('ai')}
                      className="text-xs bg-muted hover:bg-muted-foreground/20 px-2.5 py-1 rounded text-white"
                    >
                      Pre-fill AI
                    </button>
                    <button
                      onClick={() => handlePreFillJD('pm')}
                      className="text-xs bg-muted hover:bg-muted-foreground/20 px-2.5 py-1 rounded text-white"
                    >
                      Pre-fill PM
                    </button>
                  </div>
                </div>

                <textarea
                  className="w-full flex-1 min-h-[140px] bg-background/50 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground resize-none"
                  placeholder="Paste the job requirements, skills, and qualifications here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
              </div>
            </div>

            {/* CTA action button */}
            <button
              onClick={handleUploadAndParse}
              disabled={!file || !jdText.trim() || isParsing}
              className="w-full max-w-sm mx-auto py-3.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4.5 h-4.5" /> Analyze ATS Compatibility
            </button>
          </div>
        )}

        {/* STEP 2: INTERACTIVE EDITOR & SCORECARD WORKSPACE */}
        {analysis && structuredResume && (
          <div className="flex flex-col gap-6 animate-fade-in print:p-0">
            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-border p-5 rounded-2xl bg-card/30 backdrop-blur print:hidden">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  Optimizer Sandbox
                </span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Tailoring for {jobDetails?.title || 'Job Description'} @ {jobDetails?.company || 'Target Company'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setAnalysis(null);
                    setStructuredResume(null);
                    setFile(null);
                    setJdText('');
                  }}
                  className="px-4 py-2 text-sm bg-muted hover:bg-muted-foreground/10 border border-border rounded-xl font-medium text-white transition"
                >
                  Start Over
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition flex items-center gap-2 shadow-lg shadow-primary/10"
                >
                  <Download className="w-4 h-4" /> Export ATS PDF
                </button>
              </div>
            </div>

            {/* Split Panel Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: RESUME BUILDER & EDITOR (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6 print:w-full print:col-span-12">
                {/* Visual Editor Section */}
                <div className="border border-border rounded-2xl bg-card/20 p-6 flex flex-col gap-6 relative shadow-lg print:border-none print:bg-transparent print:p-0">
                  <div className="flex items-center justify-between border-b border-border pb-4 print:hidden">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" /> Visual Editor Sandbox
                    </h3>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Edits here trigger score re-calculations
                    </span>
                  </div>

                  {/* Print-Only Header Block */}
                  <div className="hidden print:block text-center border-b pb-4 mb-4">
                    <h1 className="text-2xl font-bold uppercase">{structuredResume.contactInfo.name}</h1>
                    <p className="text-xs text-muted-foreground">
                      {structuredResume.contactInfo.location} | {structuredResume.contactInfo.email} |{' '}
                      {structuredResume.contactInfo.phone}
                    </p>
                  </div>

                  {/* Sandbox Fields */}
                  {/* 1. Contact Details */}
                  <div className="space-y-3 print:hidden">
                    <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground font-semibold">Name</label>
                        <input
                          type="text"
                          value={structuredResume.contactInfo.name || ''}
                          onChange={(e) => updateContactInfo('name', e.target.value)}
                          className="w-full bg-background/40 border border-border rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-semibold">Location</label>
                        <input
                          type="text"
                          value={structuredResume.contactInfo.location || ''}
                          onChange={(e) => updateContactInfo('location', e.target.value)}
                          className="w-full bg-background/40 border border-border rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-semibold">Email</label>
                        <input
                          type="text"
                          value={structuredResume.contactInfo.email || ''}
                          onChange={(e) => updateContactInfo('email', e.target.value)}
                          className="w-full bg-background/40 border border-border rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-semibold">Phone</label>
                        <input
                          type="text"
                          value={structuredResume.contactInfo.phone || ''}
                          onChange={(e) => updateContactInfo('phone', e.target.value)}
                          className="w-full bg-background/40 border border-border rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Work Experience */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-primary uppercase tracking-wider print:text-black print:border-b-2 print:border-black print:pb-1">
                      Professional Experience
                    </h4>
                    {structuredResume.workExperience?.map((job: any, jobIndex: number) => (
                      <div key={jobIndex} className="space-y-2 border-l-2 border-border/50 pl-4 py-1 print:border-none print:pl-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <input
                              type="text"
                              value={job.role || ''}
                              onChange={(e) => {
                                setStructuredResume((prev: any) => {
                                  const updated = { ...prev };
                                  updated.workExperience[jobIndex].role = e.target.value;
                                  return updated;
                                });
                              }}
                              className="bg-transparent border-none text-white font-bold text-sm focus:outline-none focus:underline p-0 w-64 print:text-black print:p-0"
                            />
                            <input
                              type="text"
                              value={job.company || ''}
                              onChange={(e) => {
                                setStructuredResume((prev: any) => {
                                  const updated = { ...prev };
                                  updated.workExperience[jobIndex].company = e.target.value;
                                  return updated;
                                });
                              }}
                              className="bg-transparent border-none text-muted-foreground text-xs font-semibold focus:outline-none focus:underline block p-0 w-64 print:text-black print:p-0"
                            />
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground font-semibold print:text-black">
                              {job.startDate} - {job.endDate}
                            </span>
                          </div>
                        </div>

                        {/* Bullets */}
                        <div className="space-y-3 mt-2">
                          {job.bullets?.map((bullet: string, bulletIndex: number) => (
                            <div key={bulletIndex} className="group relative flex items-start gap-2">
                              <span className="text-primary mt-1.5 text-xs select-none print:text-black">•</span>
                              <textarea
                                value={bullet}
                                onChange={(e) => updateWorkHistoryBullet(jobIndex, bulletIndex, e.target.value)}
                                className="w-full bg-transparent border-none focus:bg-background/30 rounded text-sm text-foreground focus:outline-none leading-relaxed p-1 resize-none overflow-hidden print:text-black print:p-0 print:bg-transparent"
                                rows={2}
                                style={{ height: 'auto' }}
                              />

                              {/* Action controls */}
                              <div className="hidden group-hover:flex absolute right-1 top-1/2 -translate-y-1/2 items-center gap-1.5 bg-card border border-border p-1 rounded-lg shadow-lg print:hidden">
                                <button
                                  onClick={() => handleRewriteBullet(jobIndex, bulletIndex)}
                                  className="text-xs px-2 py-1 bg-primary/20 text-primary border border-primary/20 rounded-md font-semibold hover:bg-primary/30 flex items-center gap-1"
                                  title="AI Optimizer Bullet Rewrite"
                                >
                                  <Sparkles className="w-3 h-3" /> Rewrite
                                </button>
                                <button
                                  onClick={() => deleteBullet(jobIndex, bulletIndex)}
                                  className="text-xs px-1.5 py-1 bg-destructive/10 text-destructive-foreground hover:bg-destructive/20 rounded-md font-semibold border border-destructive/20"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={() => addNewBullet(jobIndex)}
                            className="text-xs font-semibold text-primary hover:text-primary-foreground/90 py-1 px-2.5 rounded-lg border border-primary/20 hover:bg-primary/10 transition mt-1 print:hidden"
                          >
                            + Add Bullet Point
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 3. Skills */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-primary uppercase tracking-wider print:text-black print:border-b-2 print:border-black print:pb-1">
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2 print:text-black">
                      {structuredResume.skills?.map((skill: any, index: number) => (
                        <div
                          key={index}
                          className="text-xs px-2.5 py-1 rounded bg-secondary border border-border text-white flex items-center gap-1.5 print:bg-transparent print:border-none print:px-0 print:text-black print:after:content-[',_'] print:last:after:content-['']"
                        >
                          <span>{skill.name}</span>
                          <button
                            onClick={() => {
                              setStructuredResume((prev: any) => {
                                const updated = { ...prev };
                                updated.skills.splice(index, 1);
                                return updated;
                              });
                            }}
                            className="text-muted-foreground hover:text-white text-xs print:hidden"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const name = prompt('Enter skill name:');
                          if (name) {
                            setStructuredResume((prev: any) => {
                              const updated = { ...prev };
                              updated.skills.push({ name, category: 'Hard' });
                              return updated;
                            });
                          }
                        }}
                        className="text-xs px-2.5 py-1 rounded border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition font-semibold print:hidden"
                      >
                        + Add Skill
                      </button>
                    </div>
                  </div>

                  {/* 4. Education */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-primary uppercase tracking-wider print:text-black print:border-b-2 print:border-black print:pb-1">
                      Education
                    </h4>
                    {structuredResume.education?.map((edu: any, index: number) => (
                      <div key={index} className="flex justify-between items-start text-sm">
                        <div>
                          <p className="font-semibold text-white print:text-black">
                            {edu.degree} in {edu.fieldOfStudy}
                          </p>
                          <p className="text-xs text-muted-foreground print:text-black">{edu.institution}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground print:text-black">{edu.graduationDate}</p>
                          {edu.gpa && <p className="text-xs text-primary print:text-black">GPA: {edu.gpa}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 5. Projects */}
                  {structuredResume.projects && structuredResume.projects.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-primary uppercase tracking-wider print:text-black print:border-b-2 print:border-black print:pb-1">
                        Academic & Side Projects
                      </h4>
                      {structuredResume.projects.map((proj: any, index: number) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between">
                            <p className="font-semibold text-white text-sm print:text-black">{proj.name}</p>
                            <span className="text-xs text-muted-foreground print:text-black">
                              {proj.technologies?.join(', ')}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed print:text-black">
                            {proj.description}
                          </p>
                          {proj.bullets?.map((b: string, bi: number) => (
                            <p key={bi} className="text-xs text-foreground pl-3 border-l border-border print:text-black">
                              • {b}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: REAL-TIME SCORES & RECRUITER WIDGETS (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6 print:hidden">
                {/* Inline AI Rewriter Popup Overlay replacement */}
                {selectedBulletIndex && (
                  <div className="border border-primary bg-primary/5 rounded-2xl p-5 shadow-lg glow-primary flex flex-col gap-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 fill-primary" /> AI Bullet Optimization
                      </span>
                      <button
                        onClick={() => setSelectedBulletIndex(null)}
                        className="text-muted-foreground hover:text-white text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="bg-background/60 p-3 rounded-lg border border-border text-xs leading-relaxed italic text-muted-foreground">
                      Original: &ldquo;
                      {
                        structuredResume.workExperience[selectedBulletIndex.jobIndex].bullets[
                          selectedBulletIndex.bulletIndex
                        ]
                      }
                      &rdquo;
                    </div>

                    {isRewriting && (
                      <div className="flex items-center gap-2 justify-center py-4 text-sm text-muted-foreground font-semibold">
                        <RefreshCw className="w-4 h-4 text-primary animate-spin" /> Tailoring impact phrasing...
                      </div>
                    )}

                    {rewriteSuggestion && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg text-sm leading-relaxed text-white">
                          <strong>Optimized suggestion:</strong>
                          <p className="mt-1">{rewriteSuggestion.rewritten}</p>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p className="font-semibold text-white">Rationale:</p>
                          <p>{rewriteSuggestion.explanation}</p>
                          {rewriteSuggestion.metricsAdded?.length > 0 && (
                            <p className="text-emerald-400">
                              ✓ Metrics integrated: {rewriteSuggestion.metricsAdded.join(', ')}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={applyRewrite}
                            className="flex-1 py-2 bg-primary hover:bg-primary/95 text-white font-semibold rounded-lg text-xs transition"
                          >
                            Apply Optimization
                          </button>
                          <button
                            onClick={() =>
                              handleRewriteBullet(selectedBulletIndex.jobIndex, selectedBulletIndex.bulletIndex)
                            }
                            className="px-3 py-2 bg-muted border border-border hover:bg-muted-foreground/10 rounded-lg text-xs text-white"
                          >
                            Regenerate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Score panel tabs widget */}
                <div className="border border-border rounded-2xl bg-card/30 backdrop-blur shadow-xl overflow-hidden">
                  {/* Tab Navigation header */}
                  <div className="flex border-b border-border bg-background/30 text-xs font-semibold overflow-x-auto scrollbar-none">
                    <button
                      onClick={() => setActiveTab('score')}
                      className={`flex-1 py-3 px-4 border-b-2 text-center transition whitespace-nowrap ${
                        activeTab === 'score' ? 'border-primary text-white bg-primary/5' : 'border-transparent text-muted-foreground hover:text-white'
                      }`}
                    >
                      ATS Scorecard
                    </button>
                    <button
                      onClick={() => setActiveTab('keywords')}
                      className={`flex-1 py-3 px-4 border-b-2 text-center transition whitespace-nowrap ${
                        activeTab === 'keywords' ? 'border-primary text-white bg-primary/5' : 'border-transparent text-muted-foreground hover:text-white'
                      }`}
                    >
                      Keywords Match
                    </button>
                    <button
                      onClick={() => setActiveTab('recruiter')}
                      className={`flex-1 py-3 px-4 border-b-2 text-center transition whitespace-nowrap ${
                        activeTab === 'recruiter' ? 'border-primary text-white bg-primary/5' : 'border-transparent text-muted-foreground hover:text-white'
                      }`}
                    >
                      Recruiter Sim
                    </button>
                    <button
                      onClick={() => setActiveTab('formatting')}
                      className={`flex-1 py-3 px-4 border-b-2 text-center transition whitespace-nowrap ${
                        activeTab === 'formatting' ? 'border-primary text-white bg-primary/5' : 'border-transparent text-muted-foreground hover:text-white'
                      }`}
                    >
                      Formatting
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('cover');
                        if (!coverLetter) triggerCoverLetter();
                      }}
                      className={`flex-1 py-3 px-4 border-b-2 text-center transition whitespace-nowrap ${
                        activeTab === 'cover' ? 'border-primary text-white bg-primary/5' : 'border-transparent text-muted-foreground hover:text-white'
                      }`}
                    >
                      Cover Letter
                    </button>
                  </div>

                  {/* Tab views content area */}
                  <div className="p-6">
                    {/* TAB 1: ATS SCORECARD */}
                    {activeTab === 'score' && (
                      <div className="space-y-6">
                        {/* Radial Gauge */}
                        <div className="flex flex-col items-center justify-center text-center gap-3">
                          <div
                            className="radial-progress text-primary glow-primary font-bold text-3xl"
                            style={{
                              // @ts-ignore
                              '--value': analysis?.overallScore || 0,
                              '--size': '8rem',
                              '--thickness': '8px',
                            }}
                          >
                            {analysis?.overallScore}%
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-white">Overall ATS Index</h4>
                            <p className="text-xs text-muted-foreground">
                              Scored out of 100 on parser readability & fit metrics
                            </p>
                          </div>
                        </div>

                        {/* Metric Subscores */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border border-border/80 bg-background/20 p-3 rounded-xl">
                            <span className="text-xs text-muted-foreground font-semibold">Keywords</span>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-bold text-lg text-white">{analysis?.keywordScore}%</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            </div>
                          </div>
                          <div className="border border-border/80 bg-background/20 p-3 rounded-xl">
                            <span className="text-xs text-muted-foreground font-semibold">Impact Bullet</span>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-bold text-lg text-white">{analysis?.impactScore}%</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            </div>
                          </div>
                          <div className="border border-border/80 bg-background/20 p-3 rounded-xl">
                            <span className="text-xs text-muted-foreground font-semibold">Formatting Safety</span>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-bold text-lg text-white">{analysis?.formattingScore}%</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            </div>
                          </div>
                          <div className="border border-border/80 bg-background/20 p-3 rounded-xl">
                            <span className="text-xs text-muted-foreground font-semibold">Readability Index</span>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-bold text-lg text-white">{analysis?.readabilityScore}%</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            </div>
                          </div>
                        </div>

                        {/* Recalculate CTA */}
                        <button
                          onClick={triggerRecalculate}
                          className="w-full py-2.5 bg-muted hover:bg-muted-foreground/10 text-white font-semibold text-sm border border-border rounded-xl transition flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" /> Recalculate Compatibility
                        </button>
                      </div>
                    )}

                    {/* TAB 2: KEYWORDS MATCH */}
                    {activeTab === 'keywords' && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm text-white mb-1">Missing JD Keywords</h4>
                          <p className="text-xs text-muted-foreground">
                            Add these target keywords into your resume sections to increase your match percentage.
                          </p>
                        </div>

                        {analysis?.missingKeywords?.length > 0 ? (
                          <div className="flex flex-wrap gap-2 py-2">
                            {analysis.missingKeywords.map((word: string, i: number) => (
                              <span
                                key={i}
                                className="text-xs px-2.5 py-1 rounded bg-destructive/10 text-rose-300 border border-destructive/20 font-medium"
                              >
                                {word}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
                            <CheckCircle className="w-4.5 h-4.5" /> All target keywords successfully matched!
                          </div>
                        )}

                        <div className="border-t border-border pt-4">
                          <h4 className="font-semibold text-sm text-white mb-2">Keyword Heatmap Breakdown</h4>
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            {analysis?.keywordHeatmap?.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center text-xs border-b border-border/40 pb-1.5 last:border-none">
                                <span className="text-foreground">{item.word}</span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                                      item.importance === 'High'
                                        ? 'bg-rose-500/10 text-rose-400'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    {item.importance} Importance
                                  </span>
                                  <span
                                    className={`font-semibold ${
                                      item.matchesInResume > 0 ? 'text-emerald-400' : 'text-rose-400'
                                    }`}
                                  >
                                    {item.matchesInResume} Matches
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: RECRUITER SIMULATION */}
                    {activeTab === 'recruiter' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-muted/30 p-4 border border-border rounded-xl">
                          <div>
                            <span className="text-xs text-muted-foreground">Likely Interview Rate</span>
                            <p className="font-bold text-lg text-white">
                              {analysis?.recruiterSim?.likelyInterviewRate || 10}% Chance
                            </p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded text-xs font-bold ${
                              (analysis?.recruiterSim?.likelyInterviewRate || 10) > 70
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {(analysis?.recruiterSim?.likelyInterviewRate || 10) > 70 ? 'High Chance' : 'A/B Improving'}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm text-white">First Impression Note</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed italic bg-background/20 p-3 rounded-lg border border-border">
                            &ldquo;{analysis?.recruiterSim?.firstImpressions}&rdquo;
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-semibold text-rose-300 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> Red Flags & Gaps
                            </span>
                            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1 mt-1.5">
                              {analysis?.recruiterSim?.concerns?.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Strengths
                            </span>
                            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1 mt-1.5">
                              {analysis?.recruiterSim?.strengths?.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: FORMATTING SAFETY */}
                    {activeTab === 'formatting' && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm text-white">ATS Formatting Audit</h4>
                          <p className="text-xs text-muted-foreground">
                            Legacy parsers get confused by layout structures. Keep elements simple.
                          </p>
                        </div>

                        {analysis?.formattingIssues?.length > 0 ? (
                          <div className="space-y-2">
                            {analysis.formattingIssues.map((issue: string, i: number) => (
                              <div
                                key={i}
                                className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-xl text-xs flex items-start gap-2.5"
                              >
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                                <span>{issue}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-xl text-xs flex items-center gap-2">
                            <CheckCircle className="w-4.5 h-4.5" /> Core formatting meets all standard ATS rules!
                          </div>
                        )}

                        {analysis?.contactInfoAlerts?.length > 0 && (
                          <div className="border-t border-border pt-4 space-y-2">
                            <h4 className="font-semibold text-xs text-white uppercase tracking-wider">
                              Contact Gaps
                            </h4>
                            {analysis.contactInfoAlerts.map((alertText: string, i: number) => (
                              <div
                                key={i}
                                className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-2.5 rounded-lg text-xs flex items-center gap-2"
                              >
                                <AlertCircle className="w-4 h-4 text-rose-400" />
                                <span>{alertText}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 5: TAILORED COVER LETTER */}
                    {activeTab === 'cover' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-white">AI Cover Letter</h4>
                          {coverLetter && (
                            <button
                              onClick={copyCoverLetterToClipboard}
                              className="text-xs bg-muted hover:bg-muted-foreground/10 px-2.5 py-1.5 rounded-lg text-white border border-border flex items-center gap-1.5"
                            >
                              {copiedCoverLetter ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy Letter
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {isGeneratingCoverLetter ? (
                          <div className="flex items-center gap-2 justify-center py-12 text-sm text-muted-foreground font-semibold">
                            <RefreshCw className="w-4 h-4 text-primary animate-spin" /> Drafting letter...
                          </div>
                        ) : coverLetter ? (
                          <textarea
                            readOnly
                            value={coverLetter}
                            className="w-full min-h-[300px] bg-background/40 border border-border rounded-xl p-3 text-xs leading-relaxed text-foreground resize-none focus:outline-none focus:border-border"
                          />
                        ) : (
                          <button
                            onClick={triggerCoverLetter}
                            className="w-full py-6 bg-primary/10 border border-dashed border-primary/30 text-primary rounded-xl font-semibold text-sm hover:bg-primary/20 transition flex flex-col items-center justify-center gap-2"
                          >
                            <Sparkles className="w-5 h-5" /> Generate Tailored Cover Letter
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Landing Highlights section / pricing footer */}
      {!analysis && (
        <section className="border-t border-border mt-20 bg-card/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-center text-white mb-10">Premium Features Crafted for Recruiters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="border border-border p-6 rounded-2xl bg-card/20 hover:border-primary/50 transition">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">AI Resume Rewriter</h3>
                <p className="text-sm text-muted-foreground">
                  Transform passive phrases into metrics-focused achievements (e.g. &quot;built backend APIs&quot; $\rightarrow$ &quot;Designed scalable APIs serving 50k+ requests with 15% lower query latency&quot;).
                </p>
              </div>
              <div className="border border-border p-6 rounded-2xl bg-card/20 hover:border-primary/50 transition">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">ATS Rules Engine</h3>
                <p className="text-sm text-muted-foreground">
                  Check layout safety, standard section titles, and keyword density. Flags formatting hazards before they reject your file.
                </p>
              </div>
              <div className="border border-border p-6 rounded-2xl bg-card/20 hover:border-primary/50 transition">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">Recruiter Simulations</h3>
                <p className="text-sm text-muted-foreground">
                  Get feedback from the recruiter's perspective: core concerns, likely interview rate, and major strengths.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
