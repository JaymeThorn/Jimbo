# ExerciseDB API Setup Guide

## Quick Setup (5 minutes)

### 1. Get Free API Key

1. Go to: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
2. Click "Sign Up" (free account)
3. Click "Subscribe to Test" 
4. Select **Basic Plan (FREE)**
   - 100 requests/day
   - 1300+ exercises with GIFs
5. Copy your API key from the dashboard

### 2. Add to Your App

Edit `frontend/.env`:
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_EXERCISEDB_KEY=your_actual_api_key_here
```

### 3. Restart Frontend

```bash
cd frontend
npm start
```

That's it! Exercise images will now load automatically.

## How It Works

### Smart Fallback System

1. **On page load:** Fetches all 1300+ exercises from ExerciseDB
2. **Maps exercises:** Matches our exercise names to API data
3. **Caches images:** Stores GIF URLs in memory
4. **Displays images:** Shows animated GIFs in exercise picker

### Automatic Fallback

If API fails (no key, rate limit, network error):
- ✅ Automatically uses emoji icons
- ✅ No error messages to user
- ✅ App works perfectly
- ✅ Console logs reason for fallback

### Error Handling

```javascript
// API key not configured
if (!apiKey) → Use emojis

// Rate limit exceeded (>100 requests/day)
if (response.status === 429) → Use emojis

// Network error
if (fetch fails) → Use emojis

// Image fails to load
if (img.onerror) → Show emoji for that exercise
```

## What You Get

### With API Key (Recommended)
- 🎬 Animated GIF demonstrations
- 📸 Professional exercise photos
- 🎯 1300+ exercises available
- ✨ Better user experience

### Without API Key (Fallback)
- 😊 Emoji icons (current)
- ⚡ Instant loading
- 🔒 No external dependencies
- ✅ Works offline

## Free Tier Limits

**RapidAPI Basic Plan:**
- 100 requests/day
- Resets daily at midnight UTC
- Enough for ~100 users/day
- Upgrade available if needed

**Optimization:**
- Images cached in memory
- Only 1 API call per user session
- Subsequent page loads use cache
- No repeated API calls

## Testing

### Test With API Key:
1. Add valid API key to `.env`
2. Restart app
3. Open Create Workout
4. Click "📚 Browse"
5. See animated GIFs

### Test Fallback:
1. Remove API key from `.env`
2. Restart app
3. Open Create Workout
4. Click "📚 Browse"
5. See emoji icons

### Test Rate Limit:
1. Make 100+ requests in one day
2. API returns 429 error
3. App automatically switches to emojis
4. Next day, API works again

## Production Deployment

### Vercel Environment Variables:
1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Add: `REACT_APP_EXERCISEDB_KEY` = `your_key`
5. Redeploy

### Render (Backend):
No changes needed - API calls are frontend only

## Upgrading API Plan

If you exceed 100 requests/day:

**Pro Plan ($10/month):**
- 10,000 requests/day
- Same features
- Better for production

**Mega Plan ($50/month):**
- 100,000 requests/day
- For large apps

## Alternative: Self-Host Images

If you don't want external API dependency:

1. Download exercise GIFs from ExerciseDB
2. Store in `frontend/public/exercises/`
3. Update `exercises.js` with local paths
4. No API key needed
5. Faster loading
6. Works offline

## Troubleshooting

**Images not loading?**
- Check API key is correct
- Check console for errors
- Verify `.env` file exists
- Restart development server

**Rate limit exceeded?**
- Wait until next day (resets midnight UTC)
- Upgrade to Pro plan
- App still works with emoji fallback

**Slow loading?**
- Normal on first load (fetching 1300 exercises)
- Subsequent loads use cache
- Consider lazy loading images

## Benefits

✅ Professional exercise demonstrations  
✅ Better user experience  
✅ Free tier sufficient for most apps  
✅ Automatic fallback if API fails  
✅ No impact on core functionality  
✅ Easy to set up (5 minutes)  

## No API Key? No Problem!

The app works perfectly without ExerciseDB:
- Emoji icons are clear and recognizable
- Descriptions explain each exercise
- Target muscles listed
- Fast loading
- No external dependencies

API is optional enhancement, not required!
