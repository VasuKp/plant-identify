// Test script for signup API
const fetch = require('node-fetch');

// Test user data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`, // Unique email
  password: 'StrongP@ssw0rd123!',
  phoneNumber: '1234567890',
  address: 'Test Address',
  bio: 'Test Bio'
};

async function testSignup() {
  console.log('Testing signup API...');
  console.log('Test user:', { ...testUser, password: '********' });
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    console.log('\nAPI Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Signup test successful!');
    } else {
      console.log('\n❌ Signup test failed.');
    }
  } catch (error) {
    console.error('\n❌ Error testing signup API:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Make sure your Next.js server is running on http://localhost:3000');
    }
  }
}

// Run the test
testSignup(); 