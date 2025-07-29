import fs from 'fs';

console.log('Testing imports...');

try {
    console.log('1. Testing DailyDistributionSchedule model import...');
    const model = await import('./models/DailyDistributionSchedule.js');
    console.log('✅ Model imported successfully, has default export:', !!model.default);
} catch (error) {
    console.error('❌ Model import error:', error.message);
}

try {
    console.log('2. Testing dailyDistributionScheduleController import...');
    const controller = await import('./controllers/dailyDistributionScheduleController.js');
    console.log('✅ Controller imported successfully');
    console.log('Available functions:', Object.keys(controller));
    console.log('Has getAutoDistributionSchedules:', !!controller.getAutoDistributionSchedules);
} catch (error) {
    console.error('❌ Controller import error:', error.message);
}

try {
    console.log('3. Testing distribution routes import...');
    const routes = await import('./routes/distributionRoutes.js');
    console.log('✅ Routes imported successfully, has default export:', !!routes.default);
} catch (error) {
    console.error('❌ Routes import error:', error.message);
}

console.log('Import test completed.');