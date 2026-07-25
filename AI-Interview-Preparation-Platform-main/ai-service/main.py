from fastapi import FastAPI
from routes.ai import router as ai_router
import uvicorn

app = FastAPI()

app.include_router(ai_router, prefix="/ai")

@app.get("/")
def root():
    return {"message": "AI Service Running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)