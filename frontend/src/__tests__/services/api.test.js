import axios from 'axios';
import { postsAPI } from '../services/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('postsAPI.getAllPosts', () => {
    it('should fetch all posts successfully', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Test Post 1',
          content: 'Test content 1',
          author: 'Test Author',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z'
        }
      ];

      mockedAxios.get.mockResolvedValue({ data: mockPosts });

      const result = await postsAPI.getAllPosts();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/posts');
      expect(result).toEqual(mockPosts);
    });

    it('should handle API errors', async () => {
      const errorMessage = 'Network Error';
      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      await expect(postsAPI.getAllPosts()).rejects.toThrow(errorMessage);
    });
  });

  describe('postsAPI.getPostById', () => {
    it('should fetch a single post successfully', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        author: 'Test Author',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      };

      mockedAxios.get.mockResolvedValue({ data: mockPost });

      const result = await postsAPI.getPostById(1);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/posts/1');
      expect(result).toEqual(mockPost);
    });

    it('should handle API errors for single post', async () => {
      const errorMessage = 'Post not found';
      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      await expect(postsAPI.getPostById(999)).rejects.toThrow(errorMessage);
    });
  });

  describe('postsAPI.createPost', () => {
    it('should create a new post successfully', async () => {
      const newPost = {
        title: 'New Post',
        content: 'New content',
        author: 'New Author'
      };

      const createdPost = {
        id: 2,
        ...newPost,
        created_at: '2023-01-02T00:00:00.000Z',
        updated_at: '2023-01-02T00:00:00.000Z'
      };

      mockedAxios.post.mockResolvedValue({ data: createdPost });

      const result = await postsAPI.createPost(newPost);

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/posts', newPost);
      expect(result).toEqual(createdPost);
    });

    it('should handle validation errors', async () => {
      const invalidPost = {
        title: 'Incomplete Post'
        // missing content and author
      };

      const errorResponse = {
        response: {
          status: 400,
          data: { error: 'Title, content, and author are required' }
        }
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(postsAPI.createPost(invalidPost)).rejects.toEqual(errorResponse);
    });

    it('should handle server errors', async () => {
      const newPost = {
        title: 'New Post',
        content: 'New content',
        author: 'New Author'
      };

      const errorResponse = {
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        }
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(postsAPI.createPost(newPost)).rejects.toEqual(errorResponse);
    });
  });
});
