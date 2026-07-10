# 🔐 LOGIN ERROR TROUBLESHOOTING GUIDE

## **🔍 COMMON LOGIN ISSUES & SOLUTIONS**

---

## **1. CORS/NETWORK ERRORS**

### **Symptoms:**
- "Network error: no response"
- "CORS policy: No 'Access-Control-Allow-Origin'"
- "Failed to fetch" in console

### **Solutions:**

#### **Check Backend CORS Settings:**
```python
# Backend settings.py should have:
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.vercel.app",
    "http://localhost:3000",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'x-csrftoken',
    'x-requested-with',
]
```

#### **Frontend Headers:**
```javascript
// Ensure these headers are sent
headers: {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
}
```

---

## **2. JWT TOKEN ISSUES**

### **Symptoms:**
- 401 Unauthorized immediately after login
- Token not stored in localStorage
- Automatic logout on refresh

### **Solutions:**

#### **Check Token Storage:**
```javascript
// After successful login, check browser console:
console.log('Access Token:', localStorage.getItem('access_token'));
console.log('Refresh Token:', localStorage.getItem('refresh_token'));
console.log('User Data:', localStorage.getItem('user'));
```

#### **Check Token Format:**
```javascript
// Tokens should be JWT format
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIx...
```

---

## **3. BACKEND CONNECTION ISSUES**

### **Symptoms:**
- "Cannot connect to server"
- "Connection refused"
- "Server not found"

### **Solutions:**

#### **Verify Backend URL:**
```javascript
// Check API URL in browser console:
console.log('API URL:', getApiBaseUrl());
// Should be: https://civic-backend-iob6.onrender.com
```

#### **Test Backend Directly:**
```bash
# Test if backend is running:
curl -X POST https://civic-backend-iob6.onrender.com/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}'
```

---

## **4. ENVIRONMENT VARIABLE ISSUES**

### **Symptoms:**
- "Google login not configured" error
- Environment variables not loaded

### **Solutions:**

#### **Check Frontend Environment:**
```javascript
// Add to .env.local:
NEXT_PUBLIC_API_URL=https://civic-backend-iob6.onrender.com
```

#### **Check Backend Environment:**
```bash
# Render Dashboard → Environment Variables:
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
SECRET_KEY=your-django-secret-key
DEBUG=False
```

---

## **🧪 DEBUGGING STEPS**

### **Step 1: Clear Browser Data**
1. Open Developer Tools (F12)
2. Go to Application → Local Storage
3. Clear: `access_token`, `refresh_token`, `user`

### **Step 2: Test API Directly**
1. Open browser console
2. Paste and run:
```javascript
fetch('https://civic-backend-iob6.onrender.com/api/login/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'test@test.com', password: 'test123'})
})
.then(r => r.json())
.then(d => console.log('Direct API Test:', d))
```

### **Step 3: Check Network Tab**
1. Open Developer Tools → Network
2. Attempt login
3. Check the actual request being sent
4. Verify headers and response

### **Step 4: Use Debug Helper**
1. Open `LOGIN_DEBUG_HELPER.js` in browser
2. Check console output for all tests
3. Identify specific error patterns

---

## **🚀 QUICK FIXES**

### **Fix 1: Update Environment Variables**
```bash
# Frontend .env.local
NEXT_PUBLIC_API_URL=https://civic-backend-iob6.onrender.com

# Backend Render Environment
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-secret
```

### **Fix 2: Clear Browser Cache**
```bash
# Clear all data and retry
localStorage.clear();
sessionStorage.clear();
```

### **Fix 3: Check Backend Status**
```bash
# Verify backend is running
curl -I https://civic-backend-iob6.onrender.com/api/test/
```

---

## **📞 ERROR PATTERNS**

| Error | Cause | Solution |
|--------|--------|----------|
| "Network error" | Backend down/wrong URL | Check backend status |
| "401 Unauthorized" | Invalid credentials | Verify user exists |
| "CORS error" | Origin not allowed | Update CORS settings |
| "500 Internal" | Backend error | Check backend logs |

---

## **🔧 PRODUCTION DEPLOYMENT CHECKLIST**

- [ ] Backend deployed on Render with correct env vars
- [ ] Frontend deployed on Vercel with correct env vars
- [ ] CORS origins match exactly
- [ ] Database migrations applied
- [ ] SSL certificates valid
- [ ] JWT settings configured

---

## **🎯 NEXT STEPS**

1. **Test API directly** using curl or Postman
2. **Check browser console** for specific errors
3. **Verify environment variables** on both frontend and backend
4. **Clear browser data** and retry login
5. **Check Render logs** for backend errors

**Follow these steps systematically to identify and fix the exact login issue!**
