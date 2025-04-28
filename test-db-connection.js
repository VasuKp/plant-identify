// Test script for database connection and user tables
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log('Testing connection to Supabase PostgreSQL...');

// Create connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Function to test the connection and set up users tables
async function testAndSetupDatabase() {
  const client = await pool.connect();
  try {
    console.log('Connected to database!');
    
    // Test basic query
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0].now);
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('Creating users table...');
      
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone_number VARCHAR(20),
          role VARCHAR(20) NOT NULL DEFAULT 'USER',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          last_login TIMESTAMP
        )
      `);
      
      console.log('Users table created!');
    } else {
      console.log('Users table already exists!');
      
      // Show count of users
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`There are ${userCount.rows[0].count} users in the database.`);
    }
    
    // Check if user_sessions table exists
    const sessionTableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_sessions'
    `);
    
    if (sessionTableCheck.rows.length === 0) {
      console.log('Creating user_sessions table...');
      
      // Create sessions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(token)
        )
      `);
      
      console.log('User sessions table created!');
    } else {
      console.log('User sessions table already exists!');
    }
    
    // Create a test user if none exist
    const userCountResult = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCountResult.rows[0].count) === 0) {
      console.log('Creating a test user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Test123!', salt);
      
      // Insert test user
      await client.query(`
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
      `, ['Test User', 'test@example.com', hashedPassword, 'USER']);
      
      console.log('Test user created! Email: test@example.com, Password: Test123!');
    }
    
    console.log('Database test completed successfully!');
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
testAndSetupDatabase(); 