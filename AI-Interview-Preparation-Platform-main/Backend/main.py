import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from routes import auth, interviews, analytics

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-interview-platform-mu-nine.vercel.app"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Register Routers (Once each!)
app.include_router(auth.router, prefix="/api/auth")
app.include_router(interviews.router, prefix="/api/interviews")
app.include_router(analytics.router, prefix="/api/analytics")

@app.get("/health")
async def health_check():
    return {"status": "active", "service": "Python Backend"}

if __name__ == "__main__":
    # Note: On Render, the host/port are usually managed by environment variables,
    # but this is perfect for local testing.
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)