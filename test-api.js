// Test the /api/test endpoint
const http = require('http');

console.log('Testing API route...');

// Create the request options
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/test',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

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
        console.log('\n✅ API test successful!');
      } else {
        console.log('\n❌ API test failed.');
      }
    } catch (e) {
      console.error('\nError parsing response:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Error testing API:', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    console.error('\nMake sure your Next.js server is running on http://localhost:3000');
  }
});

req.end(); 