import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uri = searchParams.get('uri');

  if (!uri) {
    return NextResponse.json({ error: 'URI parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(uri, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkolEvent/1.0)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching TON metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}
