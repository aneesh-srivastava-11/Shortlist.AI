import { GoogleGenerativeAI } from '@google/generative-ai';
import { StructuredResume, ParsedJD, AnalysisResult } from '@/types';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Helper to clean response content
function cleanJSONResponse(text: string): string {
  // Sometimes Gemini wraps responses in ```json ... ```
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * Parses raw text from a resume and maps it into structured sections.
 */
export async function parseResumeText(rawText: string) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `
    You are an expert resume parsing engine.
    Analyze the following raw text from a resume and convert it into a structured JSON object.
    Ensure all fields are extracted accurately. If a field cannot be found, leave it blank or as an empty list.

    The response MUST match the following TypeScript schema:
    {
      contactInfo: {
        name: string;
        email: string;
        phone: string;
        location: string;
        links: string[];
      };
      skills: Array<{ name: string; category: "Hard" | "Soft" | "Tool" }>;
      workExperience: Array<{
        company: string;
        role: string;
        startDate: string;
        endDate: string;
        bullets: string[];
      }>;
      education: Array<{
        institution: string;
        degree: string;
        fieldOfStudy: string;
        graduationDate: string;
        gpa: string;
      }>;
      projects: Array<{
        name: string;
        description: string;
        technologies: string[];
        bullets: string[];
      }>;
    }

    Resume Raw Text:
    """
    ${rawText}
    """
  `;

  const result = await model.generateContent(prompt);
  const responseText = cleanJSONResponse(result.response.text());
  return JSON.parse(responseText);
}

/**
 * Analyzes a Job Description to extract requirements, key hard/soft skills, and recruiter intent.
 */
export async function parseJobDescription(jdText: string): Promise<ParsedJD> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `
    You are an ATS parser and recruiter agent.
    Analyze this Job Description and extract structural information about roles and keywords.

    The response MUST match the following JSON schema:
    {
      title: string;
      company: string;
      skills: Array<{ name: string; category: "Hard" | "Soft" | "Tool"; importance: "High" | "Medium" | "Low" }>;
      experienceLevel: string; // e.g., "Entry", "Mid", "Senior", "Lead"
      recruiterIntent: string; // concise statement of what they are primarily looking for
      summaryOfRole: string;
    }

    Job Description:
    """
    ${jdText}
    """
  `;

  const result = await model.generateContent(prompt);
  const responseText = cleanJSONResponse(result.response.text());
  return JSON.parse(responseText);
}

/**
 * Evaluates a resume version against a job description, calculates scores, identifies missing keywords,
 * reviews formatting, audits bullets, and runs recruiter simulation.
 */
export async function analyzeResumeVsJob(
  structuredResume: StructuredResume,
  parsedJD: ParsedJD,
  rawResumeText: string,
  rawJDText: string
): Promise<AnalysisResult> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `
    You are an expert recruiter and ATS algorithm simulator.
    You will compare the provided structured resume against the parsed Job Description (JD).
    
    Review and calculate:
    1. Overall score (0-100) based on role fit, keyword matching, formatting, readability, and bullet points impact.
    2. Specific subscores:
       - keywordScore (0-100): matching target skills.
       - formattingScore (0-100): checking if layouts, fonts, or headers cause parsing risks.
       - readabilityScore (0-100): complexity, sentence length, and contact details visibility.
       - impactScore (0-100): strength of work items, metrics, and achievement wording.
    3. Missing JD keywords (String[]).
    4. Keyword heatmap: Map each important JD keyword to its relevance (0-10) and occurrences in the resume.
    5. Bullet point critiques: For weak bullets, provide feedback and a high-impact, metrics-driven rewrite.
    6. Recruiter Simulation:
       - firstImpressions: string
       - concerns: string[] (red flags, gaps in experience or tech)
       - strengths: string[]
       - likelyInterviewRate: number (0-100 percentage)
    7. Formatting issues: Check for multi-column hazards, text in images, and non-standard header formats.

    Return the final evaluation matching the following schema:
    {
      overallScore: number;
      keywordScore: number;
      formattingScore: number;
      readabilityScore: number;
      impactScore: number;
      missingKeywords: string[];
      keywordHeatmap: Array<{ word: string; importance: "High" | "Medium" | "Low"; matchesInResume: number }>;
      bulletFeedback: Array<{ original: string; feedback: string; rewrite: string }>;
      recruiterSim: {
        firstImpressions: string;
        concerns: string[];
        strengths: string[];
        likelyInterviewRate: number;
      };
      formattingIssues: string[];
    }

    Resume JSON data:
    ${JSON.stringify(structuredResume, null, 2)}

    Job Description JSON data:
    ${JSON.stringify(parsedJD, null, 2)}

    Raw Resume Text:
    """
    ${rawResumeText}
    """

    Raw Job Description Text:
    """
    ${rawJDText}
    """
  `;

  const result = await model.generateContent(prompt);
  const responseText = cleanJSONResponse(result.response.text());
  return JSON.parse(responseText);
}

/**
 * Generates an optimized rewrite of a single bullet point or section summary.
 */
export async function rewriteBulletPoint(bullet: string, contextKeywords: string[]) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `
    You are a professional resume writer.
    Optimize the following bullet point from a resume to increase its impact, add action verbs,
    incorporate metrics (quantifiable achievements), and weave in some of the target keywords where natural.
    Do not engage in keyword stuffing; keep it readable and highly professional.

    Target Keywords to consider: ${contextKeywords.join(', ')}

    Original bullet:
    "${bullet}"

    Return JSON:
    {
      rewritten: string;
      explanation: string;
      metricsAdded: string[];
    }
  `;

  const result = await model.generateContent(prompt);
  const responseText = cleanJSONResponse(result.response.text());
  return JSON.parse(responseText);
}

/**
 * Generates a tailored cover letter.
 */
export async function generateCoverLetter(resumeText: string, jdText: string) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });

  const prompt = `
    You are a professional career coach.
    Write a highly tailored, recruiter-friendly, and concise cover letter (max 300 words).
    Use details from the provided Resume to match the requirements in the Job Description.
    Keep the tone professional, persuasive, and customized to the company. Do not use generic placeholders where possible, or use clean brackets [like this] if necessary.

    Resume:
    """
    ${resumeText}
    """

    Job Description:
    """
    ${jdText}
    """
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
