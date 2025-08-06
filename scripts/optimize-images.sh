#!/bin/bash
# Image optimization script for Jekyll site

echo "Starting image optimization..."

# Create optimized directory if it doesn't exist
mkdir -p static/img/optimized

# Function to optimize PNG images
optimize_png() {
    local input="$1"
    local output="$2"
    
    # Use ImageMagick to optimize PNG (if available)
    if command -v convert &> /dev/null; then
        convert "$input" -strip -interlace Plane -quality 80 "$output"
        echo "Optimized PNG: $input -> $output"
    else
        echo "ImageMagick not available. Please install: brew install imagemagick"
        cp "$input" "$output"
    fi
}

# Function to optimize JPG images
optimize_jpg() {
    local input="$1"
    local output="$2"
    
    # Use ImageMagick to optimize JPG (if available)
    if command -v convert &> /dev/null; then
        convert "$input" -strip -interlace Plane -quality 80 "$output"
        echo "Optimized JPG: $input -> $output"
    else
        echo "ImageMagick not available. Please install: brew install imagemagick"
        cp "$input" "$output"
    fi
}

# Function to create WebP versions
create_webp() {
    local input="$1"
    local output="${input%.*}.webp"
    
    if command -v cwebp &> /dev/null; then
        cwebp -q 80 "$input" -o "static/img/optimized/$(basename "$output")"
        echo "Created WebP: $input -> $output"
    else
        echo "cwebp not available. Please install: brew install webp"
    fi
}

# Process all images in static/img
for img in static/img/*.{png,jpg,jpeg}; do
    if [[ -f "$img" ]]; then
        filename=$(basename "$img")
        extension="${filename##*.}"
        
        case "$extension" in
            png)
                optimize_png "$img" "static/img/optimized/$filename"
                create_webp "$img"
                ;;
            jpg|jpeg)
                optimize_jpg "$img" "static/img/optimized/$filename"
                create_webp "$img"
                ;;
        esac
    fi
done

echo "Image optimization complete!"
echo "Original images are preserved in static/img/"
echo "Optimized images are available in static/img/optimized/"