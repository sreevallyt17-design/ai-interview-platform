@"
# 🚀 Deployment Guide

## Architecture

### Production Stack
- **Frontend:** Vercel (Static Hosting)
- **Backend API:** Render (Node.js + Express)
- **AI Service:** Render (Python + FastAPI)
- **Database:** MongoDB Atlas (Cloud Database)

---

## 🌐 Live URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | https://ai-interview-platform-mu-nine.vercel.app | ✅ Live |
| Backend API | https://ai-interview-platform-c8f2.onrender.com | ✅ Live |
| AI Service | https://ai-interview-ai-service.onrender.com | ✅ Live |
| Database | MongoDB Atlas (Private) | ✅ Connected |

---

## 📦 Environment Variables

### Backend (Render)
\`\`\`
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/test
JWT_SECRET=your_secret_key_here
AI_SERVICE_URL=https://ai-interview-ai-service.onrender.com
PORT=5000
NODE_ENV=production
\`\`\`

### AI Service (Render)
\`\`\`
PORT=8000
\`\`\`

### Frontend (Vercel)
\`\`\`
No environment variables needed (API URL in config.js)
\`\`\`

---

## 🔧 Deployment Steps

### 1. Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Root Directory: \`frontend\`
3. Framework Preset: Other
4. Build Command: (none)
5. Output Directory: (root)
6. Auto-deploys on push to main branch

### 2. Backend (Render)
1. Create new Web Service
2. Connect GitHub repository
3. Root Directory: \`Backend\`
4. Build Command: \`npm install\`
5. Start Command: \`node src/server.js\`
6. Add environment variables
7. Auto-deploys on push to main branch

### 3. AI Service (Render)
1. Create new Web Service
2. Connect GitHub repository
3. Root Directory: \`ai-service\`
4. Runtime: Python 3
5. Build Command: \`pip install -r requirements.txt\`
6. Start Command: \`uvicorn main:app --host 0.0.0.0 --port 8000\`
7. Auto-deploys on push to main branch

### 4. Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Add database user
3. Whitelist all IPs (0.0.0.0/0)
4. Copy connection string
5. Add to Render environment variables

---

## 🔒 Security Configuration

### CORS (Backend)
\`\`\`javascript
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
\`\`\`

### MongoDB Network Access
- Allow access from anywhere: \`0.0.0.0/0\`
- For production: Whitelist specific IPs

---

## 📊 Monitoring

### Health Check Endpoints
- Backend: \`/health\`
- AI Service: \`/health\`

### Logs
- Render Dashboard → Logs tab
- Real-time log streaming available

---

## 💰 Scaling & Pricing

### Free Tier (Current)
- Vercel: Unlimited bandwidth
- Render: 750 hours/month per service
- MongoDB: 512MB storage

### Paid Plans (If Needed)
- Render: \$7/month per service (always-on)
- MongoDB: \$9/month (2GB storage)
- Vercel: Free for personal projects

---

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
- Check connection string format
- Verify password is correct
- Ensure 0.0.0.0/0 is whitelisted

**2. CORS Errors**
- Add Vercel URL to CORS origins
- Check credentials: true

**3. Service Sleeping (Free Tier)**
- First request takes 30-60s
- Upgrade to paid plan for always-on

**4. Environment Variables Not Loading**
- Verify variable names exactly match
- Redeploy service after changes

---

## 🔄 CI/CD Pipeline

### Automatic Deployment Flow
\`\`\`
1. Push code to GitHub main branch
   ↓
2. Vercel detects change → Deploys frontend (1-2 min)
   ↓
3. Render detects change → Deploys backend (2-3 min)
   ↓
4. Render detects change → Deploys AI service (2-3 min)
   ↓
5. All services live with new code
\`\`\`

---

## 📝 Deployment Checklist

- [ ] All services deployed
- [ ] Environment variables set
- [ ] MongoDB connection working
- [ ] CORS configured
- [ ] Health endpoints responding
- [ ] Frontend can reach backend
- [ ] Backend can reach AI service
- [ ] Test login/signup
- [ ] Test interview flow
- [ ] Test admin panel

---

## 🎯 Performance Optimization

### Current Performance
- API Response Time: < 500ms
- Page Load Time: < 2s
- AI Evaluation: < 1s

### Optimization Tips
1. Enable caching on Vercel
2. Use MongoDB indexes
3. Compress API responses
4. Minify frontend assets

---

**Last Updated:** February 2026  
**Deployment Status:** ✅ All Services Live
"@ | Out-File -FilePath "DEPLOYMENT.md" -Encoding UTF8
