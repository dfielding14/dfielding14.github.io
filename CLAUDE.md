# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Minimal Jekyll site for Drummond B. Fielding's academic website.

## Commands

```bash
export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"
bundle install
bundle exec jekyll serve  # Run locally
bundle exec jekyll build  # Build site
bundle exec ruby scripts/validate_site.rb  # Validate local links and published output
```

## Structure

- Base shell: `_layouts/default.html`
- Page layouts: `_layouts/page.html`, `_layouts/home.html`
- Shared includes: `_includes/`
- Structured content: `_data/`
- Split Sass partials: `_sass/` with `assets/css/new-style.scss` as the entrypoint
- Site JS: `assets/js/site.js`
- Validation tooling: `scripts/validate_site.rb`
- Main pages remain HTML in the repo root to preserve current URL behavior
- Standalone mini-app: `solfege-flight/`

## Key Principles

- Minimal dependencies (just Jekyll)
- Clean, simple design
- Fast load times
- No JavaScript frameworks
- No unused files or code
