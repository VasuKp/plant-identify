import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'
import path from 'path'

// Updated database URL handling for Supabase
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || '';
  
  // Special case for SQLite (keeping for fallback)
  if (url.startsWith('file:')) {
    const filePath = url.replace(/^file:/, '').trim();
    
    // If it's a relative path, resolve it relative to the project root
    if (filePath.startsWith('./') || filePath.startsWith('../')) {
      const projectRoot = process.cwd();
      const absolutePath = path.resolve(projectRoot, filePath);
      return `file:${absolutePath}`;
    }
  }
  
  // For PostgreSQL, ensure we have SSL required
  if (url.includes('supabase') && !url.includes('sslmode=require')) {
    return `${url}${url.includes('?') ? '&' : '?'}sslmode=require`;
  }
  
  return url;
};

const prismaClientSingleton = () => {
  try {
    console.log('Initializing Prisma client with database URL pattern:', 
      getDatabaseUrl().replace(/:[^:@]+@/, ':****@')); // Log URL with password redacted
    
    return new PrismaClient({
      log: ['error', 'warn'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: getDatabaseUrl(),
        },
      },
    });
  } catch (error) {
    console.error('Error initializing Prisma client:', error);
    throw error;
  }
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

let prisma: PrismaClientSingleton;

try {
  prisma = globalForPrisma.prisma ?? prismaClientSingleton();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  // Create a mock prisma client that logs errors instead of crashing
  prisma = new Proxy({} as PrismaClientSingleton, {
    get: (target, prop) => {
      if (prop === '$connect' || prop === '$disconnect') {
        return async () => { console.error(`Prisma mock ${prop} called`); };
      }
      
      return () => {
        console.error(`Prisma client unavailable, operation '${String(prop)}' failed`);
        throw new Error('Database connection unavailable');
      };
    }
  });
}

// Add connection test function
export async function testConnection() {
  try {
    console.log('Testing database connection...');
    // Test database connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export default prisma; 