// Error Analysis Tool - Comprehensive login error diagnosis
// Paste this in browser console after seeing the error

(function() {
  'use strict';
  
  console.log('🔍 LOGIN ERROR ANALYSIS TOOL ACTIVATED');
  console.log('📋 PURPOSE: Analyze console errors and provide precise fixes');
  
  // Error classification system
  const errorCategories = {
    NETWORK: {
      patterns: [/network error/i, /cannot connect/i, /connection refused/i, /server not found/i, /enotfound/i, /econnrefused/i],
      color: '#ff4444',
      icon: '🌐',
      fixes: [
        'Check backend URL and internet connection',
        'Verify backend is running on Render',
        'Test API connectivity manually',
        'Check CORS configuration'
      ]
    },
    CORS: {
      patterns: [/cors/i, /blocked by cors policy/i, /access-control-allow-origin/i],
      color: '#ff8800',
      icon: '🚫',
      fixes: [
        'Add frontend URL to CORS_ALLOWED_ORIGINS',
        'Check exact domain match',
        'Verify CORS_ALLOW_CREDENTIALS = True',
        'Check preflight requests'
      ]
    },
    AUTHENTICATION: {
      patterns: [/401/i, /unauthorized/i, /invalid credentials/i, /authentication failed/i],
      color: '#ff6b6b',
      icon: '🔐',
      fixes: [
        'Verify user exists in database',
        'Check email/password combination',
        'Clear localStorage and retry',
        'Check JWT token generation',
        'Verify token storage format'
      ]
    },
    PERMISSION: {
      patterns: [/403/i, /forbidden/i, /access denied/i],
      color: '#ff9800',
      icon: '🚫',
      fixes: [
        'Check user role and permissions',
        'Verify API endpoint access',
        'Check authentication middleware',
        'Review user authorization'
      ]
    },
    NOT_FOUND: {
      patterns: [/404/i, /not found/i, /does not exist/i],
      color: '#ff9f00',
      icon: '🔍',
      fixes: [
        'Check API endpoint URL',
        'Verify URL routing configuration',
        'Check view name in urls.py',
        'Verify request method'
      ]
    },
    SERVER_ERROR: {
      patterns: [/500/i, /internal server error/i, /server error/i],
      color: '#dc2626',
      icon: '💥',
      fixes: [
        'Check Django settings configuration',
        'Verify environment variables',
        'Check database connection',
        'Review recent code changes',
        'Check Django error logs'
      ]
    },
    TOKEN: {
      patterns: [/token/i, /jwt/i, /authorization/i],
      color: '#8b5cf6',
      icon: '🔑',
      fixes: [
        'Clear localStorage completely',
        'Check token format and expiration',
        'Verify JWT settings',
        'Check token refresh mechanism',
        'Re-authenticate and get new tokens'
      ]
    },
    ENVIRONMENT: {
      patterns: [/env/i, /environment/i, /config/i, /not found/i],
      color: '#03a9f4',
      icon: '⚙️',
      fixes: [
        'Create .env.local file',
        'Set NEXT_PUBLIC_API_URL',
        'Verify backend environment variables',
        'Check Render dashboard configuration',
        'Restart development server'
      ]
    }
  };
  
  // Enhanced error analysis function
  window.analyzeError = function(errorMessage, errorStack = '') {
    console.group('🔍 DETAILED ERROR ANALYSIS');
    console.log('Error Message:', errorMessage);
    console.log('Stack Trace:', errorStack);
    console.log('URL:', window.location.href);
    console.log('User Agent:', navigator.userAgent);
    
    // Classify the error
    let category = null;
    let suggestions = [];
    
    for (const [catName, catData] of Object.entries(errorCategories)) {
      for (const pattern of catData.patterns) {
        if (pattern.test(errorMessage.toLowerCase())) {
          category = catName;
          suggestions = catData.fixes;
          console.log(`%c📊 CATEGORY IDENTIFIED: ${catName}`, `color: ${catData.color}`);
          console.log(`%c🔍 PATTERNS MATCHED: ${pattern}`, `color: ${catData.color}`);
          break;
        }
      }
    }
    
    if (category) {
      console.log(`%c💡 SUGGESTED FIXES:`, `color: ${errorCategories[category].color}`);
      suggestions.forEach((fix, index) => {
        console.log(`%c  ${index + 1}. ${fix}`, `color: ${errorCategories[category].color}`);
      });
      
      // Provide immediate action steps
      console.log(`%c🛠️ IMMEDIATE ACTIONS:`, `color: ${errorCategories[category].color}`);
      
      // Category-specific immediate fixes
      switch (category) {
        case 'NETWORK':
          console.log('%c  1. Test backend connectivity:', 'color: #ff4444');
          console.log('%c     fetch("https://civic-backend-iob6.onrender.com/api/test/")', 'color: #ff4444');
          console.log('%c  2. Check Render dashboard status', 'color: #ff4444');
          console.log('%c  3. Verify environment variables', 'color: #ff4444');
          break;
          
        case 'CORS':
          console.log('%c  1. Check CORS_ALLOWED_ORIGINS in backend', 'color: #ff8800');
          console.log('%c  2. Verify exact domain match', 'color: #ff8800');
          console.log('%c  3. Check CORS_ALLOW_CREDENTIALS', 'color: #ff8800');
          break;
          
        case 'AUTHENTICATION':
          console.log('%c  1. Clear localStorage:', 'color: #ff6b6b');
          console.log('%c     localStorage.clear()', 'color: #ff6b6b');
          console.log('%c  2. Re-enter credentials:', 'color: #ff6b6b');
          console.log('%c  3. Check user exists in backend', 'color: #ff6b6b');
          break;
          
        case 'TOKEN':
          console.log('%c  1. Clear all storage:', 'color: #8b5cf6');
          console.log('%c     localStorage.clear(); sessionStorage.clear();', 'color: #8b5cf6');
          console.log('%c  2. Re-authenticate:', 'color: #8b5cf6');
          console.log('%c     window.location.href = "/login"', 'color: #8b5cf6');
          break;
          
        case 'ENVIRONMENT':
          console.log('%c  1. Create .env.local:', 'color: #03a9f4');
          console.log('%c     NEXT_PUBLIC_API_URL=https://civic-backend-iob6.onrender.com', 'color: #03a9f4');
          console.log('%c  2. Restart development server:', 'color: #03a9f4');
          break;
      }
    } else {
      console.log('%c❓ UNKNOWN ERROR PATTERN', 'color: #dc2626');
      console.log('%c📋 Manual analysis required', 'color: #dc2626');
      console.log('%c🔍 Check common issues:', 'color: #dc2626');
      console.log('%c  - Network connectivity', 'color: #dc2626');
      console.log('%c  - CORS configuration', 'color: #dc2626');
      console.log('%c  - Authentication tokens', 'color: #dc2626');
      console.log('%c  - Environment variables', 'color: #dc2626');
    }
    
    console.groupEnd();
    
    // Environment check
    console.log('%c⚙️ ENVIRONMENT CHECK:', 'color: #03a9f4');
    console.log('%c  API URL:', getApiBaseUrl ? getApiBaseUrl() : 'NOT CONFIGURED', 'color: #03a9f4');
    console.log('%c  Environment:', process.env.NODE_ENV || 'UNKNOWN', 'color: #03a9f4');
    
    // Token check
    console.log('%c🔑 TOKEN STATE:', 'color: #8b5cf6');
    console.log('%c  Access Token:', localStorage.getItem('access_token') ? '✅' : '❌', 'color: #8b5cf6');
    console.log('%c  Refresh Token:', localStorage.getItem('refresh_token') ? '✅' : '❌', 'color: #8b5cf6');
    console.log('%c  User Data:', localStorage.getItem('user') ? '✅' : '❌', 'color: #8b5cf6');
    
    console.log('📞 COPY THIS ANALYSIS AND SHARE FOR PRECISE SOLUTION');
    
    return {
      category,
      suggestions,
      immediateActions: suggestions.slice(0, 3)
    };
  };
  
  // Auto-start analysis on page load
  setTimeout(() => {
    console.log('🔍 ERROR ANALYSIS TOOL READY');
    console.log('📋 If you see an error, run: analyzeError("YOUR_ERROR_MESSAGE")');
    console.log('📋 Or call: window.analyzeError("YOUR_ERROR_MESSAGE")');
  }, 1000);
  
})();
