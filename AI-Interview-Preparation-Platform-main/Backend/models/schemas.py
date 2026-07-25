from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class QuestionSchema(BaseModel):
    questionText: str
    modelAnswer: str

class InterviewCreate(BaseModel):
    role: str
    level: str  # "easy", "medium", "hard"
    questions: List[QuestionSchema]

class AnswerSubmit(BaseModel):
    interviewId: str
    questionId: str
    answerText: str