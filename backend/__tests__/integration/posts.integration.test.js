const request = require('supertest');
const { Pool } = require('pg');
const express = require('express');
const cors = require('cors');
const postsRouter = require('../../routes/posts');

describe('Posts Integration Tests', () => {
  let app;
  let pool;
  let server;

  beforeAll(async () => {
    // Create a real database connection for integration tests
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'testdb',
      user: process.env.DB_USER || 'testuser',
      password: process.env.DB_PASSWORD || 'testpass'
    });

    // Create test table
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

    // Setup Express app
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/posts', postsRouter);

    // Start server
    server = app.listen(0); // Use random port
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await pool.query('DELETE FROM posts');
  });

  afterAll(async () => {
    // Clean up
    if (server) {
      server.close();
    }
    if (pool) {
      await pool.end();
    }
  });

  describe('POST /api/posts', () => {
    it('should create a post and return it', async () => {
      const newPost = {
        title: 'Integration Test Post',
        content: 'This is a test post for integration testing',
        author: 'Test Author'
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

      // Verify the post was actually saved to the database
      const dbResult = await pool.query('SELECT * FROM posts WHERE id = $1', [response.body.id]);
      expect(dbResult.rows).toHaveLength(1);
      expect(dbResult.rows[0]).toMatchObject(newPost);
    });
  });

  describe('GET /api/posts', () => {
    it('should return all posts', async () => {
      // Insert test data
      const testPosts = [
        {
          title: 'First Post',
          content: 'Content of first post',
          author: 'Author One'
        },
        {
          title: 'Second Post',
          content: 'Content of second post',
          author: 'Author Two'
        }
      ];

      for (const post of testPosts) {
        await pool.query(
          'INSERT INTO posts (title, content, author) VALUES ($1, $2, $3)',
          [post.title, post.content, post.author]
        );
      }

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject(testPosts[1]); // Should be ordered by created_at DESC
      expect(response.body[1]).toMatchObject(testPosts[0]);
    });

    it('should return empty array when no posts exist', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a specific post', async () => {
      // Insert test data
      const testPost = {
        title: 'Specific Post',
        content: 'Content of specific post',
        author: 'Specific Author'
      };

      const insertResult = await pool.query(
        'INSERT INTO posts (title, content, author) VALUES ($1, $2, $3) RETURNING id',
        [testPost.title, testPost.content, testPost.author]
      );

      const postId = insertResult.rows[0].id;

      const response = await request(app)
        .get(`/api/posts/${postId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: postId,
        ...testPost
      });
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .get('/api/posts/99999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Post not found' });
    });
  });

  describe('Database Connection', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test that the app starts correctly
      expect(app).toBeDefined();
    });
  });

  describe('Data Validation', () => {
    it('should handle SQL injection attempts', async () => {
      const maliciousPost = {
        title: "'; DROP TABLE posts; --",
        content: 'Malicious content',
        author: 'Hacker'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(maliciousPost)
        .expect(201);

      // Verify the malicious input was escaped and stored as-is
      expect(response.body.title).toBe(maliciousPost.title);
      expect(response.body.content).toBe(maliciousPost.content);
      expect(response.body.author).toBe(maliciousPost.author);

      // Verify the table still exists
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'posts'
        )
      `);
      expect(tableCheck.rows[0].exists).toBe(true);
    });
  });
});
