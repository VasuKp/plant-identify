import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { authenticate } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get search query parameters
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
    const skip = (page - 1) * pageSize;

    // If query exists and user is authenticated, log the search query
    const auth = await authenticate(req);
    if (query && auth?.userId) {
      await prisma.search.create({
        data: {
          userId: auth.userId,
          query
        }
      });
    }

    // Build filter conditions
    const whereConditions: any = {};
    
    if (query) {
      whereConditions.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { nameHi: { contains: query, mode: 'insensitive' } },
        { nameGu: { contains: query, mode: 'insensitive' } },
        { scientificName: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    if (category && category !== 'all') {
      whereConditions.category = category;
    }

    // Perform search query
    const plants = await prisma.plant.findMany({
      where: whereConditions,
      take: pageSize,
      skip,
      orderBy: {
        name: 'asc'
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.plant.count({
      where: whereConditions
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      data: {
        plants,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasMore
        }
      }
    });

  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({
      success: false,
      message: "An error occurred while searching plants"
    }, { status: 500 });
  }
} 