// Backend/test-data.js
// Run this script to populate test data for testing
// Usage: node test-data.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Interview = require('./src/models/Interview');
const Score = require('./src/models/Score');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Test data
const roles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'DevOps Engineer'];
const levels = ['easy', 'medium', 'hard'];

const questions = [
  {
    questionText: "What are your key strengths?",
    modelAnswer: "Should mention technical and soft skills"
  },
  {
    questionText: "Describe a challenging project you worked on.",
    modelAnswer: "Should include problem, approach, and outcome"
  },
  {
    questionText: "How do you handle tight deadlines?",
    modelAnswer: "Should demonstrate time management skills"
  }
];

async function generateTestData() {
  try {
    console.log('🚀 Starting test data generation...\n');

    // Find or create test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123',
        role: 'candidate'
      });
      console.log('✅ Test user created: test@example.com / test123\n');
    } else {
      console.log('✅ Test user already exists: test@example.com\n');
    }

    // Generate 10 interviews
    console.log('Creating interviews and scores...\n');
    
    for (let i = 0; i < 10; i++) {
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];

      // Create interview
      const interview = await Interview.create({
        user: testUser._id,
        role: randomRole,
        level: randomLevel,
        questions: questions,
        status: 'completed',
        overallScore: Math.floor(Math.random() * 4) + 7, // 7-10
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
      });

      console.log(`✅ Interview ${i + 1}: ${randomRole} (${randomLevel}) - Score: ${interview.overallScore}`);

      // Create 3 scores for this interview
      for (let j = 0; j < 3; j++) {
        const baseScore = Math.floor(Math.random() * 4) + 7; // 7-10

        await Score.create({
          user: testUser._id,
          interview: interview._id,
          relevance: Math.min(10, baseScore + Math.floor(Math.random() * 2)),
          clarity: Math.min(10, baseScore),
          completeness: Math.min(10, baseScore + Math.floor(Math.random() * 2) - 1),
          confidence: Math.min(10, Math.max(6, baseScore - 1)),
          sentiment: baseScore >= 8 ? 'positive' : 'neutral',
          overallScore: baseScore,
          feedback: 'Good answer! Shows understanding of the topic.',
          createdAt: interview.createdAt
        });
      }
    }

    console.log('\n✅ Test data generation complete!');
    console.log('\n📊 Summary:');
    console.log('- 1 test user created');
    console.log('- 10 interviews created');
    console.log('- 30 scores created (3 per interview)');
    console.log('\n🔑 Login credentials:');
    console.log('Email: test@example.com');
    console.log('Password: test123');
    console.log('\n🎉 You can now test all analytics features!');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error generating test data:', error);
    process.exit(1);
  }
}

// Run the script
generateTestData();