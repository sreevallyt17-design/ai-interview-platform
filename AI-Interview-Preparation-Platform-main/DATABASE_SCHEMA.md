# 🗄️ Database Schema Documentation

## Overview

The AI Interview Preparation Platform uses **MongoDB Atlas** as its primary database, leveraging a NoSQL document-based approach for flexibility and scalability.

**Database Name:** `ai-interview-platform`

## Collections

### 1. Users Collection

**Purpose:** Store user account information and authentication data

```javascript
{
  _id: ObjectId("697bb303d2f63702ed9ea3b6"),
  name: String,           // User's full name
  email: String,          // Unique email address
  password: String,       // Hashed with bcrypt
  role: String,          // "candidate" or "admin"
  createdAt: Date,       // Account creation timestamp
  updatedAt: Date        // Last modification timestamp
}
```

**Indexes:**
```javascript
{
  email: 1  // Unique index for fast lookup and uniqueness
}
```

**Example Document:**
```json
{
  "_id": "697bb303d2f63702ed9ea3b6",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2b$10$XOPbrlUPQdwdJUpSrIF6X.LBjCQ9bxmPQNHfLPVcPPZGYLB0NqvkS",
  "role": "candidate",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Validation Rules:**
- `email`: Must be unique, valid email format
- `password`: Minimum 6 characters (stored as bcrypt hash)
- `role`: Must be either "candidate" or "admin"
- `name`: Required, minimum 2 characters

---

### 2. Interviews Collection

**Purpose:** Store interview sessions and questions

```javascript
{
  _id: ObjectId("interview_id"),
  user: ObjectId,              // Reference to Users collection
  role: String,                // Job role (e.g., "Software Engineer")
  level: String,               // Difficulty: "easy", "medium", "hard"
  questions: [                 // Array of question objects
    {
      questionText: String,    // The interview question
      modelAnswer: String      // Expected/ideal answer
    }
  ],
  status: String,              // "in-progress", "completed", "abandoned"
  overallScore: Number,        // Final score (0-10)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
{
  user: 1,                     // For user-specific queries
  createdAt: -1,               // For chronological ordering
  "user_1_createdAt_-1": 1    // Compound index
}
```

**Example Document:**
```json
{
  "_id": "65a7c8b9d3e5f1a2b3c4d5e6",
  "user": "697bb303d2f63702ed9ea3b6",
  "role": "Software Engineer",
  "level": "medium",
  "questions": [
    {
      "questionText": "Explain the difference between REST and GraphQL",
      "modelAnswer": "REST is an architectural style using standard HTTP methods..."
    },
    {
      "questionText": "What is the SOLID principle?",
      "modelAnswer": "SOLID is an acronym for five design principles..."
    }
  ],
  "status": "completed",
  "overallScore": 7.5,
  "createdAt": "2025-02-10T14:20:00.000Z",
  "updatedAt": "2025-02-10T14:45:00.000Z"
}
```

**Validation Rules:**
- `user`: Must reference existing user
- `role`: Required, string
- `level`: Must be "easy", "medium", or "hard"
- `questions`: At least 1 question required
- `overallScore`: Optional, range 0-10

---

### 3. Scores Collection

**Purpose:** Store individual answer evaluations and metrics

```javascript
{
  _id: ObjectId("score_id"),
  user: ObjectId,              // Reference to Users collection
  interview: ObjectId,         // Reference to Interviews collection
  questionId: String,          // ID of the question answered
  answerText: String,          // Candidate's answer
  relevance: Number,           // Score 0-10
  clarity: Number,             // Score 0-10
  completeness: Number,        // Score 0-10
  confidence: Number,          // Score 0-10
  overallScore: Number,        // Weighted average score
  sentiment: String,           // "positive", "neutral", "negative"
  feedback: {
    strengths: [String],       // Array of strengths
    weaknesses: [String],      // Array of weaknesses
    recommendations: [String]  // Improvement suggestions
  },
  createdAt: Date
}
```

**Indexes:**
```javascript
{
  user: 1,
  interview: 1,
  createdAt: -1,
  "user_1_interview_1": 1    // Compound index
}
```

**Example Document:**
```json
{
  "_id": "65a7c9d4e5f6a1b2c3d4e5f7",
  "user": "697bb303d2f63702ed9ea3b6",
  "interview": "65a7c8b9d3e5f1a2b3c4d5e6",
  "questionId": "q1",
  "answerText": "REST and GraphQL are both API design approaches...",
  "relevance": 8.5,
  "clarity": 7.0,
  "completeness": 8.0,
  "confidence": 6.5,
  "overallScore": 7.6,
  "sentiment": "positive",
  "feedback": {
    "strengths": [
      "Highly relevant to the question",
      "Comprehensive coverage of key concepts"
    ],
    "weaknesses": [
      "Could sound more confident",
      "Some minor clarity issues"
    ],
    "recommendations": [
      "Use more definitive language",
      "Structure your answer in clear sections"
    ]
  },
  "createdAt": "2025-02-10T14:25:00.000Z"
}
```

**Validation Rules:**
- All score fields: 0-10 range
- `sentiment`: Must be "positive", "neutral", or "negative"
- `answerText`: Required, minimum 10 characters

---

### 4. Questions Collection (Optional)

**Purpose:** Question bank for dynamic interview generation

```javascript
{
  _id: ObjectId("question_id"),
  role: String,                // Job role category
  level: String,               // Difficulty level
  questionText: String,        // The question
  modelAnswer: String,         // Ideal answer
  category: String,            // "technical", "behavioral", "situational"
  tags: [String],             // Keywords for filtering
  createdBy: ObjectId,        // Admin who created it
  createdAt: Date,
  isActive: Boolean           // For soft delete
}
```

**Example Document:**
```json
{
  "_id": "65a7ca1b2c3d4e5f6a7b8c9d",
  "role": "Software Engineer",
  "level": "medium",
  "questionText": "Explain database indexing",
  "modelAnswer": "Database indexing is a technique...",
  "category": "technical",
  "tags": ["database", "performance", "optimization"],
  "createdBy": "admin_id",
  "createdAt": "2025-01-20T09:00:00.000Z",
  "isActive": true
}
```

---

## Relationships

### Entity Relationship Diagram

```
┌──────────┐
│  Users   │
└────┬─────┘
     │
     │ 1:N
     │
┌────▼──────────┐
│  Interviews   │
└────┬──────────┘
     │
     │ 1:N
     │
┌────▼─────┐
│  Scores  │
└──────────┘
```

### Relationship Details

1. **User → Interviews** (One-to-Many)
   - One user can have multiple interview sessions
   - Each interview belongs to exactly one user

2. **Interview → Scores** (One-to-Many)
   - One interview contains multiple questions
   - Each question gets one score entry

3. **User → Scores** (One-to-Many)
   - One user accumulates many scores over time
   - Used for analytics and progress tracking

---

## Data Flow

### Interview Creation Flow
```
1. User logs in → JWT token issued
2. User creates interview → Interview document created
3. Questions embedded in Interview document
4. Interview status: "in-progress"
```

### Answer Submission Flow
```
1. User submits answer
2. AI service evaluates answer
3. Score document created with metrics
4. Interview document updated (if complete)
```

### Analytics Aggregation Flow
```
1. Query all Scores for user
2. Aggregate by metrics
3. Calculate trends and averages
4. Return dashboard data
```

---

## Mongoose Schemas

### User Schema
```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['candidate', 'admin'],
    default: 'candidate'
  }
}, {
  timestamps: true
});

