# 🎯 AI Interview Preparation Platform

An intelligent interview preparation system powered by AI/NLP that provides real-time feedback, scoring, and analytics for candidates.

## 🌐 Live Demo

- **Frontend**: https://ai-interview-platform-mu-nine.vercel.app
- **Backend API**: https://ai-interview-platform-c8f2.onrender.com
- **AI Service**: https://ai-interview-ai-service.onrender.com

## 🔐 Admin Credentials

```
Email: admin@test.com
Password: admin123
Role: admin
```

## ✨ Features

### Core Features
- ✅ AI-powered interview simulation (text-based)
- ✅ Real-time NLP answer evaluation
- ✅ Sentiment analysis and scoring (0-10 scale)
- ✅ Multi-metric assessment (relevance, clarity, completeness, confidence)
- ✅ Personalized candidate feedback dashboard
- ✅ Interview history and progress tracking
- ✅ Advanced analytics with interactive charts

### Admin Features
- ✅ Admin panel with Role-Based Access Control (RBAC)
- ✅ User management (view, delete users)
- ✅ Interview monitoring and analytics
- ✅ System-wide statistics and insights

## 🏗️ System Architecture

```
┌─────────────────┐
│  Frontend (UI)  │  ← Vercel (HTML/CSS/JS + Chart.js)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │  ← Render (Node.js + Express + MongoDB)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI/NLP Service │  ← Render (Python + FastAPI)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ MongoDB Atlas   │  ← Database
└─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Chart.js for data visualization
- Responsive design (mobile-friendly)

### Backend
- Node.js v18+
- Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing

### AI/NLP Service
- Python 3.12+
- FastAPI
- Natural Language Processing libraries
- Sentiment analysis models

### Deployment
- Frontend: Vercel
- Backend: Render
- AI Service: Render
- Database: MongoDB Atlas

## 📦 Installation & Setup

### Prerequisites
- Node.js v18 or higher
- Python 3.12 or higher
- MongoDB Atlas account
- Git

### 1. Clone Repository
```bash
git clone https://github.com/Moharganguly/AI-Interview-Platform.git
cd AI-Interview-Platform
```

### 2. Backend Setup
```bash
cd Backend
npm install

# Create .env file
echo "MONGODB_URI=your_mongodb_connection_string" > .env
echo "JWT_SECRET=your_secret_key" >> .env
echo "PORT=5000" >> .env

# Run backend
npm run dev
```

### 3. AI Service Setup
```bash
cd ../ai-service
pip install -r requirements.txt

# Run AI service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend Setup
```bash
cd ../frontend

# Update config.js with your API URLs
# Then serve with any static server:
python -m http.server 3000
```

## 📚 API Documentation

### Authentication Endpoints

**Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { "token": "jwt_token", "user": {...} }
```

### Interview Endpoints

**Create Interview**
```http
POST /api/interviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "Software Engineer",
  "level": "medium",
  "questions": [
    {
      "questionText": "Explain REST APIs",
      "modelAnswer": "REST is..."
    }
  ]
}
```

**Submit Answer**
```http
POST /api/interviews/answer
Authorization: Bearer {token}

{
  "interviewId": "interview_id",
  "question": "question_id",
  "answerText": "Your answer here"
}
```

### Analytics Endpoints

**Get Dashboard Analytics**
```http
GET /api/analytics/dashboard
Authorization: Bearer {token}

Response: {
  "overallPerformance": {...},
  "strengthsAndWeaknesses": {...},
  "scoresByRoleAndLevel": {...}
}
```

### Admin Endpoints

**Get All Users** (Admin Only)
```http
GET /api/admin/users
Authorization: Bearer {admin_token}
```

**Get All Interviews** (Admin Only)
```http
GET /api/admin/interviews
Authorization: Bearer {admin_token}
```

**Delete User** (Admin Only)
```http
DELETE /api/admin/users/{userId}
Authorization: Bearer {admin_token}
```

## 🧠 AI/NLP Evaluation Logic

See [AI_LOGIC.md](./AI_LOGIC.md) for detailed explanation of the NLP evaluation approach.

## 🗄️ Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete database structure.

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step deployment instructions.

## 📊 Project Structure

```
AI-Interview-Platform/
├── frontend/              # Frontend application
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   ├── index.html        # Login page
│   ├── dashboard.html    # Candidate dashboard
│   └── admin-dashboard.html  # Admin panel
├── Backend/              # Node.js backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   ├── services/     # Business logic
│   │   └── config/       # Configuration
│   └── package.json
├── ai-service/           # Python AI service
│   ├── main.py          # FastAPI app
│   ├── routes/          # API routes
│   ├── services/        # NLP logic
│   └── requirements.txt
├── README.md            # This file
├── AI_LOGIC.md          # NLP approach documentation
├── DATABASE_SCHEMA.md   # Database structure
└── DEPLOYMENT.md        # Deployment guide
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-Based Access Control (RBAC)
- CORS configuration
- Environment variable protection
- Input validation and sanitization



**Developer**: Mohar Ganguly
**GitHub**: https://github.com/Moharganguly

## 📄 License

This project is for educational and assessment purposes.

## 🙏 Acknowledgments

- Built as part of an interview preparation platform project
- Uses Chart.js for data visualization
- Deployed on Vercel and Render
