# Strava Integration Setup

## Get Strava API Credentials (5 minutes)

### 1. Create Strava App

1. Go to https://www.strava.com/settings/api
2. Click "Create App" (or "My API Application")
3. Fill in the form:
   - **Application Name:** Gym Tracker
   - **Category:** Training
   - **Club:** Leave blank
   - **Website:** `http://localhost:3000`
   - **Authorization Callback Domain:** `localhost`
   - **Application Description:** Personal gym and running tracker
4. Check "I agree to the terms"
5. Click "Create"

### 2. Get Your Credentials

After creating, you'll see:
- **Client ID:** (a number like `123456`)
- **Client Secret:** (a long string)

### 3. Add to .env

Edit `frontend/.env`:
```
REACT_APP_STRAVA_CLIENT_ID=123456
REACT_APP_STRAVA_CLIENT_SECRET=your_client_secret_here
```

### 4. Restart Frontend

```bash
# Stop server (Ctrl+C)
npm start
```

## How to Use

### Connect to Strava:
1. Go to Health Sync page
2. Click "Connect Strava"
3. Sign in to Strava
4. Authorize the app
5. You'll be redirected back with "✅ Connected"

### Import Runs:
1. Click "⬇️ Import Runs from Strava"
2. Wait for import (may take a minute)
3. See "Imported X runs from Strava!"
4. Go to Running page to see all imported runs

## What Gets Imported

✅ All runs from last 30 days  
✅ Distance (kilometers)  
✅ Duration (moving time)  
✅ Pace (calculated)  
✅ **Full GPS route** (polyline decoded to lat/lng)  
✅ Run name and date  

## View Routes

1. Go to Running page
2. Click "View" on any imported run
3. See the full route on the map!

## Benefits Over Google Fit

- ✅ Full GPS routes (Google Fit API doesn't expose routes easily)
- ✅ More accurate data (Strava is built for athletes)
- ✅ Includes run names and descriptions
- ✅ Better for serious runners

## Using Your Phone

The app already works on your phone:

1. Open `http://localhost:3000` on your phone (same WiFi)
   - Or use your computer's IP: `http://192.168.x.x:3000`
2. Go to Running → Start Run
3. Grant GPS permission
4. Your phone will track the route with GPS
5. Much more accurate than desktop

## Production Setup

When deploying to Vercel:

1. Update Strava app settings:
   - Website: `https://your-app.vercel.app`
   - Authorization Callback Domain: `your-app.vercel.app`

2. Add environment variables in Vercel:
   - `REACT_APP_STRAVA_CLIENT_ID`
   - `REACT_APP_STRAVA_CLIENT_SECRET`

## Troubleshooting

**"Authorization Error"?**
- Check callback domain is set to `localhost` (no http://)
- Make sure Client ID and Secret are correct in `.env`

**No runs imported?**
- Check you have runs in Strava from last 30 days
- Make sure runs are set to "Everyone" or "Followers" visibility

**Routes not showing?**
- Some Strava activities don't have GPS data
- Check the original activity in Strava has a map

## Rate Limits

Strava API limits:
- 100 requests per 15 minutes
- 1000 requests per day

This is plenty for personal use!
