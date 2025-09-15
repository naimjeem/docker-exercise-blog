import React from 'react';

const PostDetail = ({ post, onBack }) => {
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
      <div style={{ marginBottom: '2rem' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Posts
        </button>
      </div>

      <div className="card">
        <h1>{post.title}</h1>
        <div className="post-meta">
          By {post.author} • {formatDate(post.created_at)}
        </div>
        <div className="post-content">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} style={{ marginBottom: '1rem' }}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

