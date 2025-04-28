const { Pool } = require('pg');
require('dotenv').config();

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

// Log a redacted version of the URL for debugging
const redactedUrl = databaseUrl ? databaseUrl.replace(/(postgresql:\/\/[^:]+:)([^@]+)(@.+)/, '$1****$3') : 'Not found';
console.log(`Database URL pattern: ${redactedUrl}`);

async function testPgConnection() {
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    return;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false // Required for some cloud PostgreSQL providers like Supabase
    }
  });

  try {
    console.log('🔄 Attempting to connect to PostgreSQL...');
    const client = await pool.connect();
    
    console.log('✅ Connected to PostgreSQL successfully!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as time');
    console.log(`📊 Current database time: ${result.rows[0].time}`);
    
    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tables in the database:');
    if (tablesResult.rows.length === 0) {
      console.log('   No tables found');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:');
    console.error(error.message);
    
    if (error.message.includes('permission denied')) {
      console.error('\n🔐 This appears to be a permission issue. Check your credentials.');
    } else if (error.message.includes('does not exist')) {
      console.error('\n📛 The specified database does not exist.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.error('\n🌐 Could not resolve host. Check if the hostname is correct.');
    } else if (error.message.includes('password authentication failed')) {
      console.error('\n🔑 Incorrect password. Check your credentials.');
    }
  } finally {
    // End the pool
    await pool.end();
  }
}

testPgConnection(); 