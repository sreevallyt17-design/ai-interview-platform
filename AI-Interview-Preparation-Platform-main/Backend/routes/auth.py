import os
from fastapi import APIRouter, HTTPException, status
from passlib.context import CryptContext
from jose import jwt
from database import users_col
from models.schemas import UserCreate, UserLogin
from datetime import datetime, timedelta

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"

@router.post("/register")
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = await users_col.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    user_dict = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "role": "candidate",
        "createdAt": datetime.utcnow()
    }
    
    await users_col.insert_one(user_dict)
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(credentials: UserLogin):
    user = await users_col.find_one({"email": credentials.email})
    
    if not user or not pwd_context.verify(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate JWT Token
    token_data = {"sub": str(user["_id"]), "role": user["role"]}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "token": token,
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }