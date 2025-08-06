#!/bin/bash
# Optimized build script for Jekyll site

echo "🚀 Starting optimized Jekyll build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
bundle exec jekyll clean

# Run image optimization
echo "📸 Optimizing images..."
if [ -f "scripts/optimize-images.sh" ]; then
    ./scripts/optimize-images.sh
else
    echo "⚠️  Image optimization script not found"
fi

# Build with optimizations
echo "🔨 Building Jekyll site with optimizations..."
JEKYLL_ENV=production bundle exec jekyll build --profile --trace

# Optional: Minify HTML (if htmlcompressor is available)
if command -v htmlcompressor &> /dev/null; then
    echo "🗜️  Minifying HTML files..."
    find _site -name "*.html" -exec htmlcompressor --compress-js --compress-css {} \;
else
    echo "ℹ️  HTML minification skipped (htmlcompressor not installed)"
fi

# Generate sitemap if not already generated
if [ ! -f "_site/sitemap.xml" ]; then
    echo "🗺️  Generating sitemap..."
    bundle exec jekyll sitemap
fi

# Calculate build statistics
echo "📊 Build Statistics:"
echo "   Total files: $(find _site -type f | wc -l)"
echo "   HTML files: $(find _site -name "*.html" | wc -l)"
echo "   CSS files: $(find _site -name "*.css" | wc -l)"
echo "   JS files: $(find _site -name "*.js" | wc -l)"
echo "   Image files: $(find _site -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" | wc -l)"

# Calculate total size
total_size=$(du -sh _site | cut -f1)
echo "   Total size: $total_size"

echo "✅ Optimized build complete!"
echo "📁 Output directory: _site/"