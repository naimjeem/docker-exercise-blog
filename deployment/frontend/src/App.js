import React, { useState, useEffect } from 'react';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import PostForm from './components/PostForm';
import { postsAPI } from './services/api';

function App() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postsAPI.getAllPosts();
      setPosts(data);
    } catch (err) {
      setError('Failed to fetch posts. Please try again.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single post (currently unused but kept for future use)
  // const fetchPost = async id => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const data = await postsAPI.getPostById(id);
  //     setSelectedPost(data);
  //   } catch (err) {
  //     setError('Failed to fetch post. Please try again.');
  //     console.error('Error fetching post:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Create new post
  const createPost = async postData => {
    try {
      setError(null);
      const newPost = await postsAPI.createPost(postData);
      setPosts([newPost, ...posts]);
      setShowForm(false);
      setSuccess('Post created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error('Error creating post:', err);
    }
  };

  // Handle post selection
  const handlePostSelect = post => {
    setSelectedPost(post);
    setShowForm(false);
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedPost(null);
    setShowForm(false);
  };

  // Handle show form
  const handleShowForm = () => {
    setShowForm(true);
    setSelectedPost(null);
  };

  // Load posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className='App'>
      <header className='header'>
        <div className='container'>
          <h1>🐳 Docker Blog Platform</h1>
          <p>
            A multi-service blog platform demonstrating Docker Compose concepts
          </p>
        </div>
      </header>

      <main className='main-content'>
        <div className='container'>
          {error && <div className='error'>{error}</div>}
          {success && <div className='success'>{success}</div>}

          {loading && (
            <div className='loading'>
              <p>Loading...</p>
            </div>
          )}

          {!loading && !selectedPost && !showForm && (
            <PostList
              posts={posts}
              onPostSelect={handlePostSelect}
              onShowForm={handleShowForm}
            />
          )}

          {!loading && selectedPost && !showForm && (
            <PostDetail post={selectedPost} onBack={handleBackToList} />
          )}

          {!loading && showForm && (
            <PostForm onSubmit={createPost} onCancel={handleBackToList} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
