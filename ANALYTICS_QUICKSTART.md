# Analytics Setup - Umami + Clarity (5 minutes)

## Step 1: Umami Analytics (3 min)
### Option A: Umami Cloud (Easiest - Free up to 10k events/month)
1. Go to: https://cloud.umami.is
2. Sign up free
3. Add website:
   - Name: "dfielding14.github.io"
   - Domain: "dfielding14.github.io"
4. Copy your Website ID (looks like: "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
5. Replace "UMAMI_WEBSITE_ID" in _layouts/default.html (line 22)

### Option B: Deploy Your Own (Completely Free)
1. Click here: https://vercel.com/new/clone?repository-url=https://github.com/umami-software/umami
2. Sign in with GitHub
3. Click "Deploy" (takes 2 min)
4. Visit your-app.vercel.app
5. Login: admin/umami
6. Add your website
7. Get tracking code and replace line 22 in _layouts/default.html

## Step 2: Microsoft Clarity (2 min)
1. Go to: https://clarity.microsoft.com
2. Sign in with Microsoft/GitHub
3. New Project:
   - Name: "dfielding14"
   - URL: "https://dfielding14.github.io"
4. Get your Project ID (like "pq8xzfh5k7")
5. Replace "CLARITY_ID" in _layouts/default.html (line 30)

## Step 3: Deploy
```bash
git add -A
git commit -m "Add Umami and Clarity analytics"
git push origin master
```

## View Your Analytics

### Umami Dashboard
- Visit: https://cloud.umami.is (or your-app.vercel.app)
- See:
  - Real-time visitors
  - Page views
  - Countries/cities
  - Browsers/devices
  - Referrer sources
  - Custom events

### Clarity Dashboard  
- Visit: https://clarity.microsoft.com
- See:
  - Heatmaps (where people click)
  - Session recordings
  - Rage clicks
  - JavaScript errors

Data appears within minutes of deployment!