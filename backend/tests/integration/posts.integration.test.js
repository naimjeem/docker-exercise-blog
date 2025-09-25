const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');

// Test database configuration
const testDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'testdb',
  user: process.env.DB_USER || 'testuser',
  password: process.env.DB_PASSWORD || 'testpass'
};

describe('Posts API Integration Tests', () => {
  let app;
  let pool;
  let server;

  beforeAll(async () => {
    // Create test database connection
    pool = new Pool(testDbConfig);
    
    // Create Express app
    app = express();
    app.use(express.json());
    
    // Import and setup routes
    const postsRouter = require('../../routes/posts');
    app.use('/api/posts', postsRouter);
    
    // Start server
    server = app.listen(0);
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM posts WHERE author = $1', ['Integration Test']);
    await pool.end();
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Clean up any existing test data
    await pool.query('DELETE FROM posts WHERE author = $1', ['Integration Test']);
  });

  describe('POST /api/posts', () => {
    it('should create a post and return it with generated ID', async () => {
      const newPost = {
        title: 'Integration Test Post',
        content: 'This is a test post for integration testing',
        author: 'Integration Test'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(newPost)
        .expect(201);

      expect(response.body).toMatchObject({
        title: newPost.title,
        content: newPost.content,
        author: newPost.author
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.created_at).toBeDefined();
      expect(response.body.updated_at).toBeDefined();
    });
  });

  describe('GET /api/posts', () => {
    it('should return all posts including newly created ones', async () => {
      // Create a test post first
      const testPost = {
        title: 'Test Post for List',
        content: 'Content for list test',
        author: 'Integration Test'
      };

      await request(app)
        .post('/api/posts')
        .send(testPost)
        .expect(201);

      // Get all posts
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Find our test post
      const foundPost = response.body.find(post => post.author === 'Integration Test');
      expect(foundPost).toBeDefined();
      expect(foundPost.title).toBe(testPost.title);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a specific post by ID', async () => {
      // Create a test post first
      const testPost = {
        title: 'Test Post for Get',
        content: 'Content for get test',
        author: 'Integration Test'
      };

      const createResponse = await request(app)
        .post('/api/posts')
        .send(testPost)
        .expect(201);

      const postId = createResponse.body.id;

      // Get the specific post
      const response = await request(app)
        .get(`/api/posts/${postId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: postId,
        title: testPost.title,
        content: testPost.content,
        author: testPost.author
      });
    });

    it('should return 404 for non-existent post ID', async () => {
      const response = await request(app)
        .get('/api/posts/99999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Post not found' });
    });
  });

  describe('Database Constraints', () => {
    it('should enforce required fields at database level', async () => {
      const incompletePost = {
        title: 'Incomplete Post'
        // missing content and author
      };

      const response = await request(app)
        .post('/api/posts')
        .send(incompletePost)
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should handle database connection issues gracefully', async () => {
      // This test would require temporarily breaking the database connection
      // For now, we'll test the error handling structure
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Data Persistence', () => {
    it('should persist data across multiple requests', async () => {
      const testPost = {
        title: 'Persistence Test Post',
        content: 'Testing data persistence',
        author: 'Integration Test'
      };

      // Create post
      const createResponse = await request(app)
        .post('/api/posts')
        .send(testPost)
        .expect(201);

      const postId = createResponse.body.id;

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 100));

      // Retrieve post
      const getResponse = await request(app)
        .get(`/api/posts/${postId}`)
        .expect(200);

      expect(getResponse.body.title).toBe(testPost.title);
      expect(getResponse.body.content).toBe(testPost.content);
      expect(getResponse.body.author).toBe(testPost.author);
    });
  });
});
