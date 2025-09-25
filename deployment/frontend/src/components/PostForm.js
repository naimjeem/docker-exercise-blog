import React, { useState } from 'react';

const PostForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: ''
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.author.trim()
    ) {
      alert('Please fill in all fields');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <button className='btn btn-secondary' onClick={onCancel}>
          ← Back to Posts
        </button>
      </div>

      <div className='card'>
        <h2>Create New Post</h2>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='title'>Title</label>
            <input
              type='text'
              id='title'
              name='title'
              value={formData.title}
              onChange={handleChange}
              placeholder='Enter post title'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='author'>Author</label>
            <input
              type='text'
              id='author'
              name='author'
              value={formData.author}
              onChange={handleChange}
              placeholder='Enter your name'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='content'>Content</label>
            <textarea
              id='content'
              name='content'
              value={formData.content}
              onChange={handleChange}
              placeholder='Write your post content here...'
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type='submit' className='btn'>
              Create Post
            </button>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;
