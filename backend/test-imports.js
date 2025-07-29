console.log('Testing controller imports...');

async function testImports() {
    try {
        console.log('1. Testing distributionTripController...');
        const trip = await import('./controllers/distributionTripController.js');
        console.log('Trip exports:', Object.keys(trip));

        console.log('2. Testing dailyDistributionScheduleController...');
        const schedule = await import('./controllers/dailyDistributionScheduleController.js');
        console.log('Schedule exports:', Object.keys(schedule));

        console.log('3. Testing locationTrackingController...');
        const location = await import('./controllers/locationTrackingController.js');
        console.log('Location exports:', Object.keys(location));

        console.log('4. Testing distributionPerformanceController...');
        const performance = await import('./controllers/distributionPerformanceController.js');
        console.log('Performance exports:', Object.keys(performance));

        console.log('5. Testing distributionNotificationController...');
        const notification = await import('./controllers/distributionNotificationController.js');
        console.log('Notification exports:', Object.keys(notification));

        console.log('6. Testing distributionSettingsController...');
        const settings = await import('./controllers/distributionSettingsController.js');
        console.log('Settings exports:', Object.keys(settings));

        console.log('All imports successful!');
    } catch (error) {
        console.error('Error during import:', error.message);
        console.error('Stack:', error.stack);
    }
}

testImports();