# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an academic personal website built with Jekyll and the Academic Pages theme (forked from Minimal Mistakes). It's a GitHub Pages-hosted site for Drummond B. Fielding, a computational astrophysicist at New York University.

## Tech Stack

- **Static Site Generator**: Jekyll (GitHub Pages compatible)
- **Theme**: Academic Pages (based on Minimal Mistakes v3.4.2)
- **Languages**: HTML, Markdown, SCSS, JavaScript
- **Deployment**: GitHub Pages

## Key Commands

### Local Development

```bash
# Install dependencies (run once or when Gemfile changes)
bundle install

# Serve site locally with live reload
bundle exec jekyll serve
# Or with Hawkins gem for enhanced live reload:
bundle exec jekyll liveserve

# Clean build artifacts
bundle clean

# Build JavaScript assets
npm run build:js

# Watch JavaScript files for changes
npm run watch:js
```

### Prerequisites

Before running locally, ensure you have:
- Ruby and ruby-dev
- Bundler (`gem install bundler`)
- Node.js (for JavaScript compilation)

## Architecture

### Directory Structure

- **_pages/**: Main site pages (about, cv, publications, research, etc.)
- **_posts/**: Blog posts (dated markdown files)
- **_publications/**: Individual publication entries
- **_talks/**: Talk/presentation entries
- **_teaching/**: Teaching experience entries
- **_portfolio/**: Portfolio project entries
- **_data/**: Site data files (navigation, UI text, authors)
- **_includes/**: Reusable HTML components
- **_layouts/**: Page layout templates
- **_sass/**: SCSS stylesheets
- **assets/**: CSS, JavaScript, and fonts
- **files/**: PDFs and downloadable content
- **images/**: Site images and graphics

### Configuration

- **_config.yml**: Main Jekyll configuration (site metadata, author info, build settings)
- **_config.dev.yml**: Development-specific configuration overrides
- **_data/navigation.yml**: Site navigation menu structure

### Content Management

The site uses Jekyll's collections feature for organizing content:
- Publications, talks, teaching, and portfolio items are managed as collections
- Each collection item is a markdown file with YAML front matter
- The `markdown_generator/` folder contains Python scripts to generate markdown files from TSV/BibTeX data

### Key Features

- Responsive academic portfolio layout
- Publication list with PDF links
- CV/resume page
- Research overview section
- Teaching and talks sections
- Google Analytics integration
- SEO optimization with sitemap generation

### Core Beliefs

- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Learning from existing code** - Study and plan before implementing
- **Pragmatic over dogmatic** - Adapt to project reality
- **Clear intent over clever code** - Be boring and obvious

### Simplicity Means

- Single responsibility per function/class
- Avoid premature abstractions
- No clever tricks - choose the boring solution
- If you need to explain it, it's too complex

## Process

### 1. Planning & Staging

Break complex work into 3-5 stages. Document in `IMPLEMENTATION_PLAN.md`:

```markdown
## Stage N: [Name]
**Goal**: [Specific deliverable]
**Success Criteria**: [Testable outcomes]
**Tests**: [Specific test cases]
**Status**: [Not Started|In Progress|Complete]
```
- Update status as you progress
- Remove file when all stages are done

### 2. Implementation Flow

1. **Understand** - Study existing patterns in codebase
2. **Test** - Write test first (red)
3. **Implement** - Minimal code to pass (green)
4. **Refactor** - Clean up with tests passing
5. **Commit** - With clear message linking to plan


# Non-negotiables: follow at all costs.

1.  Never make anything up. If you cannot verify something ask the user and make a clear note of it. Never guess. Never fabricate.
2.  Do not be a sycophant. You are a ruthless code writing bad ass. Be efficient and professional.
3.  Do not assume your first thought is correct. Always consider multiple options and weigh the pros and cons before diving in.

