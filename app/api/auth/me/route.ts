import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/app/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized - No token provided"
      }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Special case for admin tokens (not stored in database)
    if (token.startsWith('admin-token-')) {
      // For admin token, we'll return the admin user data
      const adminEmail = req.headers.get('X-User-Email') || 'admin';
      
      return NextResponse.json({
        success: true,
        data: {
          id: 'admin-id',
          name: adminEmail === 'admin' ? 'Administrator' : 'Vasu',
          email: adminEmail,
          role: 'ADMIN',
          lastLogin: new Date().toISOString()
        }
      });
    }
    // Special case for demo tokens (not stored in database)
    if (token.startsWith('demo-token-') || token.startsWith('user-token-')) {
      const demoEmail = req.headers.get('X-User-Email') || 'demo@example.com';
      return NextResponse.json({
        success: true,
        data: {
          id: 'user-id',
          name: 'Demo User',
          email: demoEmail,
          role: 'USER',
          lastLogin: new Date().toISOString()
        }
      });
    }
    
    // Validate the token and get user data
    const user = await validateToken(token);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired token"
      }, { status: 401 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({
      success: false,
      message: "An error occurred while fetching user data"
    }, { status: 500 });
  }
} 