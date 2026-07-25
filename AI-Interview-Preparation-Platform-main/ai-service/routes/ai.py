from fastapi import APIRouter
from schemas.interview import InterviewAnswerRequest

router = APIRouter()

@router.post("/evaluate")
def evaluate_answer(payload: InterviewAnswerRequest):
    return {
        "relevance": 8,
        "clarity": 7,
        "completeness": 7,
        "confidence": 6,
        "sentiment": "positive",
        "overallScore": 7,
        "feedback": "Good explanation"
    }
