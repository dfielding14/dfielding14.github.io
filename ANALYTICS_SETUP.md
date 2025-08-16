# Analytics Setup Instructions

## 1. Microsoft Clarity (Heatmaps & Click Tracking)
**Status: Ready to activate**

1. Go to: https://clarity.microsoft.com
2. Sign in with Microsoft/GitHub account
3. Click "New Project"
4. Enter:
   - Name: dfielding14.github.io
   - URL: https://dfielding14.github.io
5. Copy your Project ID (looks like: "pq8xzfh5k7")
6. Replace the ID in _layouts/default.html line 27

**What you'll see:**
- Heatmaps showing where people click
- Session recordings (anonymous)
- Rage clicks and dead clicks
- JavaScript errors

## 2. Umami Analytics (Visitor Stats)
**Status: Needs account**

### Option A: Free Cloud (Easiest)
1. Go to: https://cloud.umami.is
2. Sign up for free account (10,000 events/month free)
3. Add website:
   - Name: Drummond Fielding
   - Domain: dfielding14.github.io
4. Copy the tracking code
5. Replace in _layouts/default.html line 31

### Option B: Free Self-Hosted (Better)
1. Go to: https://vercel.com
2. Click "Deploy Umami" template
3. Connect to GitHub
4. Deploy (takes 2 minutes)
5. Visit your-app.vercel.app
6. Default login: admin/umami
7. Add your website
8. Copy tracking code

**What you'll see:**
- Real-time visitors
- Page views
- Countries/cities
- Browsers/devices
- Referrers
- Custom events

## 3. Quick Alternative: Counter.dev
**Simplest option - no account needed**

Just add this to _layouts/default.html:
```html
<script src="https://cdn.counter.dev/script.js" data-id="YOUR_ID_HERE" data-utcoffset="-5"></script>
```

Visit: https://counter.dev to generate your ID

## Viewing Your Analytics

- **Clarity**: https://clarity.microsoft.com/projects
- **Umami Cloud**: https://cloud.umami.is
- **Counter.dev**: https://counter.dev/dashboard.html?id=YOUR_ID

## Privacy Note
Both services are GDPR compliant and don't require cookie banners.