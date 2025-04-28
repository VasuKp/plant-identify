// Database diagnostics for signup issues
const { Client } = require('pg');

// Connection parameters
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

async function diagnoseSignupIssues() {
  try {
    console.log('Testing database connection...');
    await client.connect();
    console.log('✅ Database connection successful');
    
    // Check User table structure
    console.log('\nChecking User table structure...');
    const userColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'User'
      ORDER BY ordinal_position;
    `);
    
    if (userColumns.rows.length === 0) {
      console.log('❌ Error: User table not found or has no columns!');
    } else {
      console.log('✅ User table exists with the following columns:');
      userColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not nullable'}${col.column_default ? ', default: ' + col.column_default : ''})`);
      });
    }
    
    // Check User table constraints
    console.log('\nChecking User table constraints...');
    const constraints = await client.query(`
      SELECT con.conname as constraint_name, con.contype as constraint_type,
             pg_get_constraintdef(con.oid) as constraint_definition
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE rel.relname = 'User' AND nsp.nspname = 'public';
    `);
    
    if (constraints.rows.length === 0) {
      console.log('⚠️ Warning: No constraints found on User table');
    } else {
      console.log('✅ User table has the following constraints:');
      constraints.rows.forEach(constraint => {
        console.log(`  - ${constraint.constraint_name} (${constraint.constraint_type === 'p' ? 'PRIMARY KEY' : 
                                                        constraint.constraint_type === 'u' ? 'UNIQUE' : 
                                                        constraint.constraint_type === 'f' ? 'FOREIGN KEY' : 
                                                        constraint.constraint_type === 'c' ? 'CHECK' : 
                                                        constraint.constraint_type}): ${constraint.constraint_definition}`);
      });
    }
    
    // Test inserting a test user
    console.log('\nTesting User table insert capability...');
    try {
      // First check if the test user already exists
      const checkUser = await client.query(`
        SELECT COUNT(*) FROM "User" WHERE email = 'test-signup@example.com';
      `);
      
      if (parseInt(checkUser.rows[0].count) > 0) {
        console.log('✅ Test user already exists, skipping insert test');
      } else {
        await client.query(`
          INSERT INTO "User" (email, name, password, role)
          VALUES ('test-signup@example.com', 'Test User', 'test-password-hash', 'USER')
        `);
        console.log('✅ Successfully inserted test user');
        
        // Clean up the test user
        await client.query(`DELETE FROM "User" WHERE email = 'test-signup@example.com'`);
        console.log('✅ Successfully cleaned up test user');
      }
    } catch (insertError) {
      console.log('❌ Error testing user insert: ' + insertError.message);
    }
    
    // Check database connection permissions
    console.log('\nChecking database permissions...');
    try {
      const permissionsResult = await client.query(`
        SELECT grantee, privilege_type 
        FROM information_schema.table_privileges 
        WHERE table_name = 'User' AND table_schema = 'public'
      `);
      
      if (permissionsResult.rows.length === 0) {
        console.log('⚠️ Warning: No explicit permissions found for User table');
      } else {
        console.log('✅ Permissions on User table:');
        permissionsResult.rows.forEach(perm => {
          console.log(`  - ${perm.grantee} has ${perm.privilege_type} permission`);
        });
      }
    } catch (permError) {
      console.log('⚠️ Unable to check permissions: ' + permError.message);
    }
    
    console.log('\nDiagnostics completed. Check the results above for potential issues.');
  } catch (error) {
    console.error('❌ Error diagnosing database:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

diagnoseSignupIssues(); 