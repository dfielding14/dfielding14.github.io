# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Minimal Jekyll site for Drummond B. Fielding's academic website.

## Commands

```bash
bundle exec jekyll serve  # Run locally
bundle exec jekyll build  # Build site
```

## Structure

- Single layout: `_layouts/default.html`
- All pages are HTML in root directory
- Styling: `assets/css/new-style.scss`
- Images: `images/` (only research images and profile photo)
- PDFs: `files/` (CV and publications)

## Key Principles

- Minimal dependencies (just Jekyll)
- Clean, simple design
- Fast load times
- No JavaScript frameworks
- No unused files or code