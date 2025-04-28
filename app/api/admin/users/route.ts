import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { authenticate, isAdmin } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 401 });
    }
    
    // Check if user is admin
    if (!isAdmin(auth.role)) {
      return NextResponse.json({
        success: false,
        message: "Access denied. Admin privileges required."
      }, { status: 403 });
    }
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        lastLogin: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      data: users
    });
    
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({
      success: false,
      message: "An error occurred while fetching users"
    }, { status: 500 });
  }
} 