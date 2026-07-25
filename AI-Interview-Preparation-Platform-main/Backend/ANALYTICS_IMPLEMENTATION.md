# Interview Analytics API - Implementation Guide

## Overview
The Interview Analytics API provides comprehensive analytics and insights for interview preparation. Users can track their performance, identify strengths and weaknesses, monitor progress over time, and get personalized recommendations.

## Features

### 1. **Overall Performance**
- Total number of interview attempts
- Average score across all attempts
- Best and worst scores achieved
- Progress percentage (improvement from first to last attempt)

### 2. **Strengths & Weaknesses Analysis**
- Identification of strong areas (score >= 7)
- Identification of weak areas (score < 7)
- Average metrics breakdown (relevance, clarity, completeness, confidence)
- Sentiment analysis of responses
- Personalized recommendations for improvement

### 3. **Average Scores**
- Scores grouped by interview role and difficulty level
- Attempt count per role/level combination
- Min/max scores per role/level

### 4. **Total Attempts**
- Total interview attempts
- Breakdown by role
- Breakdown by difficulty level

### 5. **Additional Features**
- Score trends over time with detailed metrics
- Comprehensive dashboard with all analytics in one request
- Pagination support for trend data

## Project Structure

```
Backend/
├── src/
│   ├── controllers/
│   │   ├── analyticsController.js      (NEW - Analytics endpoints)
│   │   └── interviewController.js      (Existing - Updated with analytics)
│   ├── services/
│   │   ├── analytics.service.js        (NEW - Analytics business logic)
│   │   └── ai.service.js               (Existing)
│   ├── routes/
│   │   ├── analytics.routes.js         (NEW - Analytics routes)
│   │   ├── interview.routes.js         (Existing)
│   │   ├── auth.routes.js              (Existing)
│   │   └── admin.routes.js             (Existing)
│   ├── models/
│   │   ├── Score.js                    (Existing - Score model)
│   │   ├── Interview.js                (Existing)
│   │   └── User.js                     (Existing)
│   ├── middleware/
│   │   └── authMiddleware.js           (Existing)
│   └── app.js                          (Updated - Added analytics routes)
└── package.json

Tools/
└── test_analytics.js                   (NEW - Testing script)

Documentation/
└── ANALYTICS_API_DOCUMENTATION.md      (NEW - API documentation)
```

## API Endpoints

### Base URL
```
/api/analytics
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overview` | Get overall performance metrics |
| GET | `/strengths-weaknesses` | Get strengths/weaknesses analysis |
| GET | `/scores-by-role` | Get average scores by role and level |
| GET | `/total-attempts` | Get total attempts grouped by type |
| GET | `/scores-trend?limit=20` | Get score trends over time |
| GET | `/dashboard` | Get comprehensive analytics dashboard |

## Data Flow

```
User Request
    ↓
Authentication Middleware (protect)
    ↓
Analytics Controller
    ↓
Analytics Service
    ↓
Database Queries (Score, Interview models)
    ↓
Data Processing & Aggregation
    ↓
Response to Client
```

## Key Metrics Explanation

### Relevance Score
- Measures how relevant and on-topic the answer is to the question
- Higher scores indicate better understanding of the question

### Clarity Score
- Measures how clearly the answer is explained
- Includes organization, structure, and language clarity

### Completeness Score
- Measures how thoroughly the question is answered
- Includes coverage of all important points

### Confidence Score
- Measures the confidence level during the answer delivery
- Based on tone, pace, and certainty of response

### Overall Score
- Weighted average of all four metrics
- Range: 0-10

## Implementation Details

### Authentication
All endpoints require JWT authentication via the `protect` middleware. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

### Error Handling
- 401: Unauthorized (invalid/missing token)
- 404: No data available
- 500: Server error

