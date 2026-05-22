import { NextRequest, NextResponse } from 'next/server';
import { parseJobDescription, analyzeResumeVsJob } from '@/lib/gemini';
import { runATSRulesEngine } from '@/services/scoring';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { structuredResume, jdText, rawResumeText, userId } = await req.json();

    if (!structuredResume || !jdText || !rawResumeText) {
      return NextResponse.json(
        { error: 'Structured resume, job description text, and raw resume text are required.' },
        { status: 400 }
      );
    }

    // 1. Parse job description
    let parsedJD;
    try {
      parsedJD = await parseJobDescription(jdText);
    } catch (aiError) {
      console.warn('Gemini JD parsing failed. Using mock fallback.', aiError);
      parsedJD = generateMockJDData(jdText);
    }

    // Extract target keywords
    const targetKeywords = parsedJD.skills.map((s: any) => s.name);

    // 2. Run ATS Rules Heuristic Engine
    const rulesOutput = runATSRulesEngine({
      rawText: rawResumeText,
      structuredJson: structuredResume,
      targetKeywords,
    });

    // 3. Run Gemini deep analysis
    let aiAnalysis;
    try {
      aiAnalysis = await analyzeResumeVsJob(structuredResume, parsedJD, rawResumeText, jdText);
    } catch (aiError) {
      console.warn('Gemini overall comparison failed. Using mock analysis.', aiError);
      aiAnalysis = generateMockAnalysis(structuredResume, parsedJD, rulesOutput);
    }

    // 4. Combine/Merge Scores
    // Rule Engine influences formatting and readability scores
    const finalFormattingScore = Math.round((aiAnalysis.formattingScore + rulesOutput.heuristicsScore) / 2);
    const combinedFormattingIssues = Array.from(
      new Set([
        ...aiAnalysis.formattingIssues,
        ...rulesOutput.missingStandardHeaders,
        ...rulesOutput.formattingConsistencyAlerts,
        ...rulesOutput.parsingSafetyAlerts,
      ])
    );

    // Compute composite ATS score
    const keywordWeight = 0.35;
    const impactWeight = 0.25;
    const formattingWeight = 0.20;
    const readabilityWeight = 0.20;

    const finalCompositeScore = Math.round(
      aiAnalysis.keywordScore * keywordWeight +
        aiAnalysis.impactScore * impactWeight +
        finalFormattingScore * formattingWeight +
        aiAnalysis.readabilityScore * readabilityWeight
    );

    const mergedAnalysis = {
      overallScore: finalCompositeScore,
      keywordScore: aiAnalysis.keywordScore,
      formattingScore: finalFormattingScore,
      readabilityScore: aiAnalysis.readabilityScore,
      impactScore: aiAnalysis.impactScore,
      missingKeywords: aiAnalysis.missingKeywords,
      keywordHeatmap: aiAnalysis.keywordHeatmap,
      bulletFeedback: aiAnalysis.bulletFeedback,
      recruiterSim: aiAnalysis.recruiterSim,
      formattingIssues: combinedFormattingIssues,
      contactInfoAlerts: rulesOutput.contactInfoClarityAlerts,
      keywordDensityAlerts: rulesOutput.keywordDensityAlerts,
    };

    // 5. Optionally store in database
    if (userId) {
      try {
        // Find or create default resume
        let resume = await db.resume.findFirst({
          where: { userId },
        });

        if (!resume) {
          resume = await db.resume.create({
            data: {
              userId,
              title: 'My Main Resume',
            },
          });
        }

        // Save resume version
        const resumeVersion = await db.resumeVersion.create({
          data: {
            resumeId: resume.id,
            versionNumber: 1,
            rawText: rawResumeText,
            structuredJson: structuredResume,
            fileUrl: '',
            fileType: 'PDF',
          },
        });

        // Save Job Description
        const jobDesc = await db.jobDescription.create({
          data: {
            title: parsedJD.title,
            company: parsedJD.company,
            rawText: jdText,
            parsedKeywords: parsedJD,
          },
        });

        // Save Analysis report
        await db.aTSAnalysis.create({
          data: {
            resumeVersionId: resumeVersion.id,
            jobDescId: jobDesc.id,
            overallScore: finalCompositeScore,
            keywordScore: aiAnalysis.keywordScore,
            formattingScore: finalFormattingScore,
            readabilityScore: aiAnalysis.readabilityScore,
            impactScore: aiAnalysis.impactScore,
            missingKeywords: aiAnalysis.missingKeywords,
            keywordHeatmap: aiAnalysis.keywordHeatmap,
            bulletFeedback: aiAnalysis.bulletFeedback,
            recruiterSim: aiAnalysis.recruiterSim,
            formattingIssues: combinedFormattingIssues,
          },
        });
      } catch (dbError) {
        console.error('Failed to log analysis to database:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      analysis: mergedAnalysis,
      jobDetails: parsedJD,
    });
  } catch (error: any) {
    console.error('Analysis handler error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

function generateMockJDData(jdText: string) {
  return {
    title: 'Senior Software Engineer',
    company: 'NextGen SaaS',
    skills: [
      { name: 'TypeScript', category: 'Hard', importance: 'High' },
      { name: 'React', category: 'Hard', importance: 'High' },
      { name: 'Next.js', category: 'Hard', importance: 'High' },
      { name: 'PostgreSQL', category: 'Tool', importance: 'Medium' },
      { name: 'REST APIs', category: 'Hard', importance: 'Medium' },
      { name: 'Docker', category: 'Tool', importance: 'Low' },
      { name: 'Leadership', category: 'Soft', importance: 'Medium' },
      { name: 'Communication', category: 'Soft', importance: 'Medium' },
    ],
    experienceLevel: 'Senior',
    recruiterIntent: 'Looking for a full stack engineer with strong Next.js and API optimization experience.',
    summaryOfRole: 'Build highly responsive web applications and scale backend database queries.',
  };
}

function generateMockAnalysis(structuredResume: any, parsedJD: any, rulesOutput: any) {
  // Check which JD skills are present in the resume skills
  const resumeSkillsLower = (structuredResume.skills || []).map((s: any) => s.name.toLowerCase());
  const missingKeywords: string[] = [];
  const keywordHeatmap: any[] = [];

  parsedJD.skills.forEach((skill: any) => {
    const isPresent = resumeSkillsLower.some((rs: string) => rs.includes(skill.name.toLowerCase()));
    if (!isPresent) {
      missingKeywords.push(skill.name);
      keywordHeatmap.push({ word: skill.name, importance: skill.importance, matchesInResume: 0 });
    } else {
      keywordHeatmap.push({ word: skill.name, importance: skill.importance, matchesInResume: 2 });
    }
  });

  // Bullet point analysis mock
  const bulletFeedback: any[] = [];
  if (structuredResume.workExperience && structuredResume.workExperience.length > 0) {
    const firstJob = structuredResume.workExperience[0];
    if (firstJob.bullets && firstJob.bullets.length > 0) {
      bulletFeedback.push({
        original: firstJob.bullets[0],
        feedback: 'Weak bullet point. Lacks metrics or quantifiable impact.',
        rewrite: `Redesigned UI elements using Next.js and Tailwind, boosting user retention by 14% and saving 8 developer hours weekly.`,
      });
    }
  }

  return {
    overallScore: 72,
    keywordScore: Math.round(((parsedJD.skills.length - missingKeywords.length) / parsedJD.skills.length) * 100),
    formattingScore: 85,
    readabilityScore: 80,
    impactScore: 65,
    missingKeywords,
    keywordHeatmap,
    bulletFeedback,
    recruiterSim: {
      firstImpressions: 'Solid baseline technical experience in React and Node.js. However, the resume needs to highlight modern Next.js and system optimization skills to fit this senior level role.',
      concerns: ['Lacks clear metrics indicating business impact.', 'Missing knowledge of database optimization or cloud tools.'],
      strengths: ['Clear experience timeline.', 'Strong baseline engineering skills.'],
      likelyInterviewRate: 45,
    },
    formattingIssues: [],
  };
}
