## Vercel Environment Variables Setup

To fix the "Network Error" and "process is not defined" issues in production, ensure the following environment variable is set in Vercel:

### For Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variable:

**Variable Name:** `NEXT_PUBLIC_API_URL`  
**Value:** `https://civic-backend-iob6.onrender.com` (or your Render backend URL)  
**Environments:** Select Production, Preview, and Development as needed

### Alternative: Using Vercel CLI

```bash
vercel env add NEXT_PUBLIC_API_URL https://civic-backend-iob6.onrender.com
```

### Redeploy After Setting Env Vars

After setting the environment variable, redeploy your project:

```bash
vercel deploy --prod
```

Or manually redeploy from the Vercel dashboard with cache disabled.

### Testing the Fix

In browser console, you should see:
```
[API Config] Using API URL: https://civic-backend-iob6.onrender.com
```

If you see a warning like:
```
[API Config] NEXT_PUBLIC_API_URL not set, using fallback: https://civic-backend-iob6.onrender.com
```

Then the env var is not set in Vercel, but the fallback is working.

### Troubleshooting

- **"Cannot connect to server" error**: Check that `NEXT_PUBLIC_API_URL` starts with `https://` (not `http://`)
- **CORS errors**: Ensure Django backend CORS_ALLOWED_ORIGINS includes your Vercel domain
- **Verify API working**: Test at `/login` - open browser DevTools Network tab and check the requests
