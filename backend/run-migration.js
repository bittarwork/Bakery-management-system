import { up } from './migrations/add-missing-order-fields.js';

console.log('Running migration to add missing order fields...');
up()
    .then(() => {
        console.log('Migration completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    }); 