### Response Format
All successful responses follow this format:
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ }
}
```

### Performance Optimization
- Dashboard endpoint uses `Promise.all()` for parallel queries
- Trend data supports pagination via `limit` query parameter
- Aggregations are done at the service layer for better performance

## Usage Examples

### JavaScript/Axios
```javascript
import axios from 'axios';

const token = 'your_jwt_token';
const headers = { 'Authorization': `Bearer ${token}` };

// Get overall performance
const performance = await axios.get(
  'http://localhost:5000/api/analytics/overview',
  { headers }
);

// Get comprehensive dashboard
const dashboard = await axios.get(
  'http://localhost:5000/api/analytics/dashboard',
  { headers }
);

// Get scores trend with limit
const trend = await axios.get(
  'http://localhost:5000/api/analytics/scores-trend?limit=10',
  { headers }
);
```

### Frontend Integration Example
```javascript
// React Hook Example
import { useEffect, useState } from 'react';

function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          'http://localhost:5000/api/analytics/dashboard',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const data = await response.json();
        setAnalytics(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Performance: {analytics.overallPerformance.averageScore}%</h2>
      <p>Attempts: {analytics.overallPerformance.totalAttempts}</p>
      <p>Progress: {analytics.overallPerformance.progress}%</p>
      
      <h3>Strengths</h3>
      <ul>
        {analytics.strengthsAndWeaknesses.strengths.map(s => (
          <li key={s.metric}>{s.metric}: {s.score}</li>
        ))}
      </ul>
      
      <h3>Areas for Improvement</h3>
      <ul>
        {analytics.strengthsAndWeaknesses.weaknesses.map(w => (
          <li key={w.metric}>{w.metric}: {w.score}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Testing

### Running Tests
```bash
# Set your JWT token
set TEST_TOKEN=your_jwt_token

# Run tests
node tools/test_analytics.js
```

### Manual Testing with cURL
```bash
# Get overall performance
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/analytics/overview

# Get dashboard
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/analytics/dashboard
```

## Requirements

### Backend Dependencies (Already Installed)
- Express.js - Web framework
- Mongoose - MongoDB ODM
- axios - HTTP client

### New Dependencies
None required (uses existing dependencies)

## Future Enhancements

1. **Export Analytics** - Export analytics data as PDF/CSV
2. **Benchmarking** - Compare user performance with global averages
3. **Goal Setting** - Set performance goals and track progress
4. **Advanced Filtering** - Filter analytics by date range, role, level
5. **Predictive Analytics** - Predict user performance based on trends
6. **Comparison Reports** - Compare performance across different roles
7. **Mobile App Support** - Optimize for mobile viewing
8. **Real-time Notifications** - Alert users on performance milestones

## Troubleshooting

### Issue: "No data available" error
**Solution:** User must complete at least one interview and have scores saved. Make sure to submit answers via the `/api/interviews/answer` endpoint first.

### Issue: Empty strengths/weaknesses
**Solution:** This occurs when all metrics are above or below the threshold. The API returns empty arrays in this case, which is expected behavior.

### Issue: Trend data is empty
**Solution:** User must have multiple attempts. Ensure several interviews have been completed and scored.

### Issue: 401 Unauthorized
**Solution:** 
- Check that JWT token is valid and not expired
- Verify token is included in Authorization header
- Format: `Bearer <token>` (with space between Bearer and token)

## Database Relationships

```
User (1) ──────── (Many) Interview
          │
          └────── (Many) Score
                    │
                    └─── references Interview
                    └─── references User

Score Fields Used:
- relevance: Number
- clarity: Number
- completeness: Number
- confidence: Number
- sentiment: String
- overallScore: Number
- createdAt: Date
- interview: ObjectId (ref: Interview)
- user: ObjectId (ref: User)

Interview Fields Used:
- role: String
- level: String
- user: ObjectId (ref: User)
- createdAt: Date
```

## Support and Contact

For issues, questions, or feature requests, please contact the development team or open an issue in the project repository.

---

**Last Updated:** January 28, 2026
**Version:** 1.0.0
**Status:** Production Ready
