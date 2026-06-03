# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jekyll-based personal portfolio website for Ashish Sethi. Deployed via GitHub Pages at https://ashishsethi.me.

## Build & Development Commands

```bash
# Install dependencies
bundle install

# Local development server
bundle exec jekyll serve

# Development with incremental builds (faster)
bundle exec jekyll serve --incremental

# Production build with profiling
JEKYLL_ENV=production bundle exec jekyll build --profile --trace
# Or use the build script:
./scripts/build-optimized.sh

# Image optimization (requires ImageMagick and cwebp)
./scripts/optimize-images.sh

# Clean build artifacts
bundle exec jekyll clean
```

## Architecture

### Directory Structure
- `_layouts/` - Page templates (blog.html wraps most pages, post.html for blog posts)
- `_includes/` - Reusable partials (head.html, header.html, footer.html, SEO components)
- `_posts/` - Blog posts in Markdown with YAML front matter
- `templates/` - Content sections loaded into index.html (about.html, experience.html, education.html, contact.html)
- `static/css/` - Main stylesheet
- `static/js/` - JavaScript with lazy loading and performance monitoring
- `scripts/` - Build and optimization scripts
- `_site/` - Generated output (gitignored)

### Key Patterns
- Home page uses `blog` layout and dynamically loads content from `templates/` directory
- External CSS/JS for caching; critical CSS inlined in `_includes/head.html`
- Images use lazy loading via `data-src` attribute and IntersectionObserver
- Service Worker (`sw.js`) provides offline caching
- Responsive images via `_includes/responsive-image.html` component

### SEO & Performance
- Structured data (JSON-LD) in `_includes/structured-data.html`
- Meta tags and Open Graph in `_includes/seo.html`
- Web Vitals monitoring in `_includes/performance-monitoring.html`
- Google Analytics in `_includes/seo-analytics.html`

## Configuration

Main settings in `_config.yml`:
- Theme: jekyll-theme-cayman
- Plugins: jekyll-feed, jekyll-sitemap, jekyll-redirect-from
- Incremental builds enabled
- SASS compression enabled
