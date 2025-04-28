import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { authenticate } from '@/app/lib/auth';
import { z } from 'zod';

// Validation schema
const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional()
});

export async function PUT(req: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 401 });
    }
    
    // Admin-specific validation
    if (auth.userId === 'admin-id') {
      return NextResponse.json({
        success: false,
        message: "Admin profile cannot be updated through this endpoint"
      }, { status: 403 });
    }
    
    const body = await req.json();
    
    // Validate request body
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors
      }, { status: 400 });
    }
    
    const { name, phoneNumber, address, bio } = body;
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        name,
        phoneNumber,
        address,
        bio
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        address: true,
        bio: true,
        role: true,
        lastLogin: true,
        createdAt: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
    
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({
      success: false,
      message: "An error occurred while updating profile"
    }, { status: 500 });
  }
} 