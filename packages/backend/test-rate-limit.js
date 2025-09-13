/**
 * Script untuk testing rate limiting
 * Mengirim request berulang untuk memicu error 429
 */

const http = require('http');

// Konfigurasi test
const HOST = 'localhost';
const PORT = 3000;
const ENDPOINT = '/health';
const MAX_REQUESTS = 60; // Lebih dari limit development (50)
const DELAY_MS = 0; // Tanpa delay untuk test cepat

let successCount = 0;
let rateLimitCount = 0;
let errorCount = 0;

console.log(`Testing rate limiting: ${MAX_REQUESTS} requests to ${HOST}:${PORT}${ENDPOINT}`);
console.log('Expected: First ~100 requests should succeed, then 429 errors');
console.log('---');

function makeRequest(requestNumber) {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: ENDPOINT,
      method: 'GET',
      headers: {
        'User-Agent': 'Rate-Limit-Test/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const status = res.statusCode;
        const headers = res.headers;
        
        if (status === 200) {
          successCount++;
        } else if (status === 429) {
          rateLimitCount++;
          console.log(`Request ${requestNumber}: RATE LIMITED (429)`);
          if (rateLimitCount === 1) {
            console.log('Rate limit headers:', {
              'x-ratelimit-limit': headers['x-ratelimit-limit'],
              'x-ratelimit-remaining': headers['x-ratelimit-remaining'],
              'x-ratelimit-reset': headers['x-ratelimit-reset'],
              'retry-after': headers['retry-after']
            });
          }
        } else {
          errorCount++;
          console.log(`Request ${requestNumber}: ERROR (${status})`);
        }
        
        resolve({ requestNumber, status, headers });
      });
    });
    
    req.on('error', (err) => {
      errorCount++;
      console.log(`Request ${requestNumber}: NETWORK ERROR - ${err.message}`);
      resolve({ requestNumber, status: 'ERROR', error: err.message });
    });
    
    req.end();
  });
}

async function runTest() {
  const startTime = Date.now();
  
  for (let i = 1; i <= MAX_REQUESTS; i++) {
    await makeRequest(i);
    
    // Progress indicator
    if (i % 25 === 0) {
      console.log(`Progress: ${i}/${MAX_REQUESTS} requests completed`);
    }
    
    // Small delay to avoid overwhelming
    if (DELAY_MS > 0) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n=== TEST RESULTS ===');
  console.log(`Total requests: ${MAX_REQUESTS}`);
  console.log(`Successful (200): ${successCount}`);
  console.log(`Rate limited (429): ${rateLimitCount}`);
  console.log(`Other errors: ${errorCount}`);
  console.log(`Duration: ${duration.toFixed(2)} seconds`);
  console.log(`Rate: ${(MAX_REQUESTS / duration).toFixed(2)} req/sec`);
  
  if (rateLimitCount > 0) {
    console.log('\n✅ Rate limiting is WORKING!');
    console.log(`Rate limit triggered after ${successCount} requests`);
  } else {
    console.log('\n❌ Rate limiting NOT working or limit too high');
    console.log('All requests succeeded - check configuration');
  }
}

// Jalankan test
runTest().catch(console.error);