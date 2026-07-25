from fastapi import FastAPI
from app.routes.ai import router as ai_router

app = FastAPI(title="AI Interview Service")

@app.get("/")
def root():
    return {"message": "AI Service running"}

app.include_router(ai_router, prefix="/ai", tags=["AI"])
