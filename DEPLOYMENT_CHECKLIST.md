# Production Deployment Checklist

## 🔧 Backend (Render) Environment Variables

### Required Environment Variables:
```bash
SECRET_KEY=CImLYxx7WONidNTm_Heca74PAXEfITogDvGS5TWUUvdGj91HSCfwyWs_jhW92
DEBUG=False
ALLOWED_HOSTS=civic-backend-2.onrender.com
DATABASE_URL=postgresql://username:password@host:port/database
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🌐 Frontend (Vercel) Environment Variables

### Required Environment Variables:
```bash
NEXT_PUBLIC_API_URL=https://civic-backend-2.onrender.com
NEXT_PUBLIC_APP_URL=https://civic-frontend-three.vercel.app
NEXT_PUBLIC_APP_ENV=production
```

## ✅ Pre-Deployment Verification

### Backend Checks:
- [ ] SECRET_KEY is set and unique (not the default)
- [ ] DEBUG=False in production
- [ ] DATABASE_URL points to production PostgreSQL
- [ ] CORS_ALLOWED_ORIGINS includes Vercel domain
- [ ] CSRF_TRUSTED_ORIGINS includes Vercel domain
- [ ] Email configuration is working
- [ ] Cloudinary integration is configured

### Frontend Checks:
- [ ] NEXT_PUBLIC_API_URL points to production backend
- [ ] All API calls use HTTPS
- [ ] Token refresh logic is implemented
- [ ] Error handling is in place
- [ ] Build completes successfully

## 🚀 Deployment Steps

### Backend (Render):
1. Push code changes to GitHub
2. Render auto-deploys from main branch
3. Verify environment variables in Render dashboard
4. Test API endpoints directly

### Frontend (Vercel):
1. Push code changes to GitHub
2. Vercel auto-deploys from main branch
3. Verify environment variables in Vercel dashboard
4. Test authentication flow end-to-end

## 🧪 Post-Deployment Testing

### Authentication Flow:
1. **Login Test**:
   - Login with valid credentials
   - Verify tokens are stored in localStorage
   - Check access token and refresh token are present

2. **Token Refresh Test**:
   - Wait 60+ minutes or manually expire access token
   - Make an API call
   - Verify automatic token refresh occurs
   - User should not be logged out

3. **Logout Test**:
   - Click logout
   - Verify tokens are cleared
   - Verify redirect to login page

4. **Error Handling Test**:
   - Test with invalid credentials
   - Test with expired refresh token
   - Verify proper error messages
   - Verify graceful fallbacks

### Network Tests:
- [ ] CORS headers are correct
- [ ] HTTPS is enforced everywhere
- [ ] API calls succeed from Vercel domain
- [ ] File uploads work correctly

## 🔍 Debugging Commands

### Backend Debugging:
```bash
# Check environment variables
python manage.py shell -c "import os; print('SECRET_KEY:', os.getenv('SECRET_KEY'))"

# Test JWT endpoint
curl -X POST https://civic-backend-2.onrender.com/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "your_refresh_token"}'

# Check CORS headers
curl -I https://civic-backend-2.onrender.com/api/test/
```

### Frontend Debugging:
```javascript
// Check tokens in browser console
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')

// Test API call
fetch('/api/userdetails/', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
  }
}).then(r => r.json()).then(console.log)

// Monitor network tab for 401 → refresh → 200 pattern
```

## ⚠️ Common Issues & Solutions

### Issue: "Token is invalid for any token type"
**Cause**: SECRET_KEY changed between token generation and validation
**Solution**: Ensure SECRET_KEY is constant across deployments

### Issue: CORS errors
**Cause**: Frontend domain not in CORS_ALLOWED_ORIGINS
**Solution**: Add Vercel domain to Django CORS settings

### Issue: "Network Error"
**Cause**: API URL incorrect or blocked by CORS
**Solution**: Verify NEXT_PUBLIC_API_URL and CORS configuration

### Issue: Infinite refresh loops
**Cause**: Refresh token invalid or expired
**Solution**: Clear tokens and redirect to login

## 📊 Monitoring

### Set up monitoring for:
- Failed token refresh attempts
- 401 error rates
- CORS errors
- API response times
- Authentication success/failure rates

### Recommended tools:
- Render logs for backend
- Vercel Analytics for frontend
- Custom error tracking (Sentry)
- Uptime monitoring

## 🔄 Rollback Plan

### If deployment fails:
1. **Backend**: Rollback to previous commit on Render
2. **Frontend**: Rollback to previous deployment on Vercel
3. **Database**: No changes needed (schema unchanged)
4. **Tokens**: Users may need to re-login after rollback

## 📞 Emergency Contacts

- Backend monitoring: Render dashboard
- Frontend monitoring: Vercel dashboard
- Error tracking: Sentry (if configured)
- Performance: Vercel Analytics
