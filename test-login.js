// Test admin login
const http = require('http');

// Admin credentials
const adminCredentials = {
  email: "admin",
  password: "admin123"
};

console.log('Testing admin login API...');

// Create the request options
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

// Convert data to JSON string
const postData = JSON.stringify(adminCredentials);

// Send the request
const req = http.request(options, (res) => {
  console.log('\nStatus Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nRaw response:', data);
    try {
      const parsedData = JSON.parse(data);
      console.log('\nParsed response:', JSON.stringify(parsedData, null, 2));
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('\n✅ Admin login test successful!');
        if (parsedData.data && parsedData.data.token) {
          console.log('\nAuth token received. Save this for API testing:');
          console.log(parsedData.data.token);
        }
      } else {
        console.log('\n❌ Admin login test failed.');
      }
    } catch (e) {
      console.error('\nError parsing response:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Error testing login API:', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    console.error('\nMake sure your Next.js server is running on http://localhost:3000');
  }
});

// Write the request body
req.write(postData);
console.log(`\nRequest sent to ${options.hostname}:${options.port}${options.path} with body length ${postData.length} bytes`);
req.end(); 