// Database viewer script using pg library
const { Client } = require('pg');

// Connection parameters from .env file
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

// Function to view database tables and data
async function viewDatabase() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database.');
    
    // Get list of all tables
    console.log('\n=== DATABASE TABLES ===');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('Tables found:', tables.join(', '));
    
    // View data from each table
    for (const table of tables) {
      console.log(`\n=== TABLE: "${table}" ===`);
      
      // Get column information
      const columnsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);
      
      console.log('Columns:');
      columnsResult.rows.forEach(col => {
        console.log(`  ${col.column_name} (${col.data_type})`);
      });
      
      // Count rows
      const countResult = await client.query(`SELECT COUNT(*) FROM "${table}"`);
      const rowCount = parseInt(countResult.rows[0].count);
      console.log(`\nTotal rows: ${rowCount}`);
      
      // Get sample data (limit to 5 rows)
      if (rowCount > 0) {
        console.log('\nSample data:');
        const dataResult = await client.query(`SELECT * FROM "${table}" LIMIT 5`);
        dataResult.rows.forEach((row, idx) => {
          console.log(`Row ${idx + 1}:`, JSON.stringify(row, null, 2));
        });
      } else {
        console.log('No data in this table.');
      }
      
      console.log('-'.repeat(50));
    }
    
    console.log('\nDatabase inspection completed.');
    
  } catch (error) {
    console.error('Error viewing database:', error);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

// Run the function
viewDatabase(); 