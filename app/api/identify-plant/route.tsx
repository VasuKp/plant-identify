import { NextResponse } from 'next/server';

const API_URL = 'https://api.apilayer.com/plant_identification/identify';

export async function POST(request: Request) {
  try {
    const { image, locale } = await request.json();

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'apikey': process.env.PLANT_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image, language: locale }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to identify plant');
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}