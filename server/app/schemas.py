from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    headline: str | None = None
    career_goal: str | None = None
    class Config: from_attributes = True

class ProfileUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=120)
    headline: str | None = Field(None, max_length=180)
    career_goal: str | None = Field(None, max_length=2000)

class InterviewCreate(BaseModel):
    role: str = Field(min_length=2, max_length=120)
    interview_type: str = "Technical"
    difficulty: str = "Intermediate"
    question_count: int = Field(default=5, ge=1, le=12)
    custom_questions: list[str] | None = None

class AnswerIn(BaseModel):
    answer_text: str = Field(min_length=1, max_length=10000)

class QuestionOut(BaseModel):
    id: int; position: int; prompt: str; category: str; answer_text: str | None = None; feedback: dict | None = None; score: int | None = None; is_bookmarked: bool = False
    class Config: from_attributes = True

class InterviewOut(BaseModel):
    id: int; role: str; interview_type: str; difficulty: str; status: str; overall_score: int | None; created_at: datetime; questions: list[QuestionOut] = []
    class Config: from_attributes = True
