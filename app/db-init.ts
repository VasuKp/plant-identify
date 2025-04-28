import { initializeDatabase } from './lib/db';

// Initialize database on app startup
console.log('Initializing database...');

initializeDatabase()
  .then((success) => {
    if (success) {
      console.log('Database initialized successfully');
    } else {
      console.error('Database initialization failed');
    }
  })
  .catch((error) => {
    console.error('Error initializing database:', error);
  }); 