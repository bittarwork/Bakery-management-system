import bcrypt from 'bcryptjs';

// Test password from database
const storedHash = '$2b$12$LQv3c1yqBwEHFigPRgOCKO.2QHz/a1Qz5xGY7JR.ZjXqKlZGJnx/a';
const testPassword = 'admin123';

console.log('🔍 Testing password comparison...');
console.log('Stored hash:', storedHash);
console.log('Test password:', testPassword);

// Test 1: Direct comparison
const isMatch1 = await bcrypt.compare(testPassword, storedHash);
console.log('Direct comparison result:', isMatch1);

// Test 2: Hash the password and compare
const saltRounds = 12; // Same as stored hash
const newHash = await bcrypt.hash(testPassword, saltRounds);
console.log('New hash:', newHash);
console.log('New hash matches stored:', newHash === storedHash);

// Test 3: Compare new hash with test password
const isMatch2 = await bcrypt.compare(testPassword, newHash);
console.log('New hash comparison result:', isMatch2);

// Test 4: Try different salt rounds
const hash10 = await bcrypt.hash(testPassword, 10);
console.log('Hash with salt rounds 10:', hash10);
const isMatch10 = await bcrypt.compare(testPassword, hash10);
console.log('Hash 10 comparison result:', isMatch10);

console.log('✅ Testing completed!'); 