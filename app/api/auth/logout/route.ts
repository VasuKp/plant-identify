import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Create a response
    const response = NextResponse.json({
      success: true,
      message: "Logout successful"
    });
    
    // Clear the auth cookie
    response.cookies.set({
      name: 'authToken',
      value: '',
      httpOnly: true,
      expires: new Date(0), // Set expiration to the past to delete cookie
      path: '/',
      sameSite: 'strict',
    });
    
    return response;
    
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({
      success: false,
      message: "An error occurred during logout"
    }, { status: 500 });
  }
} 