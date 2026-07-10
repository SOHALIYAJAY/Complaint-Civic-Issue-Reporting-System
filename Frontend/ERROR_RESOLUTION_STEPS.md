# 🔐 CONSOLE ERROR RESOLUTION - STEP BY STEP

## **📋 STEP 1: CAPTURE THE EXACT ERROR**

### **Instructions:**
1. Open your login page in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Attempt login with your credentials
5. **Copy the EXACT error message** that appears

### **Common Error Patterns & Immediate Fixes:**

---

## **🔴 ERROR TYPE: "Network error"**
### **Symptoms:**
```
Cannot connect to server
Network error: no response received
Connection refused
Server not found
```

### **Immediate Fix:**
```javascript
// 1. Check if backend is running
fetch('https://civic-backend-iob6.onrender.com/api/test/')
  .then(r => r.json())
  .then(d => console.log('Backend status:', d))

// 2. If backend is down, check Render dashboard
// Go to: https://dashboard.render.com/web/services

// 3. Fix environment variable
// Create .env.local with:
NEXT_PUBLIC_API_URL=https://civic-backend-iob6.onrender.com
```

---

## **🔴 ERROR TYPE: "CORS policy violation"**
### **Symptoms:**
```
Access to fetch at 'https://civic-backend-iob6.onrender.com/api/login/' from origin 'https://your-frontend.vercel.app' has been blocked by CORS policy
```

### **Immediate Fix:**
```python
# Add to backend settings.py:
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-three.vercel.app",  # EXACT match
    "http://localhost:3000",
]
```

---

## **🔴 ERROR TYPE: "401 Unauthorized"**
### **Symptoms:**
```
401 Unauthorized
Invalid credentials
Token expired
```

### **Immediate Fix:**
```javascript
// 1. Clear localStorage
localStorage.clear();

// 2. Check user exists in backend
// Verify email/password combination

// 3. Check JWT settings
// Ensure tokens are generated correctly
```

---

## **🔴 ERROR TYPE: "500 Internal Server Error"**
### **Symptoms:**
```
500 Internal Server Error
Google login not configured
name 'os' is not defined
```

### **Immediate Fix:**
```python
# 1. Check environment variables
# In Render Dashboard → Environment:
GOOGLE_CLIENT_ID=your-google-client-id
SECRET_KEY=your-django-secret-key

# 2. Check imports
# Ensure 'import os' is at top of views.py

# 3. Check Django logs
# In Render: Logs → View error details
```

---

## **🔴 ERROR TYPE: "Token-related issues"**
### **Symptoms:**
```
Token not stored
Invalid token format
Authorization header missing
```

### **Immediate Fix:**
```javascript
// 1. Check token storage
console.log('Access Token:', localStorage.getItem('access_token'));
console.log('Refresh Token:', localStorage.getItem('refresh_token'));

// 2. Clear corrupted data
if (token && token.includes('undefined')) {
  localStorage.clear();
  location.reload();
}

// 3. Re-authenticate
window.location.href = '/login';
```

---

## **🛠️ ADVANCED DEBUGGING**

### **Step 1: Use Error Debugger**
1. Open `CONSOLE_ERROR_DEBUGGER.js` in browser console
2. Attempt login
3. Review the automated analysis
4. Follow the suggested solution

### **Step 2: Test API Directly**
```bash
# Test login endpoint:
curl -X POST https://civic-backend-iob6.onrender.com/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test Google login endpoint:
curl -X POST https://civic-backend-iob6.onrender.com/api/google-login/ \
  -H "Content-Type: application/json" \
  -d '{"token":"test-token"}'
```

### **Step 3: Check Environment**
```javascript
// In browser console:
console.log('API URL:', getApiBaseUrl());
console.log('Environment:', process.env.NODE_ENV);

// Expected:
// API URL: https://civic-backend-iob6.onrender.com
// Environment: production
```

### **Step 4: Verify Backend Status**
1. Go to Render Dashboard
2. Check service status
3. View deployment logs
4. Verify environment variables

---

## **🎯 QUICK FIXES TO TRY**

### **Fix 1: Environment Variables**
```bash
# Frontend .env.local
NEXT_PUBLIC_API_URL=https://civic-backend-iob6.onrender.com

# Backend Render Environment
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-secret
SECRET_KEY=your-actual-secret-key
```

### **Fix 2: Clear Browser Data**
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **Fix 3: Check CORS Origins**
```python
# Backend settings.py - EXACT match required:
CORS_ALLOWED_ORIGINS = [
    "https://civic-frontend-three.vercel.app",  # Must match exactly
]
```

---

## **📞 ESCALATION PATH**

If none of the above fixes work:

1. **Provide the exact error message** from console
2. **Share browser console screenshot** showing the error
3. **Include network tab details** showing the failed request
4. **Specify which step** you tried and what happened

---

## **🔍 DEBUGGING CHECKLIST**

- [ ] Backend is running and accessible
- [ ] Frontend environment variables set correctly
- [ ] CORS origins match exactly
- [ ] JWT tokens are generated and stored
- [ ] Database migrations applied
- [ ] SSL certificates are valid

**Follow this systematic approach to identify and resolve the exact login error!**
