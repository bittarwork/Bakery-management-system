#!/usr/bin/env node

import { connectDB } from './config/database.js';

console.log('🔧 Testing MySQL connection...');
console.log('Make sure MySQL is running before continuing.');

try {
    await connectDB();
    console.log('🎉 SUCCESS! MySQL connection is working perfectly.');
    console.log('You can now run: npm run dev');
} catch (error) {
    console.error('❌ MySQL connection failed.');
    console.log('\n📋 Quick Setup Guide:');
    console.log('1. Install XAMPP: https://www.apachefriends.org/download.html');
    console.log('2. Start MySQL in XAMPP Control Panel');
    console.log('3. Go to http://localhost/phpmyadmin');
    console.log('4. Create database: bakery_db');
    console.log('5. Run this script again');
    console.log('\nOr check QUICK_FIX.md for detailed instructions');
}

process.exit(0);