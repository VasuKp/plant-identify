// Script to ensure all environment files have the correct database URL
const fs = require('fs');
const path = require('path');

// The correct database URL
const correctDbUrl = 'postgresql://postgres.roprgzjenvpfckgpwysg:Vasukp@2312@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

// Files to update
const envFiles = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.development.local'
];

// Process each file
envFiles.forEach(filename => {
  const filePath = path.join(process.cwd(), filename);
  
  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.log(`Creating ${filename} with correct database URL...`);
      fs.writeFileSync(filePath, `DATABASE_URL="${correctDbUrl}"\n`);
      console.log(`✅ Created ${filename}`);
      return;
    }
    
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if DATABASE_URL is already set
    if (content.includes('DATABASE_URL=') || content.includes('DATABASE_URL="')) {
      // Replace the existing DATABASE_URL
      content = content.replace(
        /DATABASE_URL=["'].*["']|DATABASE_URL=.*/g, 
        `DATABASE_URL="${correctDbUrl}"`
      );
      console.log(`Updating ${filename} with correct database URL...`);
    } else {
      // Add the DATABASE_URL if it doesn't exist
      content += `\n# Database connection\nDATABASE_URL="${correctDbUrl}"\n`;
      console.log(`Adding database URL to ${filename}...`);
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filename}`);
    
  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
  }
});

console.log('\nEnvironment files updated. Make sure to restart your Next.js application for changes to take effect.'); 