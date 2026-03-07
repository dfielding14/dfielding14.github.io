# dfielding14.github.io

Personal academic website for Drummond B. Fielding.

## Local Development

```bash
brew install ruby@3.3
export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"
bundle install
bundle exec jekyll serve
```

Site runs at http://localhost:4000/

To validate local links and confirm internal docs are not published:

```bash
bundle exec jekyll build
bundle exec ruby scripts/validate_site.rb
```

## Structure

- `index.html` - Home page content
- `research.html`, `group-policies.html`, `cv.html` - Long-form page content
- `_data/` - High-churn content for navigation, group members, talks, teaching, movies, and opportunities
- `_includes/` - Shared head, nav, footer, figure, and video embed templates
- `_layouts/` - Base shell plus page/home layouts
- `_sass/` - Split Sass partials for tokens, base styles, layout, components, and page-level rules
- `assets/js/site.js` - Navigation and dropdown behavior
- `scripts/validate_site.rb` - Local asset and publication sanity checks
- `solfege-flight/` - Standalone mini-app with its own assets, CSS, and JS
