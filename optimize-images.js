#!/usr/bin/env node

/**
 * Image Optimization Script for Royal Nano Ceramic
 * Converts images to WebP format and optimizes them
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  inputDir: 'src/assets/images',
  outputDir: 'src/assets/images',
  quality: 80,
  maxWidth: 1920,
  maxHeight: 1080,
  formats: ['webp', 'avif'],
  preserveOriginal: true
};

// Supported image formats
const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];

// Get all image files recursively
function getImageFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getImageFiles(fullPath));
    } else if (supportedFormats.includes(path.extname(item).toLowerCase())) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Optimize single image
async function optimizeImage(inputPath) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    const name = path.basename(inputPath, ext);
    const dir = path.dirname(inputPath);
    
    console.log(`Processing: ${inputPath}`);
    
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log(`  Original: ${metadata.width}x${metadata.height}, ${Math.round(fs.statSync(inputPath).size / 1024)}KB`);
    
    // Process each format
    for (const format of config.formats) {
      const outputPath = path.join(dir, `${name}.${format}`);
      
      let pipeline = sharp(inputPath)
        .resize(config.maxWidth, config.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });
      
      if (format === 'webp') {
        pipeline = pipeline.webp({ quality: config.quality });
      } else if (format === 'avif') {
        pipeline = pipeline.avif({ quality: config.quality });
      }
      
      await pipeline.toFile(outputPath);
      
      const outputSize = Math.round(fs.statSync(outputPath).size / 1024);
      console.log(`  ${format.toUpperCase()}: ${outputSize}KB`);
    }
    
    // Create responsive sizes for critical images
    if (name.includes('hero') || name.includes('logo') || name.includes('banner')) {
      await createResponsiveImages(inputPath, dir, name);
    }
    
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
  }
}

// Create responsive image sizes
async function createResponsiveImages(inputPath, dir, name) {
  const sizes = [
    { width: 480, suffix: '-sm' },
    { width: 768, suffix: '-md' },
    { width: 1024, suffix: '-lg' },
    { width: 1920, suffix: '-xl' }
  ];
  
  for (const size of sizes) {
    for (const format of config.formats) {
      const outputPath = path.join(dir, `${name}${size.suffix}.${format}`);
      
      await sharp(inputPath)
        .resize(size.width, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        [format]({ quality: config.quality })
        .toFile(outputPath);
    }
  }
  
  console.log(`  Created responsive sizes for ${name}`);
}

// Generate HTML for responsive images
function generateResponsiveImageHTML(imagePath, alt = '') {
  const name = path.basename(imagePath, path.extname(imagePath));
  const dir = path.dirname(imagePath);
  
  return `
<picture>
  <source srcset="${path.join(dir, `${name}-sm.avif`)}" media="(max-width: 480px)" type="image/avif">
  <source srcset="${path.join(dir, `${name}-md.avif`)}" media="(max-width: 768px)" type="image/avif">
  <source srcset="${path.join(dir, `${name}-lg.avif`)}" media="(max-width: 1024px)" type="image/avif">
  <source srcset="${path.join(dir, `${name}-xl.avif`)}" type="image/avif">
  
  <source srcset="${path.join(dir, `${name}-sm.webp`)}" media="(max-width: 480px)" type="image/webp">
  <source srcset="${path.join(dir, `${name}-md.webp`)}" media="(max-width: 768px)" type="image/webp">
  <source srcset="${path.join(dir, `${name}-lg.webp`)}" media="(max-width: 1024px)" type="image/webp">
  <source srcset="${path.join(dir, `${name}-xl.webp`)}" type="image/webp">
  
  <img src="${imagePath}" alt="${alt}" loading="lazy" width="800" height="600">
</picture>`;
}

// Main execution
async function main() {
  console.log('🚀 Starting image optimization...');
  console.log(`📁 Input directory: ${config.inputDir}`);
  console.log(`📁 Output directory: ${config.outputDir}`);
  console.log(`🎯 Quality: ${config.quality}%`);
  console.log(`📏 Max dimensions: ${config.maxWidth}x${config.maxHeight}`);
  console.log(`📦 Formats: ${config.formats.join(', ')}`);
  console.log('');
  
  if (!fs.existsSync(config.inputDir)) {
    console.error(`❌ Input directory does not exist: ${config.inputDir}`);
    process.exit(1);
  }
  
  const imageFiles = getImageFiles(config.inputDir);
  console.log(`📸 Found ${imageFiles.length} images to process`);
  console.log('');
  
  if (imageFiles.length === 0) {
    console.log('ℹ️  No images found to process');
    return;
  }
  
  // Process images
  for (const imageFile of imageFiles) {
    await optimizeImage(imageFile);
    console.log('');
  }
  
  console.log('✅ Image optimization completed!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Update your HTML to use WebP/AVIF images');
  console.log('2. Add lazy loading to non-critical images');
  console.log('3. Use responsive images for better performance');
  console.log('4. Test the optimized images in different browsers');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  optimizeImage,
  generateResponsiveImageHTML,
  config
};
