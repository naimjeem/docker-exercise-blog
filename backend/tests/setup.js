// Jest setup file for backend tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || 5432;
process.env.DB_NAME = process.env.DB_NAME || 'testdb';
process.env.DB_USER = process.env.DB_USER || 'testuser';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'testpass';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Helper to create test data
  createTestPost: (overrides = {}) => ({
    title: 'Test Post',
    content: 'Test content',
    author: 'Test Author',
    ...overrides
  }),

  // Helper to wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to generate random strings
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// Console configuration for tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress expected error messages during tests
  if (
    args[0] && 
    typeof args[0] === 'string' && 
    (args[0].includes('Database connection failed') || 
     args[0].includes('Error initializing database'))
  ) {
    return;
  }
  originalConsoleError(...args);
};
