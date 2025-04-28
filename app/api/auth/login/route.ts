import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
});

// Demo users
const DEMO_USERS = [
  {
    email: 'admin@example.com',
    password: 'Admin123!',
    id: 'admin-id',
    name: 'Administrator',
    role: 'ADMIN',
    lastLogin: new Date().toISOString()
  },
  {
    email: 'user@example.com',
    password: 'User123!',
    id: 'user-id',
    name: 'Demo User',
    role: 'USER',
    lastLogin: new Date().toISOString()
  }
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: "Invalid input",
        errors: validationResult.error.flatten().fieldErrors
      }, { status: 400 });
    }
    
    const { email, password } = body;
    
    // Check for demo users
    const demoUser = DEMO_USERS.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user.password === password
    );
    
    if (demoUser) {
      return NextResponse.json({
        success: true,
        message: "Login successful",
        token: "demo-token-" + Math.random().toString(36).substring(2, 15),
        user: {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          lastLogin: new Date().toISOString()
        }
      });
    }
    
    // Special handling for demo purposes
    if ((email === 'admin' && password === 'admin123') || 
        (email === 'vasu23' && password === 'Vasukp@2212')) {
      
      return NextResponse.json({
        success: true,
        message: "Login successful",
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
    
    // In a real application, you would verify against actual user records in your database
    // For demo, we'll just return an error for any non-demo users
    return NextResponse.json({
      success: false,
      message: "Invalid email or password"
    }, { status: 401 });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: "An error occurred during login"
    }, { status: 500 });
  }
} 