import os
import httpx
from fastapi import APIRouter, HTTPException, Depends
from database import interviews_col, scores_col
from models.schemas import InterviewCreate, AnswerSubmit
from datetime import datetime
from bson import ObjectId

router = APIRouter()
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL")

@router.post("/")
async def create_interview(data: InterviewCreate):
    interview_dict = data.dict()
    interview_dict["status"] = "in-progress"
    interview_dict["createdAt"] = datetime.utcnow()
    
    result = await interviews_col.insert_one(interview_dict)
    return {"interviewId": str(result.inserted_id)}

@router.post("/answer")
async def submit_answer(data: AnswerSubmit):
    # 1. Fetch the interview to get the model answer
    interview = await interviews_col.find_one({"_id": ObjectId(data.interviewId)})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    # 2. Call the AI Service for NLP evaluation
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{AI_SERVICE_URL}/api/evaluate",
                json={
                    "answer": data.answerText,
                    "question": data.questionId # Add other fields as needed by your AI service
                },
                timeout=10.0
            )
            ai_results = response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail="AI Service is unreachable")

    # 3. Save the score and feedback to MongoDB
    score_doc = {
        "interview": ObjectId(data.interviewId),
        "answerText": data.answerText,
        "metrics": ai_results["scores"], # relevance, clarity, etc.
        "feedback": ai_results["feedback"],
        "createdAt": datetime.utcnow()
    }
    await scores_col.insert_one(score_doc)
    
    return ai_results