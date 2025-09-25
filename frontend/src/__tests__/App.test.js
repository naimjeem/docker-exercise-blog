import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { postsAPI } from '../services/api';

// Mock the API service
jest.mock('../services/api', () => ({
  postsAPI: {
    getAllPosts: jest.fn(),
    getPostById: jest.fn(),
    createPost: jest.fn()
  }
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the header correctly', async () => {
    postsAPI.getAllPosts.mockResolvedValue([]);

    render(<App />);

    expect(screen.getByText('🐳 Docker Blog Platform')).toBeInTheDocument();
    expect(screen.getByText('A multi-service blog platform demonstrating Docker Compose concepts')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    postsAPI.getAllPosts.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<App />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays posts when loaded successfully', async () => {
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

    postsAPI.getAllPosts.mockResolvedValue(mockPosts);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Test Author 2')).toBeInTheDocument();
  });

  it('displays error message when posts fail to load', async () => {
    postsAPI.getAllPosts.mockRejectedValue(new Error('API Error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch posts. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows create post form when create button is clicked', async () => {
    postsAPI.getAllPosts.mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Create New Post')).toBeInTheDocument();
    });

    // Click create button
    const createButton = screen.getByText('Create New Post');
    createButton.click();

    await waitFor(() => {
      expect(screen.getByText('Create Post')).toBeInTheDocument();
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Content')).toBeInTheDocument();
      expect(screen.getByLabelText('Author')).toBeInTheDocument();
    });
  });
});
