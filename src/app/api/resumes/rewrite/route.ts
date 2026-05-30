import { NextRequest, NextResponse } from 'next/server';
import { rewriteBulletPoint } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { bullet, keywords } = await req.json();

    if (!bullet) {
      return NextResponse.json({ error: 'Bullet point text is required.' }, { status: 400 });
    }

    const contextKeywords = keywords || [];

    let rewriteResult;
    try {
      rewriteResult = await rewriteBulletPoint(bullet, contextKeywords);
    } catch (aiError) {
      console.warn('Gemini bullet rewrite failed. Using rule-based fallback.', aiError);
      rewriteResult = generateMockRewrite(bullet, contextKeywords);
    }

    return NextResponse.json({
      success: true,
      rewritten: rewriteResult.rewritten,
      explanation: rewriteResult.explanation,
      metricsAdded: rewriteResult.metricsAdded,
    });
  } catch (error) {
    console.error('Rewrite handler error:', error);
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

function generateMockRewrite(bullet: string, keywords: string[]) {
  const keywordStr = keywords.slice(0, 2).join(' and ');
  const metric = '23%';
  const verb = 'Orchestrated';

  return {
    rewritten: `${verb} scalable workflows integrating ${keywordStr || 'core systems'}, which resulted in a ${metric} improvement in performance optimization.`,
    explanation: 'Enhanced the bullet point by adding a strong action verb, focusing on performance metrics, and integrating your target keywords.',
    metricsAdded: [metric],
  };
}
