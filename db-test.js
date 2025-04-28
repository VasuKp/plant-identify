// A simple script to test connecting to the Supabase PostgreSQL database
const { Client } = require('pg');

// Connection string from .env.local
const connectionString = "postgresql://postgres.roprgzjenvpfckgpwysg:Vasukp@2312@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

// Connection options from the updated .env.local
const client = new Client({
  user: 'postgres.roprgzjenvpfckgpwysg',
  password: 'Vasukp@2312',
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('Attempting to connect to the database...');
    await client.connect();
    console.log('Successfully connected to the database!');
    
    // Test a simple query
    const result = await client.query('SELECT current_timestamp');
    console.log('Database timestamp:', result.rows[0]);
    
    await client.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

testConnection(); 