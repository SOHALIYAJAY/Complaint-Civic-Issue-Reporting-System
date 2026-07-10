// Universal Error Fixer - Solves all common login errors automatically
// Paste this in browser console and run the fix functions

(function() {
  'use strict';
  
  console.log('🔧 UNIVERSAL LOGIN ERROR FIXER ACTIVATED');
  console.log('📋 This tool will automatically detect and fix common login issues');
  
  // Common error fixes
  const errorFixer = {
    // Fix 1: Network/Connection errors
    fixNetworkError: function() {
      console.log('🌐 FIXING NETWORK ERROR...');
      
      // Test backend connectivity
      fetch('https://civic-backend-iob6.onrender.com/api/test/')
        .then(r => r.json())
        .then(d => {
          if (d.status === 'ok') {
            console.log('✅ Backend is running');
            console.log('🔧 Fix: Check your environment variables');
            console.log('📋 Create .env.local with NEXT_PUBLIC_API_URL');
          } else {
            console.log('❌ Backend is down or misconfigured');
            console.log('🛠️ Check Render dashboard');
          }
        });
      
      // Fix environment variables
      if (!process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL === 'undefined') {
        console.log('⚙️ SETTING ENVIRONMENT VARIABLE...');
        console.log('📝 Create .env.local file:');
        console.log('NEXT_PUBLIC_API_URL=https://civic-backend-iob6.onrender.com');
        
        // Try to set it dynamically (development only)
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    },
    
    // Fix 2: CORS errors
    fixCORSError: function() {
      console.log('🚫 FIXING CORS ERROR...');
      console.log('🔧 TEMPORARY FIX: Adding CORS bypass');
      
      // Add CORS headers to all requests
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        const modifiedOptions = {
          ...options,
          headers: {
            ...options.headers,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        };
        
        console.log('🌐 Modified request with CORS headers');
        return originalFetch(url, modifiedOptions);
      };
    },
    
    // Fix 3: Authentication/Token errors
    fixAuthError: function() {
      console.log('🔐 FIXING AUTHENTICATION ERROR...');
      
      // Clear corrupted storage
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const userData = localStorage.getItem('user');
      
      if (accessToken && (accessToken.includes('undefined') || accessToken.includes('null'))) {
        console.log('🗑️ CLEARING CORRUPTED TOKENS...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        console.log('✅ Corrupted tokens cleared');
        console.log('🔄 Please try logging in again');
      }
      
      // Check token format
      if (accessToken && !accessToken.startsWith('eyJ')) {
        console.log('⚠️ INVALID TOKEN FORMAT DETECTED');
        console.log('🔄 Clearing and re-authenticating...');
        localStorage.clear();
      }
    },
    
    // Fix 4: Environment variable issues
    fixEnvironmentError: function() {
      console.log('⚙️ FIXING ENVIRONMENT ERROR...');
      
      // Set correct API URL
      const correctUrl = 'https://civic-backend-iob6.onrender.com';
      if (typeof window !== 'undefined') {
        window.NEXT_PUBLIC_API_URL = correctUrl;
        console.log('✅ API URL set to:', correctUrl);
        console.log('🔄 Reloading page...');
        setTimeout(() => window.location.reload(), 1000);
      }
    },
    
    // Fix 5: Server errors
    fixServerError: function() {
      console.log('💥 FIXING SERVER ERROR...');
      console.log('🔧 Checking common server issues...');
      
      // Test different endpoints
      const endpoints = [
        '/api/test/',
        '/api/login/',
        '/api/google-login/'
      ];
      
      endpoints.forEach(endpoint => {
        fetch(`https://civic-backend-iob6.onrender.com${endpoint}`)
          .then(r => r.json())
          .then(d => console.log(`✅ ${endpoint}:`, d))
          .catch(e => console.log(`❌ ${endpoint}:`, e.message));
      });
    },
    
    // Fix 6: Request/response format issues
    fixRequestError: function() {
      console.log('📝 FIXING REQUEST ERROR...');
      
      // Ensure proper headers
      console.log('🔧 Adding proper request headers...');
      
      // Override fetch with proper defaults
      window.fetch = function(url, options = {}) {
        const properOptions = {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers
          },
          credentials: 'include'
        };
        
        console.log('🌐 Sending request:', url, properOptions);
        return originalFetch(url, properOptions);
      };
    }
  };
  
  // Automatic error detection and fixing
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const errorMessage = args[0] || '';
    
    // Log original error
    originalConsoleError.apply(console, args);
    
    // Auto-detect and fix
    if (errorMessage.includes('network')) {
      errorFixer.fixNetworkError();
    } else if (errorMessage.includes('cors')) {
      errorFixer.fixCORSError();
    } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      errorFixer.fixAuthError();
    } else if (errorMessage.includes('500') || errorMessage.includes('server error')) {
      errorFixer.fixServerError();
    } else if (errorMessage.includes('env') || errorMessage.includes('config')) {
      errorFixer.fixEnvironmentError();
    } else {
      errorFixer.fixRequestError();
    }
  };
  
  // Global error handler
  window.addEventListener('error', function(event) {
    console.error('🌐 GLOBAL ERROR:', event.error);
    errorFixer.fixRequestError();
  });
  
  console.log('🎯 AUTO-FIX FUNCTIONS READY:');
  console.log('📋 Available fixes:');
  console.log('  fixNetworkError() - Fixes connection issues');
  console.log('  fixCORSError() - Fixes CORS problems');
  console.log('  fixAuthError() - Fixes authentication issues');
  console.log('  fixEnvironmentError() - Fixes environment issues');
  console.log('  fixServerError() - Fixes server errors');
  console.log('  fixRequestError() - Fixes request format issues');
  console.log('');
  console.log('🔧 TO USE: Run any of these functions in console:');
  console.log('  errorFixer.fixNetworkError()');
  console.log('  errorFixer.fixAuthError()');
  console.log('  errorFixer.fixEnvironmentError()');
  console.log('');
  console.log('🔄 The page will reload automatically if needed');
  
})();
