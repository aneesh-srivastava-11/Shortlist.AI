import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetter } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jdText } = await req.json();

    if (!resumeText || !jdText) {
      return NextResponse.json(
        { error: 'Both resumeText and jdText are required to generate a cover letter.' },
        { status: 400 }
      );
    }

    let letterContent: string;
    try {
      letterContent = await generateCoverLetter(resumeText, jdText);
    } catch (aiError) {
      console.warn('Gemini cover letter generation failed. Using fallback template.', aiError);
      letterContent = generateMockCoverLetter(resumeText, jdText);
    }

    return NextResponse.json({
      success: true,
      coverLetter: letterContent,
    });
  } catch (error) {
    console.error('Cover letter generator handler error:', error);
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

function generateMockCoverLetter(resumeText: string, _jdText: string): string {
  // Simple regex extraction for contact/company details
  const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : 'candidate@example.com';
  const nameLine = resumeText.split('\n')[0]?.trim() || 'Professional Candidate';

  return `Dear Hiring Manager,

I am writing to express my strong interest in the open position at your esteemed company. Given my background and experience, I believe I am an excellent candidate for the role.

Throughout my career, I have focused on delivering high-quality solutions, optimizing code bases, and collaborating across cross-functional engineering teams. My background aligns well with the key requirements detailed in your job description, specifically around engineering excellence, technical communication, and standard tools execution.

I welcome the opportunity to discuss how my skills and experiences can benefit your engineering team. Thank you for your time and consideration.

Sincerely,
${nameLine}
${email}`;
}
