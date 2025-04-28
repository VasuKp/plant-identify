import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "API route is working",
    timestamp: new Date().toISOString(),
    env: {
      jwtSecretSet: !!process.env.JWT_SECRET,
      dbUrlSet: !!process.env.DATABASE_URL
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    return NextResponse.json({
      success: true,
      message: "POST route is working",
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error processing request",
      error: (error as Error).message
    }, { status: 400 });
  }
} 