// Pre-save hook for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### Interview Schema
```javascript
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  modelAnswer: { type: String, required: true }
});

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  questions: [questionSchema],
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 10
  }
}, {
  timestamps: true
});
```

---

## Database Optimization

### Indexing Strategy
```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true });

// Interviews collection
db.interviews.createIndex({ user: 1, createdAt: -1 });
db.interviews.createIndex({ status: 1 });

// Scores collection
db.scores.createIndex({ user: 1, createdAt: -1 });
db.scores.createIndex({ interview: 1 });
```

### Query Optimization
- Use projections to limit returned fields
- Leverage indexes for sorting
- Use aggregation pipelines for complex analytics

---

## Backup & Recovery

### Backup Strategy
- **Frequency:** Daily automated backups via MongoDB Atlas
- **Retention:** 30 days
- **Point-in-Time Recovery:** Available

### Disaster Recovery
- Multi-region replication
- Automatic failover
- RPO: 1 hour
- RTO: 15 minutes

---

## Security Measures

1. **Encryption at Rest:** All data encrypted using AES-256
2. **Encryption in Transit:** TLS 1.2+ for all connections
3. **Access Control:** IP whitelisting, VPC peering
4. **Password Security:** Bcrypt with salt rounds = 10
5. **JWT Tokens:** 24-hour expiration

---

## Monitoring & Performance

### Key Metrics
- Query response time: < 100ms (P95)
- Collection sizes monitored
- Index efficiency tracked
- Connection pool utilization

### Alerts
- Slow query detection (> 1000ms)
- High memory usage (> 80%)
- Connection errors
- Replication lag

---

## Scaling Strategy

### Horizontal Scaling
- MongoDB sharding enabled
- Shard key: `user._id`
- Replica set: 3 nodes

### Vertical Scaling
- Current: M10 cluster (2GB RAM)
- Upgrade path: M20, M30 as needed

---

## Data Retention Policy

| Collection | Retention Period | Archive Strategy |
|-----------|------------------|------------------|
| Users | Indefinite | N/A |
| Interviews | 2 years | Move to cold storage |
| Scores | 2 years | Move to cold storage |
| Questions | Indefinite | Version control |

---

**Database Version:** MongoDB 7.0  
**Mongoose Version:** 7.6.x  
**Last Updated:** February 2026
