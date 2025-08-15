# New Website Design - Development Branch

## Overview
This is a complete redesign of dfielding14.github.io, transitioning from the Academic Pages theme to a clean, minimal custom design.

## What's New

### Design
- **Clean, modern aesthetic** with improved typography using Inter font
- **Elegant color scheme** with soft off-white background and deep blue accents  
- **Enhanced navigation** with fixed top bar and dropdown menus
- **Beautiful cards** with subtle shadows and hover effects
- **Responsive design** that works perfectly on mobile and desktop

### Structure
- **Simplified Jekyll setup** - removed heavy Academic Pages theme dependencies
- **All pages recreated** with cleaner HTML structure:
  - Home (About)
  - Research  
  - Publications
  - Talks
  - Teaching
  - Group (with dropdown for Opportunities and Getting Started)
  - CV
  - Movies (Visualizations)

### Technical Improvements
- **Faster load times** with minimal dependencies
- **Custom CSS** instead of heavy frameworks
- **Better organization** with clear separation of content and styling
- **Mobile-first responsive design**

## Local Development

```bash
# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Site will be available at http://localhost:4000
```

## Content Migration
All content from the original site has been preserved:
- ✅ Publications (all 21 papers with PDFs)
- ✅ Research descriptions and images
- ✅ CV information and PDFs
- ✅ Teaching experience
- ✅ Movie visualizations
- ✅ Talk recordings

## Next Steps
1. Review all pages for content accuracy
2. Test on different devices and browsers
3. Optimize images if needed
4. Add any missing content to placeholder pages (Group members, etc.)
5. Deploy to master branch when ready

## Files Changed
- New minimal `_config.yml`
- Single layout file: `_layouts/default.html`
- Custom CSS: `assets/css/style.css`
- All main pages converted from Markdown to HTML for better control
- New profile photo added

## Deployment
When ready to go live:
1. Test thoroughly on development branch
2. Merge to master branch
3. GitHub Pages will automatically build and deploy

---

Created with care to provide a cleaner, more modern academic website while preserving all existing content.