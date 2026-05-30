export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  links?: string[];
}

export interface Skill {
  name: string;
  category: 'Hard' | 'Soft' | 'Tool';
  importance?: 'High' | 'Medium' | 'Low';
}

export interface WorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string;
  gpa?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  bullets: string[];
}

export interface StructuredResume {
  contactInfo: ContactInfo;
  skills: Skill[];
  workExperience: WorkExperience[];
  education: Education[];
  projects?: Project[];
}

export interface ParsedJD {
  title: string;
  company: string;
  skills: Skill[];
  experienceLevel: string;
  recruiterIntent: string;
  summaryOfRole: string;
}

export interface HeatmapItem {
  word: string;
  importance: 'High' | 'Medium' | 'Low';
  matchesInResume: number;
}

export interface BulletFeedback {
  original: string;
  feedback: string;
  rewrite: string;
}

export interface RecruiterSim {
  firstImpressions: string;
  concerns: string[];
  strengths: string[];
  likelyInterviewRate: number;
}

export interface AnalysisResult {
  overallScore: number;
  keywordScore: number;
  formattingScore: number;
  readabilityScore: number;
  impactScore: number;
  missingKeywords: string[];
  keywordHeatmap: HeatmapItem[];
  bulletFeedback: BulletFeedback[];
  recruiterSim: RecruiterSim;
  formattingIssues: string[];
  contactInfoAlerts?: string[];
  keywordDensityAlerts?: string[];
}

export interface RulesOutput {
  heuristicsScore: number;
  contactInfoClarityAlerts: string[];
  missingStandardHeaders: string[];
  formattingConsistencyAlerts: string[];
  parsingSafetyAlerts: string[];
  keywordDensityAlerts: string[];
}
