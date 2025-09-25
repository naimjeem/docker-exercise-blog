import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users over 2 minutes
    { duration: '5m', target: 10 }, // Stay at 10 users for 5 minutes
    { duration: '2m', target: 20 }, // Ramp up to 20 users over 2 minutes
    { duration: '5m', target: 20 }, // Stay at 20 users for 5 minutes
    { duration: '2m', target: 0 },  // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
    errors: ['rate<0.1'],             // Custom error rate must be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  // Test health endpoint
  const healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
    'health check contains status OK': (r) => r.json('status') === 'OK',
  });
  errorRate.add(healthResponse.status !== 200);

  sleep(1);

  // Test get all posts endpoint
  const postsResponse = http.get(`${BASE_URL}/api/posts`);
  check(postsResponse, {
    'posts endpoint status is 200': (r) => r.status === 200,
    'posts endpoint response time < 200ms': (r) => r.timings.duration < 200,
    'posts endpoint returns array': (r) => Array.isArray(r.json()),
  });
  errorRate.add(postsResponse.status !== 200);

  sleep(1);

  // Test get single post endpoint (if posts exist)
  if (postsResponse.status === 200 && postsResponse.json().length > 0) {
    const firstPostId = postsResponse.json()[0].id;
    const singlePostResponse = http.get(`${BASE_URL}/api/posts/${firstPostId}`);
    check(singlePostResponse, {
      'single post status is 200': (r) => r.status === 200,
      'single post response time < 150ms': (r) => r.timings.duration < 150,
      'single post has required fields': (r) => {
        const post = r.json();
        return post.id && post.title && post.content && post.author;
      },
    });
    errorRate.add(singlePostResponse.status !== 200);
  }

  sleep(1);

  // Test create post endpoint (with realistic data)
  const newPost = {
    title: `Performance Test Post ${Math.random().toString(36).substr(2, 9)}`,
    content: 'This is a test post created during performance testing. It contains some sample content to simulate real-world usage patterns.',
    author: 'Performance Tester'
  };

  const createResponse = http.post(`${BASE_URL}/api/posts`, JSON.stringify(newPost), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(createResponse, {
    'create post status is 201': (r) => r.status === 201,
    'create post response time < 300ms': (r) => r.timings.duration < 300,
    'create post returns created post': (r) => {
      const createdPost = r.json();
      return createdPost.title === newPost.title && 
             createdPost.content === newPost.content && 
             createdPost.author === newPost.author;
    },
  });
  errorRate.add(createResponse.status !== 201);

  sleep(2);
}

export function handleSummary(data) {
  return {
    'performance-results.json': JSON.stringify(data, null, 2),
    stdout: `
    ========================
    Performance Test Results
    ========================
    
    Total Requests: ${data.metrics.http_reqs.values.count}
    Failed Requests: ${data.metrics.http_req_failed.values.count}
    Error Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
    
    Response Times:
    - Average: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
    - 95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
    - 99th Percentile: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms
    
    Requests per Second: ${data.metrics.http_reqs.values.rate.toFixed(2)}
    
    Thresholds:
    - Response Time (95th percentile): ${data.metrics.http_req_duration.values['p(95)'] < 500 ? 'PASS' : 'FAIL'} (< 500ms)
    - Error Rate: ${data.metrics.http_req_failed.values.rate < 0.1 ? 'PASS' : 'FAIL'} (< 10%)
    `,
  };
}
