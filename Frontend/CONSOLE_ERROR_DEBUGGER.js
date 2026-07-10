// Console Error Debugger - Capture and analyze login errors
// Paste this in browser console to debug login issues

(function() {
  'use strict';
  
  // Enhanced console logging to capture all errors
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  };
  
  // Error storage for analysis
  const errorLog = [];
  
  // Enhanced error function
  console.error = function(...args) {
    originalConsole.error.apply(console, args);
    
    // Store error details
    const errorObj = {
      timestamp: new Date().toISOString(),
      message: args[0],
      stack: args[1] || '',
      url: window.location.href,
      userAgent: navigator.userAgent,
      localStorage: {
        accessToken: localStorage.getItem('access_token'),
        refreshToken: localStorage.getItem('refresh_token'),
        user: localStorage.getItem('user')
      }
    };
    
    errorLog.push(errorObj);
    
    // Analyze and suggest fixes
    analyzeError(errorObj);
  };
  
  // Enhanced warning function
  console.warn = function(...args) {
    originalConsole.warn.apply(console, args);
  };
  
  // Enhanced log function
  console.log = function(...args) {
    originalConsole.log.apply(console, args);
  };
  
  // Error analysis function
  function analyzeError(error) {
    const message = error.message.toLowerCase();
    
    console.group('🔍 LOGIN ERROR ANALYSIS');
    console.log('Error Message:', error.message);
    console.log('Timestamp:', error.timestamp);
    console.log('URL:', error.url);
    
    // Common error patterns and solutions
    const errorPatterns = [
      {
        pattern: /network error/i,
        message: 'Network connection failed',
        solution: 'Check backend URL and internet connection'
      },
      {
        pattern: /cors/i,
        message: 'CORS policy violation',
        solution: 'Check CORS settings in backend'
      },
      {
        pattern: /401/i,
        message: 'Authentication failed',
        solution: 'Check credentials and token format'
      },
      {
        pattern: /403/i,
        message: 'Access forbidden',
        solution: 'Check user permissions and API keys'
      },
      {
        pattern: /404/i,
        message: 'Endpoint not found',
        solution: 'Check API URL and routing'
      },
      {
        pattern: /500/i,
        message: 'Server error',
        solution: 'Check backend logs and configuration'
      },
      {
        pattern: /cannot connect/i,
        message: 'Connection failed',
        solution: 'Verify backend is running and accessible'
      },
      {
        pattern: /token/i,
        message: 'Token-related issue',
        solution: 'Clear localStorage and re-authenticate'
      }
    ];
    
    let matchedPattern = null;
    for (const pattern of errorPatterns) {
      if (pattern.pattern.test(message)) {
        matchedPattern = pattern;
        break;
      }
    }
    
    if (matchedPattern) {
      console.log('🔍 DETECTED PATTERN:', matchedPattern.message);
      console.log('💡 SUGGESTED SOLUTION:', matchedPattern.solution);
      
      // Show immediate fix
      console.log('🛠️ QUICK FIX:', matchedPattern.solution);
      
      // Check localStorage state
      if (message.includes('token') || message.includes('auth')) {
        console.log('🔑 TOKEN STATE CHECK:');
        console.log('  Access Token:', localStorage.getItem('access_token') ? '✅ Present' : '❌ Missing');
        console.log('  Refresh Token:', localStorage.getItem('refresh_token') ? '✅ Present' : '❌ Missing');
        console.log('  User Data:', localStorage.getItem('user') ? '✅ Present' : '❌ Missing');
      }
    } else {
      console.log('❓ UNKNOWN ERROR PATTERN - Manual analysis required');
      console.log('📋 FULL ERROR DETAILS:', error);
    }
    
    console.groupEnd();
    
    // Show error summary
    console.log('📊 ERROR SUMMARY:');
    console.log(`  Total Errors: ${errorLog.length}`);
    console.log('  Recent Error:', errorLog[errorLog.length - 1]);
    
    // Export for manual inspection
    window.loginErrorLog = errorLog;
    window.analyzeLoginError = analyzeError;
  };
  
  // Network request interceptor
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [url, options] = args;
    
    console.log('🌐 FETCH REQUEST:', {
      url: url,
      method: options.method,
      headers: options.headers,
      body: options.body
    });
    
    return originalFetch.apply(this, args).then(response => {
      console.log('📥 FETCH RESPONSE:', {
        url: url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      return response;
    }).catch(error => {
      console.error('📥 FETCH ERROR:', {
        url: url,
        message: error.message,
        stack: error.stack
      });
      
      return Promise.reject(error);
    });
  };
  
  // Auto-start error monitoring
  console.log('🔍 LOGIN ERROR DEBUGGER ACTIVE');
  console.log('📋 Instructions:');
  console.log('1. Attempt login normally');
  console.log('2. Check console for analysis');
  console.log('3. Review error patterns and solutions');
  console.log('4. Check localStorage state: window.loginErrorLog');
  
  // Test API connectivity
  setTimeout(() => {
    console.log('🧪 TESTING API CONNECTIVITY...');
    fetch('https://civic-backend-iob6.onrender.com/api/test/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(r => r.json())
    .then(d => console.log('✅ API CONNECTIVITY TEST:', d))
    .catch(e => console.log('❌ API CONNECTIVITY ERROR:', e));
  }, 2000);
  
})();
