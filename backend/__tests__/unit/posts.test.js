const request = require('supertest');
const express = require('express');
const postsRouter = require('../../routes/posts');

// Mock the database pool
jest.mock('pg', () => {
  const mockQuery = jest.fn();
  const mockPool = {
    query: mockQuery,
    end: jest.fn()
  };
  return { Pool: jest.fn(() => mockPool) };
});

const { Pool } = require('pg');

describe('Posts Router Unit Tests', () => {
  let app;
  let mockPool;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/posts', postsRouter);
    
    mockPool = new Pool();
    jest.clearAllMocks();
  });

  describe('GET /api/posts', () => {
    it('should return all posts successfully', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Test Post 1',
          content: 'Test content 1',
          author: 'Test Author',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          title: 'Test Post 2',
          content: 'Test content 2',
          author: 'Test Author 2',
          created_at: '2023-01-02T00:00:00.000Z',
          updated_at: '2023-01-02T00:00:00.000Z'
        }
      ];

      mockPool.query.mockResolvedValue({ rows: mockPosts });

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toEqual(mockPosts);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id, title, content, author, created_at, updated_at FROM posts ORDER BY created_at DESC'
      );
    });

    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/posts')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch posts' });
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a single post successfully', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        author: 'Test Author',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      };

      mockPool.query.mockResolvedValue({ rows: [mockPost] });

      const response = await request(app)
        .get('/api/posts/1')
        .expect(200);

      expect(response.body).toEqual(mockPost);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id, title, content, author, created_at, updated_at FROM posts WHERE id = $1',
        ['1']
      );
    });

    it('should return 404 when post not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/posts/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Post not found' });
    });

    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/posts/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch post' });
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post successfully', async () => {
      const newPost = {
        title: 'New Post',
        content: 'New content',
        author: 'New Author'
      };

      const createdPost = {
        id: 3,
        ...newPost,
        created_at: '2023-01-03T00:00:00.000Z',
        updated_at: '2023-01-03T00:00:00.000Z'
      };

      mockPool.query.mockResolvedValue({ rows: [createdPost] });

      const response = await request(app)
        .post('/api/posts')
        .send(newPost)
        .expect(201);

      expect(response.body).toEqual(createdPost);
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO posts (title, content, author) VALUES ($1, $2, $3) RETURNING id, title, content, author, created_at, updated_at',
        [newPost.title, newPost.content, newPost.author]
      );
    });

    it('should return 400 when required fields are missing', async () => {
      const incompletePost = {
        title: 'Incomplete Post'
        // missing content and author
      };

      const response = await request(app)
        .post('/api/posts')
        .send(incompletePost)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Title, content, and author are required'
      });
    });

    it('should return 400 when title is missing', async () => {
      const incompletePost = {
        content: 'Some content',
        author: 'Some author'
        // missing title
      };

      const response = await request(app)
        .post('/api/posts')
        .send(incompletePost)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Title, content, and author are required'
      });
    });

    it('should return 400 when content is missing', async () => {
      const incompletePost = {
        title: 'Some title',
        author: 'Some author'
        // missing content
      };

      const response = await request(app)
        .post('/api/posts')
        .send(incompletePost)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Title, content, and author are required'
      });
    });

    it('should return 400 when author is missing', async () => {
      const incompletePost = {
        title: 'Some title',
        content: 'Some content'
        // missing author
      };

      const response = await request(app)
        .post('/api/posts')
        .send(incompletePost)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Title, content, and author are required'
      });
    });

    it('should handle database errors', async () => {
      const newPost = {
        title: 'New Post',
        content: 'New content',
        author: 'New Author'
      };

      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/posts')
        .send(newPost)
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to create post' });
    });
  });
});
