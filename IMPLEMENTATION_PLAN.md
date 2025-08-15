# Website Redesign Implementation Plan

## Overview
Complete redesign of dfielding14.github.io to create a clean, modern academic website inspired by Anna Ho's minimalist approach but with enhanced aesthetics and navigation.

## Design Decisions

### Visual Design
- **Typography**: Use Inter or Source Sans Pro from Google Fonts as primary, with fallback to system fonts (including GT America if available locally)
- **Color Scheme**: 
  - Background: Soft off-white (#FAFAF8) for warmth
  - Primary text: Deep charcoal (#2C3E50) for readability
  - Accent: Deep blue (#2C5282) for links and highlights
  - Secondary: Medium gray (#6B7280) for meta information
- **Layout**: Clean, centered content with generous whitespace, max-width 900px
- **Navigation**: Fixed top navigation bar with smooth transitions

### Technical Approach
- Transition from complex Jekyll Academic Pages theme to simple Jekyll setup
- Use minimal dependencies - just Jekyll core
- Custom CSS instead of heavy frameworks
- Mobile-first responsive design

## Stage 1: Setup and Structure
**Goal**: Create development branch and basic Jekyll structure
**Success Criteria**: 
- Development branch created
- Basic Jekyll configuration working
- Simple homepage rendering locally
**Tests**: 
- `bundle exec jekyll serve` runs without errors
- Homepage loads at localhost:4000
**Status**: Not Started

### Tasks:
1. Create development branch
2. Clean out unnecessary Academic Pages theme files
3. Set up minimal Jekyll configuration
4. Create basic directory structure
5. Copy new profile photo to images/

## Stage 2: Core Pages and Navigation
**Goal**: Implement all main pages with top navigation bar
**Success Criteria**: 
- All pages accessible via navigation
- Content migrated from old site
- Responsive navigation working
**Tests**: 
- All navigation links work
- Pages display correctly on mobile and desktop
**Status**: Not Started

### Pages to Create:
1. **index.html** - Home/About page with bio
2. **research.html** - Research interests and projects
3. **publications.html** - Publications list with PDFs
4. **cv.html** - Full CV
5. **teaching.html** - Teaching experience
6. **talks.html** - Presentations and talks
7. **group.html** - Research group (TODO placeholder)
8. **opportunities.html** - Opportunities for students (TODO placeholder)
9. **getting-started.html** - Resources for new students (TODO placeholder)
10. **movies.html** - Visualization/movies page

### Navigation Structure:
```
Home | Research | Publications | CV | Teaching | Group | Opportunities | Getting Started
```

## Stage 3: Content Migration
**Goal**: Migrate all existing content to new structure
**Success Criteria**: 
- All publications migrated
- All teaching content preserved
- All talks migrated
- PDFs linked correctly
**Tests**: 
- All PDF links work
- No content lost from original site
**Status**: Not Started

### Content Sources:
- Publications from `_publications/`
- Teaching from `_teaching/`
- Talks from `_talks/`
- PDFs from `files/`
- Research content from `_pages/research.md`
- CV content from `_pages/cv.md`

## Stage 4: Styling and Polish
**Goal**: Implement beautiful, minimal design
**Success Criteria**: 
- Custom CSS implemented
- Typography refined
- Colors and spacing polished
- Animations smooth
**Tests**: 
- Site looks professional
- Performance is fast
- Accessibility standards met
**Status**: Not Started

### Design Elements:
1. Custom CSS file with:
   - Typography system
   - Color variables
   - Spacing system
   - Navigation styles
   - Card/section styles
2. Subtle hover effects
3. Smooth scroll behavior
4. Print-friendly CV styling

## Stage 5: Final Testing and Optimization
**Goal**: Ensure site is production-ready
**Success Criteria**: 
- All links verified
- Images optimized
- SEO tags in place
- Site builds without warnings
**Tests**: 
- Build succeeds: `bundle exec jekyll build`
- No broken links
- Lighthouse score > 90
**Status**: Not Started

### Checklist:
- [ ] Test all internal links
- [ ] Verify all PDF downloads
- [ ] Check responsive design on multiple devices
- [ ] Optimize images
- [ ] Add meta tags for SEO
- [ ] Test on GitHub Pages

## File Structure (New)
```
/
├── _config.yml (minimal Jekyll config)
├── _layouts/
│   └── default.html (single layout)
├── _includes/
│   ├── head.html
│   ├── navigation.html
│   └── footer.html
├── assets/
│   └── css/
│       └── main.css (custom styles)
├── images/
│   └── DrummondFielding-1260.jpeg
├── files/ (keep existing PDFs)
├── index.html
├── research.html
├── publications.html
├── cv.html
├── teaching.html
├── talks.html
├── group.html
├── opportunities.html
├── getting-started.html
└── movies.html
```

## Notes
- Keep it simple - no complex build processes
- Focus on content over framework complexity  
- Ensure fast load times
- Maintain professional appearance while adding visual polish