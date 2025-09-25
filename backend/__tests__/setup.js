// Test setup file
require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'testdb';
process.env.DB_USER = process.env.DB_USER || 'testuser';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'testpass';
