import React from 'react';

const PostList = ({ posts, onPostSelect, onShowForm }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Blog Posts</h2>
        <button className="btn" onClick={onShowForm}>
          + Create New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="card">
          <p>No posts available. Create your first post!</p>
        </div>
      ) : (
        <div className="grid">
          {posts.map((post) => (
            <div key={post.id} className="card" onClick={() => onPostSelect(post)} style={{ cursor: 'pointer' }}>
              <h3>{post.title}</h3>
              <div className="post-meta">
                By {post.author} • {formatDate(post.created_at)}
              </div>
              <p>{post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}</p>
              <div style={{ marginTop: '1rem', color: '#667eea', fontWeight: '600' }}>
                Read more →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList;

