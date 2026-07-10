// Login Debug Helper - Test API endpoints directly

const API_BASE_URL = 'https://civic-backend-iob6.onrender.com';

// Test regular login
async function testRegularLogin() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRFToken': 'test-csrf-token',
      'Origin': window.location.origin
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      }),
      credentials: 'include'
    });

    const data = await response.json();
    console.log('Regular Login Test Response:', data);
    return data;
  } catch (error) {
    console.error('Regular Login Test Error:', error);
    return { error: error.message };
  }
}

// Test Google login
async function testGoogleLogin() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/google-login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': 'test-csrf-token',
        'Origin': window.location.origin
      },
      body: JSON.stringify({
        token: 'test-google-token'
      }),
      credentials: 'include'
    });

    const data = await response.json();
    console.log('Google Login Test Response:', data);
    return data;
  } catch (error) {
    console.error('Google Login Test Error:', error);
    return { error: error.message };
  }
}

// Test CORS preflight
async function testCORS() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login/`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });

    console.log('CORS Options Response:', response.status, response.headers);
    return response;
  } catch (error) {
    console.error('CORS Test Error:', error);
    return { error: error.message };
  }
}

// Run all tests
async function runTests() {
  console.log('=== API Login Debug Tests ===');
  console.log('API Base URL:', API_BASE_URL);
  
  console.log('\n1. Testing CORS preflight...');
  await testCORS();
  
  console.log('\n2. Testing regular login...');
  await testRegularLogin();
  
  console.log('\n3. Testing Google login...');
  await testGoogleLogin();
  
  console.log('\n=== Tests Complete ===');
}

// Auto-run tests
runTests();

// Export for manual testing
window.testLoginAPI = testRegularLogin;
window.testGoogleLoginAPI = testGoogleLogin;
window.testCORS = testCORS;
