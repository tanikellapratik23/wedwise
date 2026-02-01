# Vivaha Deployment Guide

## 🚀 Quick Deploy

### Frontend (GitHub Pages) - FREE
1. Go to your GitHub repo → Settings → Pages
2. Under "Build and deployment":
   - Source: GitHub Actions
3. Push to main branch - auto deploys!
4. Your site will be at: `https://YOUR_USERNAME.github.io/vivaha/`

### Backend (Render) - FREE
1. Go to https://render.com and sign up (free)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: wedwise-api
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js` (or `npm start`)
   - **Add Environment Variable**:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Any random string
     - `PORT`: 3000
     - `CLIENT_URL`: `https://YOUR_USERNAME.github.io`
     - `YELP_API_KEY`: Your Yelp API key

5. Click "Create Web Service"
6. Copy your backend URL (e.g., `https://your-backend.onrender.com`)

### Update Frontend to Use Deployed Backend
After deploying backend to Render, update:

**client/src/components/auth/Login.tsx** and **Register.tsx**:
```typescript
// Change from:
const response = await axios.post('http://localhost:3000/api/auth/login', ...

// To:
const response = await axios.post('https://YOUR-APP.onrender.com/api/auth/login', ...
```

Or better, create **client/.env.production**:
```
VITE_API_URL=https://YOUR-APP.onrender.com
```

And update axios calls to use:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### MongoDB (MongoDB Atlas) - FREE
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to Render environment variables

## Alternative: Deploy Everything on Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Done! (handles both frontend and backend)

## Need Help?
- Frontend not loading? Check the base path in vite.config.ts
- Backend errors? Check Render logs
- Database issues? Verify MongoDB Atlas connection string
