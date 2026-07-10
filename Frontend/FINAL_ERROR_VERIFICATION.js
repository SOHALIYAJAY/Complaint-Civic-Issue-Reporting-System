// Final Error Verification - Complete login system testing
// This will test the entire login flow and identify any remaining issues

(function() {
  'use strict';
  
  console.log('🔍 FINAL ERROR VERIFICATION STARTED');
  console.log('📋 This tool will test the complete login system');
  
  // Test configuration
  function testConfiguration() {
    console.group('⚙️ CONFIGURATION TEST');
    
    // Test API URL
    const apiUrl = getApiBaseUrl ? getApiBaseUrl() : 'NOT CONFIGURED';
    console.log('API URL:', apiUrl);
    
    // Test environment variables
    console.log('Environment:', process.env.NODE_ENV || 'UNKNOWN');
    
    // Test localStorage state
    console.log('localStorage state:');
    console.log('  Access Token:', localStorage.getItem('access_token') ? '✅' : '❌');
    console.log('  Refresh Token:', localStorage.getItem('refresh_token') ? '✅' : '❌');
    console.log('  User Data:', localStorage.getItem('user') ? '✅' : '❌');
    
    console.groupEnd();
    return apiUrl;
  }
  
  // Test backend connectivity
  async function testBackendConnectivity(apiUrl) {
    console.group('🌐 BACKEND CONNECTIVITY TEST');
    
    try {
      console.log('Testing basic connectivity...');
      const response = await fetch(`${apiUrl}/api/test/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('✅ Basic connectivity:', data);
      
      // Test login endpoint
      console.log('Testing login endpoint...');
      const loginResponse = await fetch(`${apiUrl}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('📝 Login endpoint test:', loginData);
      
      // Test Google login endpoint
      console.log('Testing Google login endpoint...');
      const googleResponse = await fetch(`${apiUrl}/api/google-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          token: 'test-token'
        })
      });
      
      const googleData = await googleResponse.json();
      console.log('🔐 Google login endpoint test:', googleData);
      
      console.groupEnd();
      
      return {
        connectivity: response.ok,
        login: loginResponse,
        google: googleResponse
      };
      
    } catch (error) {
      console.error('❌ Backend connectivity error:', error);
      console.groupEnd();
      return { error: error.message };
    }
  }
  
  // Test actual login flow
  async function testActualLogin(apiUrl) {
    console.group('🔐 ACTUAL LOGIN TEST');
    
    try {
      // Clear any existing data
      localStorage.clear();
      console.log('🗑️ Cleared localStorage');
      
      // Test with dummy credentials (you can replace with real ones)
      console.log('🔄 Testing login flow...');
      
      const loginResponse = await fetch(`${apiUrl}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          email: 'test@example.com',  // Replace with actual email
          password: 'test123'       // Replace with actual password
        }),
        credentials: 'include'
      });
      
      const loginData = await loginResponse.json();
      console.log('📝 Login response:', loginData);
      
      if (loginData.success) {
        console.log('✅ Login successful!');
        console.log('🔑 Tokens received:', {
          access_token: loginData.access_token ? '✅' : '❌',
          refresh_token: loginData.refresh_token ? '✅' : '❌'
        });
        
        // Store tokens
        localStorage.setItem('access_token', loginData.access_token);
        localStorage.setItem('refresh_token', loginData.refresh_token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        
        console.log('💾 Tokens stored in localStorage');
        
        // Test token usage
        console.log('🔄 Testing authenticated request...');
        const testAuthResponse = await fetch(`${apiUrl}/api/userdetails/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${loginData.access_token}`
          }
        });
        
        const authData = await testAuthResponse.json();
        console.log('🔐 Authenticated request test:', authData);
        
      } else {
        console.log('❌ Login failed:', loginData.message);
        console.log('📊 Error details:', {
          success: loginData.success,
          message: loginData.message,
          error_code: loginData.error_code || 'NOT_PROVIDED'
        });
      }
      
    } catch (error) {
      console.error('❌ Login test error:', error);
      console.log('📋 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    console.groupEnd();
  }
  
  // Main verification function
  window.runCompleteVerification = async function() {
    console.log('🚀 STARTING COMPLETE LOGIN SYSTEM VERIFICATION');
    
    // Step 1: Test configuration
    const apiUrl = testConfiguration();
    
    // Step 2: Test backend connectivity
    const connectivity = await testBackendConnectivity(apiUrl);
    
    if (connectivity.error) {
      console.log('❌ BACKEND CONNECTIVITY FAILED');
      console.log('🛠️ SOLUTION: Check backend URL and internet connection');
      console.log('🔗 Current API URL:', apiUrl);
      return;
    }
    
    // Step 3: Test actual login
    await testActualLogin(apiUrl);
    
    console.log('🎯 VERIFICATION COMPLETE');
    console.log('📋 NEXT STEPS:');
    console.log('1. Review all test results above');
    console.log('2. Check for specific error patterns');
    console.log('3. Follow recommended solutions');
    console.log('4. If still failing, share complete console output');
  };
  
  // Auto-start verification
  setTimeout(() => {
    console.log('🔍 FINAL ERROR VERIFICATION TOOL READY');
    console.log('🚀 Run: runCompleteVerification()');
    console.log('📋 This will test the entire login system');
  }, 1000);
  
})();
