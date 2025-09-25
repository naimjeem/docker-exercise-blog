const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'blogdb',
  user: process.env.DB_USER || 'bloguser',
  password: process.env.DB_PASSWORD || 'blogpass123'
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database tables
const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample data if table is empty
    const result = await pool.query('SELECT COUNT(*) FROM posts');
    if (parseInt(result.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO posts (title, content, author) VALUES
        ('Welcome to Our Blog', 'This is the first post on our blog platform. We are excited to share our thoughts and ideas with you!', 'Admin'),
        ('Docker Compose Tutorial', 'Learn how to orchestrate multiple services using Docker Compose. This tutorial covers networking, volumes, and service dependencies.', 'Tech Writer'),
        ('Building Microservices', 'Microservices architecture allows teams to develop and deploy services independently. Here are some best practices to follow.', 'DevOps Engineer')
      `);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'blog-backend'
  });
});

// Routes
app.use('/api/posts', require('./routes/posts'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(port, '0.0.0.0', async () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(
    `Database config: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
  );
  await initializeDatabase();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});
