#!/usr/bin/env node

/**
 * Bundle Analysis Script for Royal Nano Ceramic
 * Analyzes bundle size and identifies unused code
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  buildCommand: 'ng build --configuration=production --stats-json',
  statsFile: 'dist/royal-nano-ceramic/stats.json',
  bundleAnalyzerCommand: 'npx webpack-bundle-analyzer',
  maxBundleSize: 1024 * 1024, // 1MB
  maxChunkSize: 512 * 1024,   // 512KB
  maxInitialSize: 600 * 1024  // 600KB
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Analyze bundle statistics
function analyzeBundle(statsPath) {
  if (!fs.existsSync(statsPath)) {
    console.log(`${colors.red}❌ Stats file not found: ${statsPath}${colors.reset}`);
    return null;
  }
  
  const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
  const analysis = {
    totalSize: 0,
    chunks: [],
    assets: [],
    modules: [],
    warnings: [],
    recommendations: []
  };
  
  // Analyze chunks
  if (stats.chunks) {
    stats.chunks.forEach(chunk => {
      const chunkSize = chunk.size || 0;
      analysis.totalSize += chunkSize;
      
      analysis.chunks.push({
        id: chunk.id,
        name: chunk.names?.[0] || 'unnamed',
        size: chunkSize,
        modules: chunk.modules?.length || 0,
        isInitial: chunk.initial || false
      });
      
      // Check for oversized chunks
      if (chunkSize > config.maxChunkSize) {
        analysis.warnings.push({
          type: 'oversized-chunk',
          message: `Chunk "${chunk.names?.[0] || chunk.id}" is ${formatBytes(chunkSize)} (limit: ${formatBytes(config.maxChunkSize)})`,
          severity: 'high'
        });
      }
      
      if (chunk.initial && chunkSize > config.maxInitialSize) {
        analysis.warnings.push({
          type: 'oversized-initial',
          message: `Initial chunk "${chunk.names?.[0] || chunk.id}" is ${formatBytes(chunkSize)} (limit: ${formatBytes(config.maxInitialSize)})`,
          severity: 'critical'
        });
      }
    });
  }
  
  // Analyze assets
  if (stats.assets) {
    stats.assets.forEach(asset => {
      analysis.assets.push({
        name: asset.name,
        size: asset.size,
        chunks: asset.chunks
      });
    });
  }
  
  // Analyze modules
  if (stats.modules) {
    stats.modules.forEach(module => {
      analysis.modules.push({
        identifier: module.identifier,
        size: module.size,
        chunks: module.chunks,
        reasons: module.reasons
      });
    });
  }
  
  return analysis;
}

// Generate recommendations
function generateRecommendations(analysis) {
  const recommendations = [];
  
  // Bundle size recommendations
  if (analysis.totalSize > config.maxBundleSize) {
    recommendations.push({
      priority: 'high',
      category: 'Bundle Size',
      title: 'Reduce Total Bundle Size',
      description: `Total bundle size is ${formatBytes(analysis.totalSize)} (limit: ${formatBytes(config.maxBundleSize)})`,
      actions: [
        'Enable tree shaking',
        'Remove unused dependencies',
        'Use dynamic imports for large modules',
        'Consider code splitting'
      ]
    });
  }
  
  // Large chunks recommendations
  const largeChunks = analysis.chunks.filter(chunk => chunk.size > config.maxChunkSize);
  if (largeChunks.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Code Splitting',
      title: 'Split Large Chunks',
      description: `Found ${largeChunks.length} chunks larger than ${formatBytes(config.maxChunkSize)}`,
      actions: [
        'Implement lazy loading for routes',
        'Split vendor chunks',
        'Use dynamic imports for heavy libraries',
        'Consider micro-frontends for large features'
      ]
    });
  }
  
  // Unused code recommendations
  const unusedModules = analysis.modules.filter(module => 
    module.reasons && module.reasons.length === 0
  );
  if (unusedModules.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'Dead Code',
      title: 'Remove Unused Code',
      description: `Found ${unusedModules.length} potentially unused modules`,
      actions: [
        'Review and remove unused imports',
        'Use tree shaking',
        'Remove unused dependencies from package.json',
        'Consider using tools like PurgeCSS for styles'
      ]
    });
  }
  
  return recommendations;
}

// Print analysis report
function printReport(analysis) {
  console.log(`${colors.cyan}📊 Bundle Analysis Report${colors.reset}`);
  console.log(`${colors.cyan}========================${colors.reset}`);
  console.log('');
  
  // Summary
  console.log(`${colors.white}📈 Summary:${colors.reset}`);
  console.log(`  Total Bundle Size: ${colors.yellow}${formatBytes(analysis.totalSize)}${colors.reset}`);
  console.log(`  Number of Chunks: ${colors.yellow}${analysis.chunks.length}${colors.reset}`);
  console.log(`  Number of Assets: ${colors.yellow}${analysis.assets.length}${colors.reset}`);
  console.log(`  Number of Modules: ${colors.yellow}${analysis.modules.length}${colors.reset}`);
  console.log('');
  
  // Chunks breakdown
  console.log(`${colors.white}📦 Chunks Breakdown:${colors.reset}`);
  analysis.chunks
    .sort((a, b) => b.size - a.size)
    .forEach(chunk => {
      const sizeColor = chunk.size > config.maxChunkSize ? colors.red : 
                       chunk.size > config.maxChunkSize * 0.8 ? colors.yellow : colors.green;
      const initialFlag = chunk.isInitial ? ' (Initial)' : '';
      console.log(`  ${chunk.name}${initialFlag}: ${sizeColor}${formatBytes(chunk.size)}${colors.reset} (${chunk.modules} modules)`);
    });
  console.log('');
  
  // Warnings
  if (analysis.warnings.length > 0) {
    console.log(`${colors.red}⚠️  Warnings:${colors.reset}`);
    analysis.warnings.forEach(warning => {
      const severityColor = warning.severity === 'critical' ? colors.red : colors.yellow;
      console.log(`  ${severityColor}${warning.severity.toUpperCase()}${colors.reset}: ${warning.message}`);
    });
    console.log('');
  }
  
  // Recommendations
  if (analysis.recommendations.length > 0) {
    console.log(`${colors.blue}💡 Recommendations:${colors.reset}`);
    analysis.recommendations.forEach((rec, index) => {
      const priorityColor = rec.priority === 'high' ? colors.red : 
                           rec.priority === 'medium' ? colors.yellow : colors.green;
      console.log(`  ${index + 1}. ${priorityColor}${rec.priority.toUpperCase()}${colors.reset} - ${rec.title}`);
      console.log(`     Category: ${rec.category}`);
      console.log(`     Description: ${rec.description}`);
      console.log(`     Actions:`);
      rec.actions.forEach(action => {
        console.log(`       • ${action}`);
      });
      console.log('');
    });
  }
}

// Main execution
async function main() {
  console.log(`${colors.cyan}🚀 Starting Bundle Analysis...${colors.reset}`);
  console.log('');
  
  try {
    // Build project with stats
    console.log(`${colors.yellow}📦 Building project with stats...${colors.reset}`);
    execSync(config.buildCommand, { stdio: 'inherit' });
    console.log('');
    
    // Analyze bundle
    console.log(`${colors.yellow}🔍 Analyzing bundle...${colors.reset}`);
    const analysis = analyzeBundle(config.statsFile);
    
    if (!analysis) {
      console.log(`${colors.red}❌ Failed to analyze bundle${colors.reset}`);
      return;
    }
    
    // Generate recommendations
    analysis.recommendations = generateRecommendations(analysis);
    
    // Print report
    printReport(analysis);
    
    // Open bundle analyzer if available
    console.log(`${colors.blue}🔧 Opening Bundle Analyzer...${colors.reset}`);
    try {
      execSync(`${config.bundleAnalyzerCommand} ${config.statsFile}`, { stdio: 'inherit' });
    } catch (error) {
      console.log(`${colors.yellow}⚠️  Bundle analyzer not available. Install with: npm install -g webpack-bundle-analyzer${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Error during analysis:${colors.reset}`, error.message);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzeBundle,
  generateRecommendations,
  config
};
