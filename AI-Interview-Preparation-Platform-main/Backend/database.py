import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load credentials from your .env file [cite: 1]
load_dotenv()

# MongoDB Atlas Connection 
# This uses the same MONGODB_URI you used in your Node.js app [cite: 1]
client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
db = client["ai-interview-platform"]

# Collections 
users_col = db["users"]
interviews_col = db["interviews"]
scores_col = db["scores"]

print("✅ Connected to MongoDB Atlas via Motor")