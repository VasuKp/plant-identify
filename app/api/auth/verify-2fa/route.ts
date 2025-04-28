import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const twoFactorSchema = z.object({
  email: z.string().min(1, "Email is required"),
  code: z.string().min(6, "Verification code must be at least 6 characters").max(6, "Verification code must be 6 characters")
});

// Demo admin credentials
const ADMIN_CREDENTIALS = ['admin', 'vasu23', 'admin@example.com'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validationResult = twoFactorSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: "Invalid input",
        errors: validationResult.error.flatten().fieldErrors
      }, { status: 400 });
    }
    
    const { email, code } = body;
    
    // For demo purposes, any 6-digit code is valid for admin accounts
    const isAdminAccount = ADMIN_CREDENTIALS.includes(email) || email.toLowerCase() === 'admin';
    
    if (isAdminAccount && /^\d{6}$/.test(code)) {
      // Create admin user response
      return NextResponse.json({
        success: true,
        message: "2FA verification successful",
        token: "admin-token-" + Math.random().toString(36).substring(2, 15), 
        user: {
          id: 'admin-id',
          name: email === 'admin' ? 'Administrator' : 'Vasu',
          email: email,
          role: 'ADMIN',
          lastLogin: new Date().toISOString()
        }
      });
    }
    
    // For regular users in demo mode
    if (/^\d{6}$/.test(code)) {
      return NextResponse.json({
        success: true,
        message: "2FA verification successful",
        token: "user-token-" + Math.random().toString(36).substring(2, 15),
        user: {
          id: 'user-id',
          name: 'Demo User',
          email: email,
          role: 'USER',
          lastLogin: new Date().toISOString()
        }
      });
    }
    
    // Invalid code
    return NextResponse.json({
      success: false,
      message: "Invalid verification code. Please enter a 6-digit number."
    }, { status: 400 });
    
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json({
      success: false,
      message: "An error occurred during verification"
    }, { status: 500 });
  }
} 