import { NextRequest, NextResponse } from 'next/server';
import { getAgentAnalysis } from '../services/geminiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketQuestion, tweetContent, yesPrice } = body;

    if (!marketQuestion || !tweetContent || yesPrice === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters: marketQuestion, tweetContent, yesPrice' },
        { status: 400 }
      );
    }

    const analysis = await getAgentAnalysis(marketQuestion, tweetContent, yesPrice);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Agent analysis API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get agent analysis',
        analysis:
          'The markets are volatile, and my circuits are hazy. DYOR (Do Your Own Research).',
      },
      { status: 500 }
    );
  }
}
