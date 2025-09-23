const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Image optimization script
 * Converts images to WebP format and creates multiple sizes
 */

const inputDir = './src/assets/images';
const outputDir = './src/assets/images/optimized';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Image sizes for responsive design
const sizes = [
  { width: 320, suffix: '-sm' },
  { width: 640, suffix: '-md' },
  { width: 1024, suffix: '-lg' },
  { width: 1920, suffix: '-xl' }
];

async function optimizeImage(inputPath, outputPath, width, quality = 80) {
  try {
    await sharp(inputPath)
      .resize(width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality })
      .toFile(outputPath);
    
    console.log(`✓ Optimized: ${path.basename(inputPath)} -> ${width}px`);
  } catch (error) {
    console.error(`✗ Error optimizing ${inputPath}:`, error.message);
  }
}

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } else if (stat.isFile() && /\.(jpg|jpeg|png)$/i.test(file)) {
      const relativePath = path.relative(inputDir, filePath);
      const dirName = path.dirname(relativePath);
      const fileName = path.basename(file, path.extname(file));
      
      // Create subdirectory in output
      const outputSubDir = path.join(outputDir, dirName);
      if (!fs.existsSync(outputSubDir)) {
        fs.mkdirSync(outputSubDir, { recursive: true });
      }
      
      // Generate optimized versions
      for (const size of sizes) {
        const outputPath = path.join(outputSubDir, `${fileName}${size.suffix}.webp`);
        await optimizeImage(filePath, outputPath, size.width);
      }
      
      // Also create original size WebP
      const originalOutputPath = path.join(outputSubDir, `${fileName}.webp`);
      await optimizeImage(filePath, originalOutputPath, null, 85);
    }
  }
}

async function main() {
  console.log('🚀 Starting image optimization...');
  console.log(`📁 Input directory: ${inputDir}`);
  console.log(`📁 Output directory: ${outputDir}`);
  
  try {
    await processDirectory(inputDir);
    console.log('✅ Image optimization completed!');
  } catch (error) {
    console.error('❌ Error during optimization:', error);
  }
}

// Run the optimization
main();
