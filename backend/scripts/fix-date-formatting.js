#!/usr/bin/env node

/**
 * Script to fix date formatting across the dashboard
 * This script helps identify files that need to be updated to use Gregorian calendar
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardSrcPath = path.join(__dirname, '../../dashboard/src');

// Patterns to find and their suggested replacements
const patterns = [
  {
    find: /toLocaleDateString\(['"`]ar-SA['"`]\)/g,
    replace: 'formatDateShort',
    description: 'Arabic Saudi date formatting to Gregorian short'
  },
  {
    find: /toLocaleDateString\(['"`]ar-EG['"`]\)/g,
    replace: 'formatDateShort',
    description: 'Arabic Egyptian date formatting to Gregorian short'
  },
  {
    find: /toLocaleDateString\(['"`]ar-AE['"`]\)/g,
    replace: 'formatDateShort',
    description: 'Arabic UAE date formatting to Gregorian short'
  },
  {
    find: /toLocaleString\(['"`]ar-SA['"`]\)/g,
    replace: 'formatDateTimeArabic',
    description: 'Arabic Saudi datetime formatting to Gregorian'
  },
  {
    find: /toLocaleString\(['"`]ar-EG['"`]\)/g,
    replace: 'formatDateTimeArabic',
    description: 'Arabic Egyptian datetime formatting to Gregorian'
  },
  {
    find: /toLocaleString\(['"`]ar-AE['"`]\)/g,
    replace: 'formatDateTimeArabic',
    description: 'Arabic UAE datetime formatting to Gregorian'
  }
];

function findFilesWithDateFormatting(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        findFilesWithDateFormatting(fullPath, results);
      }
    } else if (file.match(/\.(jsx?|tsx?)$/)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const issues = [];
      
      for (const pattern of patterns) {
        const matches = content.match(pattern.find);
        if (matches) {
          issues.push({
            pattern: pattern.description,
            matches: matches.length,
            suggestion: pattern.replace
          });
        }
      }
      
      if (issues.length > 0) {
        results.push({
          file: path.relative(dashboardSrcPath, fullPath),
          issues
        });
      }
    }
  }
}

function generateReport() {
  console.log('🔍 Scanning for date formatting issues...\n');
  
  const results = [];
  findFilesWithDateFormatting(dashboardSrcPath, results);
  
  if (results.length === 0) {
    console.log('✅ No date formatting issues found!');
    return;
  }
  
  console.log(`📊 Found ${results.length} files with date formatting issues:\n`);
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.file}`);
    result.issues.forEach(issue => {
      console.log(`   - ${issue.pattern}: ${issue.matches} occurrence(s)`);
      console.log(`     Suggestion: Use ${issue.suggestion}()`);
    });
    console.log('');
  });
  
  console.log('🔧 To fix these issues:');
  console.log('1. Import the date formatter utilities in each file:');
  console.log('   import { formatDateShort, formatDateTimeArabic, formatTimeArabic } from "../../utils/dateFormatter";');
  console.log('');
  console.log('2. Replace the identified patterns with the suggested functions');
  console.log('');
  console.log('📚 Available formatting functions:');
  console.log('   - formatDateShort(date) - for short dates (DD/MM/YYYY)');
  console.log('   - formatDateArabic(date) - for long dates with Arabic text');
  console.log('   - formatDateTimeArabic(date) - for date and time');
  console.log('   - formatTimeArabic(date) - for time only');
  console.log('   - getRelativeTimeArabic(date) - for relative time ("منذ 5 دقائق")');
}

// Run the analysis
try {
  generateReport();
} catch (error) {
  console.error('❌ Error analyzing files:', error.message);
  process.exit(1);
} 