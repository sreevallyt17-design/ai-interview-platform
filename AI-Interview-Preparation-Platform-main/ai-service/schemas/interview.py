from pydantic import BaseModel

class InterviewAnswerRequest(BaseModel):
    interviewId: str
    question: str
    answerText: str
