// Test script for Prisma database connection
// Make sure Node has access to the .env file for the database connection

// First ensure we have the required environment variables
require('dotenv').config(); // This will load environment variables from .env file

// Log the actual connection string with redacted password
const dbUrl = process.env.DATABASE_URL || '';
console.log('DATABASE_URL pattern:', dbUrl.replace(/:[^:@]+@/, ':****@'));

// Manually set the database URL for this test
// This ensures we're using the correct credentials
process.env.DATABASE_URL = "postgresql://postgres.roprgzjenvpfckgpwysg:Vasukp@2312@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

// Import PrismaClient
const { PrismaClient } = require('@prisma/client');

// Create a Prisma client instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testPrismaConnection() {
  console.log('Testing Prisma database connection...');
  console.log('Using database URL pattern:', 
    process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'Not set');
  
  try {
    // Determine database type for appropriate test query
    const isPostgres = process.env.DATABASE_URL?.includes('postgresql');
    console.log(`Detected ${isPostgres ? 'PostgreSQL' : 'SQLite'} database`);
    
    // Try a simple query (database-specific)
    console.log('Executing test query...');
    let result;
    if (isPostgres) {
      result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    } else {
      result = await prisma.$queryRaw`SELECT CURRENT_TIMESTAMP as current_time`;
    }
    
    console.log('✅ Database connection successful!');
    console.log('Current database time:', result[0].current_time);
    
    // Test User table
    console.log('\nTesting User table access...');
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible. Current user count: ${userCount}`);
    
    if (userCount > 0) {
      console.log('\nSample user:');
      const sampleUser = await prisma.user.findFirst({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });
      console.log(sampleUser);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    // Detailed error analysis
    if (error.message.includes('connect ETIMEDOUT')) {
      console.error('\nPossible causes:');
      console.error('- Network connectivity issues');
      console.error('- Firewall blocking the connection');
      console.error('- Wrong database hostname or port');
    } else if (error.message.includes('authentication failed')) {
      console.error('\nPossible causes:');
      console.error('- Wrong database username or password');
      console.error('- User doesn\'t have access to the database');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('\nPossible causes:');
      console.error('- Database name is incorrect');
      console.error('- Database has not been created');
    } else if (error.message.includes('no such function: NOW')) {
      console.error('\nPossible causes:');
      console.error('- Connected to SQLite instead of PostgreSQL');
      console.error('- Check your database URL configuration');
    }
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

// Run the test
testPrismaConnection(); 