'use client';


import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  Briefcase,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  RefreshCw,
  Info,
  Check,
  ShieldCheck,
  Award,
  History,
} from 'lucide-react';
import { StructuredResume, AnalysisResult, ParsedJD } from '@/types';

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
  const [userId, setUserId] = useState<string | null>('demo-user-123');
  const [userEmail, setUserEmail] = useState<string>('sandbox@shortlist.ai');
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'score' | 'keywords' | 'recruiter' | 'cover' | 'formatting'>('score');

  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    fetchHistory('demo-user-123');
    // Default to light mode (remove dark class from HTML initially)
    document.documentElement.classList.remove('dark');
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Preview Mode & ATS templates (Feature 1)
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'traditional' | 'classic' | 'modern'>('traditional');

  // Interactive Heatmap hover state (Feature 4)
  const [hoveredKeyword, setHoveredKeyword] = useState<string | null>(null);

  const fetchHistory = async (uid: string) => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/history?userId=${uid}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDemoSignIn = async () => {
    const demoId = 'demo-user-123';
    const demoEmail = 'sandbox@shortlist.ai';
    setUserId(demoId);
    setUserEmail(demoEmail);
    await fetchHistory(demoId);
  };

  const handleSignOut = () => {
    setUserId(null);
    setUserEmail('');
    setHistory([]);
  };

  const handleSelectHistoryItem = (item: any) => {
    setAnalysis({
      overallScore: item.overallScore,
      keywordScore: item.keywordScore,
      formattingScore: item.formattingScore,
      readabilityScore: item.readabilityScore,
      impactScore: item.impactScore,
      missingKeywords: item.missingKeywords,
      keywordHeatmap: item.keywordHeatmap,
      bulletFeedback: item.bulletFeedback,
      recruiterSim: item.recruiterSim,
      formattingIssues: item.formattingIssues,
    });
    setStructuredResume(item.resumeVersion.structuredJson);
    setJdText(item.jobDescription.rawText);
    setJobDetails({
      title: item.jobDescription.title,
      company: item.jobDescription.company,
      skills: (item.jobDescription.parsedKeywords as any)?.skills || [],
      experienceLevel: (item.jobDescription.parsedKeywords as any)?.experienceLevel || '',
      recruiterIntent: (item.jobDescription.parsedKeywords as any)?.recruiterIntent || '',
      summaryOfRole: (item.jobDescription.parsedKeywords as any)?.summaryOfRole || '',
    });
    setShowHistoryModal(false);
    setActiveTab('score');
  };

  // Feature 3: Auto integrate keyword into the first bullet point
  const handleAutoIntegrateKeyword = async (keyword: string) => {
    if (!structuredResume || structuredResume.workExperience.length === 0) {
      alert("No work experience found to integrate the keyword into.");
      return;
    }
    const firstJob = structuredResume.workExperience[0];
    if (firstJob.bullets.length === 0) {
      alert("No bullets found in your first work experience.");
      return;
    }
    
    setSelectedBulletIndex({ jobIndex: 0, bulletIndex: 0 });
    setIsRewriting(true);
    setRewriteSuggestion(null);
    setActiveTab('score');

    try {
      const response = await fetch('/api/resumes/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullet: firstJob.bullets[0],
          keywords: [keyword],
        }),
      });

      if (!response.ok) throw new Error('Failed to generate quick fix.');
      const data = await response.json();
      setRewriteSuggestion(data);
    } catch (err) {
      const errorObj = err as Error;
      alert(errorObj.message || 'Failed to auto-integrate.');
    } finally {
      setIsRewriting(false);
    }
  };

  // File Uploading & Parsing State
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [jdText, setJdText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parseStep, setParseStep] = useState('');

  // Structured Resume state (editable in editor)
  const [structuredResume, setStructuredResume] = useState<StructuredResume | null>(null);

  // Analysis result state
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [jobDetails, setJobDetails] = useState<ParsedJD | null>(null);

  // Bullet rewriter state
  const [selectedBulletIndex, setSelectedBulletIndex] = useState<{ jobIndex: number; bulletIndex: number } | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteSuggestion, setRewriteSuggestion] = useState<{ rewritten: string; explanation: string; metricsAdded: string[] } | null>(null);

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

      setStructuredResume(data.structuredData);

      // Trigger analysis immediately
      await runAnalysis(data.structuredData, data.rawText);
    } catch (err) {
      const errorObj = err as Error;
      alert(errorObj.message || 'Error occurred during parsing.');
    } finally {
      setIsParsing(false);
      setParseStep('');
    }
  };

  // Trigger analysis
  const runAnalysis = async (resumeData: StructuredResume, rawResume: string) => {
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
      if (userId) {
        await fetchHistory(userId);
      }
    } catch (err) {
      const errorObj = err as Error;
      alert(errorObj.message || 'Error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
      setParseStep('');
    }
  };

  // Handle live editing changes
  const updateContactInfo = (field: 'name' | 'email' | 'phone' | 'location', value: string) => {
    setStructuredResume((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value,
        },
      };
    });
  };

  const updateWorkHistoryBullet = (jobIndex: number, bulletIndex: number, value: string) => {
    setStructuredResume((prev) => {
      if (!prev) return null;
      const updatedExperience = [...prev.workExperience];
      const updatedBullets = [...updatedExperience[jobIndex].bullets];
      updatedBullets[bulletIndex] = value;
      updatedExperience[jobIndex] = {
        ...updatedExperience[jobIndex],
        bullets: updatedBullets,
      };
      return {
        ...prev,
        workExperience: updatedExperience,
      };
    });
  };

  const addNewBullet = (jobIndex: number) => {
    setStructuredResume((prev) => {
      if (!prev) return null;
      const updatedExperience = [...prev.workExperience];
      const updatedBullets = [...updatedExperience[jobIndex].bullets, 'New achievement bullet point. Add quantifiable metrics...'];
      updatedExperience[jobIndex] = {
        ...updatedExperience[jobIndex],
        bullets: updatedBullets,
      };
      return {
        ...prev,
        workExperience: updatedExperience,
      };
    });
  };

  const deleteBullet = (jobIndex: number, bulletIndex: number) => {
    setStructuredResume((prev) => {
      if (!prev) return null;
      const updatedExperience = [...prev.workExperience];
      const updatedBullets = [...updatedExperience[jobIndex].bullets];
      updatedBullets.splice(bulletIndex, 1);
      updatedExperience[jobIndex] = {
        ...updatedExperience[jobIndex],
        bullets: updatedBullets,
      };
      return {
        ...prev,
        workExperience: updatedExperience,
      };
    });
  };

  // Bullet rewriter trigger
  const handleRewriteBullet = async (jobIndex: number, bulletIndex: number) => {
    if (!structuredResume) return;
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
    } catch (err) {
      const errorObj = err as Error;
      alert(errorObj.message || 'Failed to generate AI rewrite.');
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
      structuredResume.skills.forEach((s) => (simulatedRaw += ` ${s.name}`));
      structuredResume.workExperience.forEach((job) => {
        simulatedRaw += `\n${job.company} ${job.role}\n${job.bullets.join(' ')}`;
      });

      const response = await fetch('/api/resumes/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredResume,
          jdText,
          rawResumeText: simulatedRaw,
          userId,
        }),
      });

      if (!response.ok) throw new Error('Re-scoring failed.');
      const data = await response.json();
      setAnalysis(data.analysis);
      if (userId) {
        await fetchHistory(userId);
      }
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
      structuredResume.workExperience.forEach((job) => {
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
    } catch (err) {
      const errorObj = err as Error;
      alert(errorObj.message || 'Failed to generate cover letter.');
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

  // Feature 4: Dynamic Keyword Highlight Renderer
  const highlightKeywords = (text: string, hovered: string | null) => {
    if (!analysis || !analysis.keywordHeatmap) return text;
    
    const matchedKeywords = analysis.keywordHeatmap
      .filter((item: any) => item.matchesInResume > 0)
      .map((item: any) => item.word);

    if (matchedKeywords.length === 0) return text;

    const sortedKeywords = [...matchedKeywords].sort((a, b) => b.length - a.length);
    const escapedKeywords = sortedKeywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = `(?<![a-zA-Z0-9])(${escapedKeywords.join('|')})(?![a-zA-Z0-9])`;
    const regex = new RegExp(pattern, 'gi');

    const parts = text.split(regex);
    if (parts.length <= 1) return text;

    return (
      <>
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            const isHovered = hovered && part.toLowerCase() === hovered.toLowerCase();
            return (
              <span
                key={index}
                className={`transition-all duration-300 font-semibold px-0.5 rounded ${
                  isHovered
                    ? 'bg-amber-400 text-black shadow-lg scale-105 inline-block ring-2 ring-amber-500 animate-pulse font-bold'
                    : 'bg-emerald-500/10 text-emerald-300 border-b border-emerald-500/30'
                }`}
              >
                {part}
              </span>
            );
          }
          return part;
        })}
      </>
    );
  };

  // State to track bullet editor focus
  const [focusedBullet, setFocusedBullet] = useState<{ jobIndex: number; bulletIndex: number } | null>(null);

  // Export ATS safe PDF (print standard viewport)
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col grid-bg min-h-screen relative">
      {/* Navigation */}
      <header className="border-b border-border bg-background sticky top-0 z-30 print:hidden font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="border border-border">
              <rect width="32" height="32" fill="var(--border)" />
              <path d="M8 8H6V24H8" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" />
              <path d="M24 8H26V24H24" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" />
              <path d="M12 20L16 12L20 20" stroke="var(--background)" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
            <span className="font-bebas text-2xl tracking-wider text-foreground">
              ATS // <span className="text-primary">OPTIMIZER</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="text-xs border border-border px-3 py-1.5 hover:bg-foreground hover:text-background transition uppercase font-bold cursor-pointer"
            >
              [ THEME: {isDark ? 'DARK' : 'LIGHT'} ]
            </button>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-xs px-3 py-1.5 border border-border bg-secondary text-foreground font-bold hover:bg-foreground hover:text-background transition uppercase cursor-pointer"
            >
              [ SCANS: {history.length} ]
            </button>
            <span className="text-[10px] uppercase font-bold text-muted-foreground hidden sm:inline">
              [ DIRECT_ACCESS ]
            </span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
        {/* Loading overlay */}
        {(isParsing || isAnalyzing) && (
          <div className="fixed inset-0 bg-background/90 z-50 flex flex-col items-center justify-center font-mono">
            <div className="border-2 border-border bg-background p-10 max-w-sm w-full text-center flex flex-col items-center gap-6">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <div>
                <h3 className="font-bold text-sm tracking-widest text-foreground uppercase">RUNNING_ENGINE</h3>
                <p className="text-xs text-muted-foreground mt-2">{parseStep}</p>
              </div>
              <div className="w-full bg-secondary h-1.5 border border-border overflow-hidden">
                <div className="bg-primary h-full animate-pulse-slow w-[65%]" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: INITIAL UPLOAD & PASTING */}
        {!analysis && (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-16 py-4">
            {/* Header / Intro section */}
            <div className="border-b-2 border-border pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4 max-w-3xl">
                <div className="text-xs uppercase tracking-widest text-primary font-mono font-bold">
                  [ RECRUITER-GRADE EVALUATION ]
                </div>
                <h1 className="text-5xl md:text-7xl font-bebas tracking-tight uppercase leading-none text-foreground">
                  Optimize Your Resume <br />
                  For The <span className="text-primary">Shortlist</span>
                </h1>
                <p className="text-muted-foreground font-mono text-sm max-w-xl leading-relaxed">
                  Engineered to evaluate parsing vulnerabilities, optimize match metrics, and audit formatting syntax. High contrast. No fluff.
                </p>
              </div>
              <div className="font-mono text-[10px] uppercase text-muted-foreground flex flex-col gap-1 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                <span>SYSTEM_STATUS: ACTIVE</span>
                <span>ENGINE_VERSION: 1.2.0</span>
                <span>REF_TIME: {new Date().toISOString().slice(0, 10)}</span>
              </div>
            </div>

            {/* Asymmetric layout */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start">
              {/* Left Column: Upload Zone (60% width -> 6 cols of 10) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex justify-between items-center font-mono text-xs text-muted-foreground">
                  <span>[ INPUT: RESUME_FILE ]</span>
                  <span>SIZE_LIMIT: 5.0MB</span>
                </div>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-solid p-12 min-h-[250px] flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-150 bg-background ${
                    dragging 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-secondary'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.docx"
                    className="hidden"
                  />
                  
                  {file ? (
                    <div className="space-y-4 font-mono">
                      <FileText className="w-12 h-12 text-primary mx-auto" />
                      <div>
                        <p className="font-bold text-sm tracking-tight text-foreground uppercase">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <span className="inline-block border border-border px-3 py-1 text-xs hover:bg-foreground hover:text-background transition uppercase font-bold">
                        CHANGE_FILE
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-4 font-mono">
                      <div className="border border-border w-10 h-10 mx-auto flex items-center justify-center text-foreground font-bold">
                        +
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-widest text-foreground uppercase">DROP_RESUME.PDF</p>
                        <p className="text-xs text-muted-foreground mt-2">CLICK TO BROWSE FILES (PDF / DOCX)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Job Description (40% width -> 4 cols of 10) */}
              <div className="lg:col-span-4 space-y-4 lg:border-l lg:border-border lg:pl-12">
                <div className="border-t-2 border-border pt-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-foreground uppercase">
                      [ TARGET_JOB_DESCRIPTION ]
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePreFillJD('swe'); }}
                        className="hover:text-primary transition underline cursor-pointer text-muted-foreground"
                      >
                        [SWE]
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePreFillJD('ai'); }}
                        className="hover:text-primary transition underline cursor-pointer text-muted-foreground"
                      >
                        [AI]
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePreFillJD('pm'); }}
                        className="hover:text-primary transition underline cursor-pointer text-muted-foreground"
                      >
                        [PM]
                      </button>
                    </div>
                  </div>

                  <textarea
                    className="w-full min-h-[220px] bg-background border border-border p-4 text-xs font-mono text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground/50 resize-none"
                    placeholder="PASTE REQUIREMENTS, SKILLS, AND QUALIFICATIONS HERE..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Flat CTA Button */}
            <div className="border-t border-border pt-12 flex justify-center">
              <button
                onClick={handleUploadAndParse}
                disabled={!file || !jdText.trim() || isParsing}
                className="w-full max-w-xl py-4 bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-mono font-bold tracking-widest text-sm transition-colors duration-150 disabled:opacity-30 disabled:pointer-events-none uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                ANALYZE →
              </button>
            </div>
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
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-xl bg-muted p-1 border border-border">
                  <button
                    onClick={() => setPreviewMode(false)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${!previewMode ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-white'}`}
                  >
                    Editor Form
                  </button>
                  <button
                    onClick={() => setPreviewMode(true)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${previewMode ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-white'}`}
                  >
                    A4 PDF Preview
                  </button>
                </div>

                {previewMode && (
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value as any)}
                    className="text-xs bg-muted border border-border rounded-xl px-2 py-1.5 text-white font-semibold focus:outline-none focus:border-primary"
                  >
                    <option value="traditional">Traditional Serif</option>
                    <option value="classic">Classic Minimal</option>
                    <option value="modern">Modern Clean</option>
                  </select>
                )}

                <button
                  onClick={() => {
                    setAnalysis(null);
                    setStructuredResume(null);
                    setFile(null);
                    setJdText('');
                  }}
                  className="px-3 py-1.5 text-xs bg-muted hover:bg-muted-foreground/10 border border-border rounded-xl font-medium text-white transition"
                >
                  Start Over
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-3 py-1.5 text-xs bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition flex items-center gap-1.5 shadow-lg shadow-primary/10"
                >
                  <Download className="w-3.5 h-3.5" /> Export PDF
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

                  {/* Print-Only A4 Page representation */}
                  <div className={`hidden print:block w-full text-black bg-white ${
                    selectedTemplate === 'traditional' ? 'font-serif' : 'font-sans'
                  }`}>
                    {/* Name & Contact Header */}
                    <div className="text-center border-b border-gray-300 pb-4 mb-6">
                      <h1 className="text-2xl font-extrabold uppercase tracking-tight text-black">{structuredResume.contactInfo.name}</h1>
                      <p className="text-[10px] text-gray-600 mt-1 flex justify-center gap-2 flex-wrap">
                        <span>{structuredResume.contactInfo.location}</span>
                        <span>•</span>
                        <span>{structuredResume.contactInfo.email}</span>
                        <span>•</span>
                        <span>{structuredResume.contactInfo.phone}</span>
                      </p>
                    </div>

                    {/* Experience */}
                    {structuredResume.workExperience && structuredResume.workExperience.length > 0 && (
                      <div className="mb-6">
                        <h2 className={`text-xs font-bold uppercase tracking-wider text-black mb-2 pb-0.5 border-b ${
                          selectedTemplate === 'modern' ? 'border-indigo-600 text-indigo-700' : 'border-black'
                        }`}>
                          Professional Experience
                        </h2>
                        <div className="space-y-3">
                          {structuredResume.workExperience.map((job, idx) => (
                            <div key={idx} className="space-y-0.5">
                              <div className="flex justify-between items-start text-xs">
                                <div>
                                  <strong className="text-black">{job.role}</strong>
                                  <span className="text-gray-700 font-medium"> | {job.company}</span>
                                </div>
                                <span className="text-[10px] text-gray-500 font-semibold">{job.startDate} - {job.endDate}</span>
                              </div>
                              <ul className="list-disc pl-4 space-y-0.5 mt-0.5 text-[10px] text-gray-800 leading-relaxed">
                                {job.bullets.map((bullet, bidx) => (
                                  <li key={bidx}>{bullet}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {structuredResume.skills && structuredResume.skills.length > 0 && (
                      <div className="mb-6">
                        <h2 className={`text-xs font-bold uppercase tracking-wider text-black mb-2 pb-0.5 border-b ${
                          selectedTemplate === 'modern' ? 'border-indigo-600 text-indigo-700' : 'border-black'
                        }`}>
                          Skills
                        </h2>
                        <div className="text-[10px] text-gray-800 leading-relaxed">
                          {structuredResume.skills.map((s, idx) => s.name).join(', ')}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {structuredResume.education && structuredResume.education.length > 0 && (
                      <div className="mb-6">
                        <h2 className={`text-xs font-bold uppercase tracking-wider text-black mb-2 pb-0.5 border-b ${
                          selectedTemplate === 'modern' ? 'border-indigo-600 text-indigo-700' : 'border-black'
                        }`}>
                          Education
                        </h2>
                        <div className="space-y-2">
                          {structuredResume.education.map((edu, idx) => (
                            <div key={idx} className="flex justify-between items-start text-xs">
                              <div>
                                <strong className="text-black">{edu.degree} in {edu.fieldOfStudy}</strong>
                                <div className="text-[10px] text-gray-600">{edu.institution}</div>
                              </div>
                              <div className="text-right text-[10px]">
                                <div className="text-gray-500 font-semibold">{edu.graduationDate}</div>
                                {edu.gpa && <div className="text-gray-600 font-medium">GPA: {edu.gpa}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {structuredResume.projects && structuredResume.projects.length > 0 && (
                      <div>
                        <h2 className={`text-xs font-bold uppercase tracking-wider text-black mb-2 pb-0.5 border-b ${
                          selectedTemplate === 'modern' ? 'border-indigo-600 text-indigo-700' : 'border-black'
                        }`}>
                          Projects
                        </h2>
                        <div className="space-y-2">
                          {structuredResume.projects.map((proj, idx) => (
                            <div key={idx} className="space-y-0.5">
                              <div className="flex justify-between items-baseline text-xs">
                                <strong className="text-black">{proj.name}</strong>
                                <span className="text-[10px] text-gray-500 italic">{proj.technologies?.join(', ')}</span>
                              </div>
                              <p className="text-[10px] text-gray-700 leading-relaxed">{proj.description}</p>
                              {proj.bullets && proj.bullets.length > 0 && (
                                <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-gray-800 leading-relaxed">
                                  {proj.bullets.map((b, bidx) => (
                                    <li key={bidx}>{b}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Screen Content Layout */}
                  <div className="print:hidden">
                    {previewMode ? (
                      /* Real-time PDF Sheet Preview on Screen */
                      <div className={`p-8 sm:p-12 bg-white text-black shadow-2xl rounded-xl mx-auto w-full max-w-[800px] border border-border/10 min-h-[900px] text-left transition-all duration-300 ${
                        selectedTemplate === 'traditional' ? 'font-serif' : selectedTemplate === 'classic' ? 'font-mono' : 'font-sans tracking-wide'
                      }`}>
                        {/* Name & Contact Header */}
                        <div className="text-center border-b border-gray-300 pb-4 mb-6">
                          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-gray-950">{structuredResume.contactInfo.name}</h1>
                          <p className="text-xs text-gray-600 mt-1.5 flex justify-center gap-2 flex-wrap">
                            <span>{structuredResume.contactInfo.location}</span>
                            <span>•</span>
                            <span>{structuredResume.contactInfo.email}</span>
                            <span>•</span>
                            <span>{structuredResume.contactInfo.phone}</span>
                          </p>
                        </div>

                        {/* Experience */}
                        {structuredResume.workExperience && structuredResume.workExperience.length > 0 && (
                          <div className="mb-6">
                            <h2 className={`text-sm font-bold uppercase tracking-wider text-gray-900 mb-3 pb-1 border-b ${
                              selectedTemplate === 'modern' ? 'border-indigo-600 text-indigo-700' : 'border-gray-800'
                            }`}>
                              Professional Experience
                            </h2>
                            <div className="space-y-4">
                              {structuredResume.workExperience.map((job, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between items-start text-sm">
                                    <div>
                                      <strong className="text-gray-900">{job.role}</strong>
                                      <span className="text-gray-600 font-medium"> | {job.company}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 font-semibold">{job.startDate} - {job.endDate}</span>
                                  </div>
                                  <ul className="list-disc pl-5 space-y-1.5 mt-1 text-xs text-gray-700 leading-relaxed">
                                    {job.bullets.map((bullet, bidx) => (
                                      <li key={bidx}>
                                        {highlightKeywords(bullet, hoveredKeyword)}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills */}
                        {structuredResume.skills && structuredResume.skills.length > 0 && (
                          <div className="mb-6">
                            <h2 className={`text-sm font-bold uppercase tracking-wider text-gray-900 mb-3 pb-1 border-b ${
                              selectedTemplate === 'modern' ? 'border-indigo-600 text-indigo-700' : 'border-gray-800'
                            }`}>
                              Skills
                            </h2>
                            <div className="text-xs text-gray-700 leading-relaxed">
                              {structuredResume.skills.map((s, idx) => (
                                <span key={idx} className="inline-block mr-2 mb-1">
                                  {highlightKeywords(s.name, hoveredKeyword)}
                                  {idx < structuredResume.skills.length - 1 && ','}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Education */}
                        {structuredResume.education && structuredResume.education.length > 0 && (
                          <div className="mb-6">
                            <h2 className={`text-sm font-bold uppercase tracking-wider text-gray-900 mb-3 pb-1 border-b ${
                              selectedTemplate === 'modern' ? 'border-indigo-600 text-indigo-700' : 'border-gray-800'
                            }`}>
                              Education
                            </h2>
                            <div className="space-y-3">
                              {structuredResume.education.map((edu, idx) => (
                                <div key={idx} className="flex justify-between items-start text-sm">
                                  <div>
                                    <strong className="text-gray-900">{edu.degree} in {edu.fieldOfStudy}</strong>
                                    <div className="text-xs text-gray-600">{edu.institution}</div>
                                  </div>
                                  <div className="text-right text-xs">
                                    <div className="text-gray-500 font-semibold">{edu.graduationDate}</div>
                                    {edu.gpa && <div className="text-gray-600 font-medium">GPA: {edu.gpa}</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Projects */}
                        {structuredResume.projects && structuredResume.projects.length > 0 && (
                          <div>
                            <h2 className={`text-sm font-bold uppercase tracking-wider text-gray-900 mb-3 pb-1 border-b ${
                              selectedTemplate === 'modern' ? 'border-indigo-600 text-indigo-700' : 'border-gray-800'
                            }`}>
                              Projects
                            </h2>
                            <div className="space-y-3">
                              {structuredResume.projects.map((proj, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between items-baseline text-sm">
                                    <strong className="text-gray-900">{proj.name}</strong>
                                    <span className="text-xs text-gray-500 italic">{proj.technologies?.join(', ')}</span>
                                  </div>
                                  <p className="text-xs text-gray-700 leading-relaxed">{proj.description}</p>
                                  {proj.bullets && proj.bullets.length > 0 && (
                                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-700 leading-relaxed">
                                      {proj.bullets.map((b, bidx) => (
                                        <li key={bidx}>{highlightKeywords(b, hoveredKeyword)}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Interactive Editor Form View */
                      <div className="space-y-6">
                        {/* 1. Contact Details */}
                        <div className="space-y-3">
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
                          <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                            Professional Experience
                          </h4>
                          {structuredResume.workExperience?.map((job, jobIndex) => (
                            <div key={jobIndex} className="space-y-2 border-l-2 border-border/50 pl-4 py-1">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={job.role || ''}
                                    onChange={(e) => {
                                      setStructuredResume((prev) => {
                                        if (!prev) return null;
                                        const updatedExperience = [...prev.workExperience];
                                        updatedExperience[jobIndex] = {
                                          ...updatedExperience[jobIndex],
                                          role: e.target.value,
                                        };
                                        return { ...prev, workExperience: updatedExperience };
                                      });
                                    }}
                                    className="bg-transparent border-b border-transparent hover:border-border focus:border-primary text-white font-bold text-sm focus:outline-none p-1 w-64 transition"
                                    placeholder="Role Title"
                                  />
                                  <input
                                    type="text"
                                    value={job.company || ''}
                                    onChange={(e) => {
                                      setStructuredResume((prev) => {
                                        if (!prev) return null;
                                        const updatedExperience = [...prev.workExperience];
                                        updatedExperience[jobIndex] = {
                                          ...updatedExperience[jobIndex],
                                          company: e.target.value,
                                        };
                                        return { ...prev, workExperience: updatedExperience };
                                      });
                                    }}
                                    className="bg-transparent border-b border-transparent hover:border-border focus:border-primary text-muted-foreground text-xs font-semibold focus:outline-none block p-1 w-64 transition"
                                    placeholder="Company Name"
                                  />
                                </div>
                                <div className="text-right">
                                  <span className="text-xs text-muted-foreground font-semibold">
                                    {job.startDate} - {job.endDate}
                                  </span>
                                </div>
                              </div>

                              {/* Bullets */}
                              <div className="space-y-3 mt-2">
                                {job.bullets?.map((bullet, bulletIndex) => (
                                  <div key={bulletIndex} className="group relative flex items-start gap-2 w-full">
                                    <span className="text-primary mt-1.5 text-xs select-none">•</span>
                                    
                                    {focusedBullet?.jobIndex === jobIndex && focusedBullet?.bulletIndex === bulletIndex ? (
                                      <textarea
                                        autoFocus
                                        value={bullet}
                                        onBlur={() => setFocusedBullet(null)}
                                        onChange={(e) => updateWorkHistoryBullet(jobIndex, bulletIndex, e.target.value)}
                                        className="w-full bg-background/60 border border-primary/40 rounded text-sm text-white leading-relaxed p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                        rows={3}
                                      />
                                    ) : (
                                      <div
                                        onClick={() => setFocusedBullet({ jobIndex, bulletIndex })}
                                        className="w-full bg-transparent hover:bg-background/20 cursor-pointer rounded text-sm text-foreground leading-relaxed p-1 border border-transparent hover:border-border/30 min-h-[28px] transition-colors"
                                      >
                                        {highlightKeywords(bullet, hoveredKeyword)}
                                      </div>
                                    )}

                                    {/* Action controls */}
                                    <div className="hidden group-hover:flex absolute right-1 top-1/2 -translate-y-1/2 items-center gap-1.5 bg-card border border-border p-1 rounded-lg shadow-lg">
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
                                  className="text-xs font-semibold text-primary hover:text-primary-foreground/90 py-1 px-2.5 rounded-lg border border-primary/20 hover:bg-primary/10 transition mt-1"
                                >
                                  + Add Bullet Point
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 3. Skills */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                            Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {structuredResume.skills?.map((skill, index) => (
                              <div
                                key={index}
                                className="text-xs px-2.5 py-1 rounded bg-secondary border border-border text-white flex items-center gap-1.5"
                              >
                                <span>{highlightKeywords(skill.name, hoveredKeyword)}</span>
                                <button
                                  onClick={() => {
                                    setStructuredResume((prev) => {
                                      if (!prev) return null;
                                      const updatedSkills = [...prev.skills];
                                      updatedSkills.splice(index, 1);
                                      return { ...prev, skills: updatedSkills };
                                    });
                                  }}
                                  className="text-muted-foreground hover:text-white text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const name = prompt('Enter skill name:');
                                if (name) {
                                  setStructuredResume((prev) => {
                                    if (!prev) return null;
                                    return {
                                      ...prev,
                                      skills: [...prev.skills, { name, category: 'Hard' }],
                                    };
                                  });
                                }
                              }}
                              className="text-xs px-2.5 py-1 rounded border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition font-semibold"
                            >
                              + Add Skill
                            </button>
                          </div>
                        </div>

                        {/* 4. Education */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                            Education
                          </h4>
                          {structuredResume.education?.map((edu, index) => (
                            <div key={index} className="flex justify-between items-start text-sm">
                              <div>
                                <p className="font-semibold text-white">
                                  {edu.degree} in {edu.fieldOfStudy}
                                </p>
                                <p className="text-xs text-muted-foreground">{edu.institution}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">{edu.graduationDate}</p>
                                {edu.gpa && <p className="text-xs text-primary">GPA: {edu.gpa}</p>}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 5. Projects */}
                        {structuredResume.projects && structuredResume.projects.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                              Academic & Side Projects
                            </h4>
                            {structuredResume.projects.map((proj, index) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between">
                                  <p className="font-semibold text-white text-sm">{proj.name}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {proj.technologies?.join(', ')}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {proj.description}
                                </p>
                                {proj.bullets?.map((b, bi) => (
                                  <p key={bi} className="text-xs text-foreground pl-3 border-l border-border">
                                    • {highlightKeywords(b, hoveredKeyword)}
                                  </p>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
                              '--value': analysis?.overallScore || 0,
                              '--size': '8rem',
                              '--thickness': '8px',
                            } as React.CSSProperties}
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
                              <button
                                key={i}
                                onClick={() => handleAutoIntegrateKeyword(word)}
                                className="text-xs px-2.5 py-1 rounded bg-destructive/10 hover:bg-destructive/20 text-rose-300 border border-destructive/20 hover:border-destructive/40 font-medium flex items-center gap-1 group transition cursor-pointer"
                                title="Click to auto-integrate this keyword into your first experience bullet point via AI"
                              >
                                {word}
                                <span className="text-[10px] text-rose-400 group-hover:text-white transition-colors">💡 Fix</span>
                              </button>
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
                            {analysis?.keywordHeatmap?.map((item, i) => (
                              <div
                                key={i}
                                onMouseEnter={() => setHoveredKeyword(item.word)}
                                onMouseLeave={() => setHoveredKeyword(null)}
                                className={`flex justify-between items-center text-xs border-b border-border/40 pb-1.5 last:border-none transition duration-150 ${
                                  hoveredKeyword && hoveredKeyword.toLowerCase() === item.word.toLowerCase()
                                    ? 'bg-primary/10 px-1.5 py-1 rounded border border-primary/20'
                                    : ''
                                }`}
                              >
                                <span className="text-white font-medium">{item.word}</span>
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

                        {analysis?.contactInfoAlerts && analysis.contactInfoAlerts.length > 0 && (
                          <div className="border-t border-border pt-4 space-y-2">
                            <h4 className="font-semibold text-xs text-white uppercase tracking-wider">
                              Contact Gaps
                            </h4>
                            {analysis.contactInfoAlerts.map((alertText, i) => (
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
            <h2 className="text-2xl font-bold text-center text-white mb-10">Advanced Features Crafted for Job Seekers</h2>
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
                  Check layout safety, standard section titles, and keyword density. Highlights formatting hazards before they reject your file.
                </p>
              </div>
              <div className="border border-border p-6 rounded-2xl bg-card/20 hover:border-primary/50 transition">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">Recruiter Simulations</h3>
                <p className="text-sm text-muted-foreground">
                  Get feedback from the recruiter&apos;s perspective: core concerns, likely interview rate, and major strengths.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
      {/* SCAN HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl glow-primary overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" /> Scan History
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Select and restore any of your previously analyzed resume optimizations.
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-muted-foreground hover:text-white transition p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium text-sm">No scans saved yet</p>
                  <p className="text-xs mt-1">Run an ATS compatibility check to log past analyses.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((scan: any, idx: number) => (
                    <div
                      key={scan.id || idx}
                      className="border border-border/60 hover:border-primary/40 bg-background/20 hover:bg-background/40 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition duration-150"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            {scan.overallScore}% Match
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(scan.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white">
                          {scan.jobDescription?.title || 'Unknown Role'}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {scan.jobDescription?.company || 'Unknown Company'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSelectHistoryItem(scan)}
                        className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white font-semibold text-xs rounded-lg shadow transition flex items-center justify-center gap-1.5"
                      >
                        Restore Scan
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-background/30 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-muted hover:bg-muted-foreground/10 text-white border border-border rounded-xl text-xs font-semibold transition"
              >
                Close Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
