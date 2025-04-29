import { initializeDatabase, testConnection } from './lib/db';

// Initialize database on app startup
console.log('Checking database connection...');

// First test the connection
testConnection()
  .then(connected => {
    if (!connected) {
      console.error('Database connection failed! Please check your DATABASE_URL environment variable.');
      console.log('The application will continue to run, but database features will not be available.');
      return false;
    }
    
    console.log('Database connection successful! Initializing schema...');
    // Now initialize the database
    return initializeDatabase();
  })
  .then((success) => {
    if (success) {
      console.log('Database initialized successfully');
    } else if (success === false) {
      console.error('Database initialization failed');
    }
    // If success is undefined, we've already handled the error in the previous step
  })
  .catch((error) => {
    console.error('Error in database setup:', error);
    console.log('The application will continue to run, but database features will not be available.');
  }); 