import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/app/lib/db';
import { z } from 'zod';

// Initialize database on startup (in a real app, this would be in a separate setup script)
import { initializeDatabase, testConnection } from '@/app/lib/db';

// Validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  phoneNumber: z.string().optional()
});

// Password validation regex patterns
const hasUppercase = /[A-Z]/;
const hasLowercase = /[a-z]/;
const hasNumber = /[0-9]/;
const hasSpecial = /[^A-Za-z0-9]/;

const validatePassword = (password: string) => {
  const issues = [];
  
  if (password.length < 8) issues.push("be at least 8 characters long");
  if (!hasUppercase.test(password)) issues.push("contain at least one uppercase letter");
  if (!hasLowercase.test(password)) issues.push("contain at least one lowercase letter");
  if (!hasNumber.test(password)) issues.push("contain at least one number");
  if (!hasSpecial.test(password)) issues.push("contain at least one special character");
  
  if (issues.length === 0) {
    return { valid: true, message: "" };
  }
  
  return { 
    valid: false, 
    message: `Password must ${issues.join(", and ")}`
  };
};

// Make sure database connection works
testConnection().then(connected => {
  console.log(`[Signup API] Database connection test result: ${connected ? 'SUCCESS' : 'FAILED'}`);
  if (!connected) {
    console.error('[Signup API] Database connection failed - signup functionality will not work');
  } else {
    // Initialize database tables
    initializeDatabase().then(success => {
      console.log(`[Signup API] Database initialization result: ${success ? 'SUCCESS' : 'FAILED'}`);
    }).catch(err => {
      console.error('[Signup API] Database initialization error:', err);
    });
  }
}).catch(err => {
  console.error('[Signup API] Database connection test error:', err);
});

export async function POST(req: NextRequest) {
  console.log('[Signup API] Received signup request');
  
  try {
    const body = await req.json();
    console.log('[Signup API] Request body:', JSON.stringify(body, null, 2));
    
    // Validate request body
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('[Signup API] Validation failed:', validationResult.error.flatten().fieldErrors);
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors
      }, { status: 400 });
    }
    
    const { name, email, password, phoneNumber } = body;
    console.log('[Signup API] Validated data:', { name, email, phoneNumber, passwordLength: password?.length });
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      console.error('[Signup API] Password validation failed:', passwordValidation.message);
      return NextResponse.json({
        success: false,
        message: passwordValidation.message
      }, { status: 400 });
    }
    
    // Test database connection before attempting to create user
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('[Signup API] Database connection failed before creating user');
      return NextResponse.json({
        success: false,
        message: "Database connection error. Please try again later."
      }, { status: 503 });
    }
    
    console.log('[Signup API] Database connection confirmed, creating user...');
    
    try {
      // Create user in database
      const user = await createUser({
        name,
        email,
        password,
        phoneNumber
      });
      
      console.log('[Signup API] User created successfully:', { id: user.id, email: user.email });
      
      return NextResponse.json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }, { status: 201 });
      
    } catch (error: any) {
      console.error('[Signup API] User creation error:', error.message || error);
      
      if (error.message === 'Email already registered') {
        return NextResponse.json({
          success: false,
          message: "Email already registered. Please use a different email."
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: false,
        message: "Failed to create user account. Please try again later."
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('[Signup API] Unexpected error:', error.message || error);
    return NextResponse.json({
      success: false,
      message: "Unable to sign up. Please check your connection and try again."
    }, { status: 500 });
  }
} 