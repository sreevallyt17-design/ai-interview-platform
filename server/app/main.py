from datetime import datetime
import fitz
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload
from .ai import analyze_resume, evaluate_answer, generate_questions
from .config import get_settings
from .database import Base, engine, get_db
from .models import Interview, Question, Resume, User
from .schemas import AnswerIn, InterviewCreate, InterviewOut, LoginIn, ProfileUpdate, QuestionOut, RegisterIn, TokenOut, UserOut
from .security import current_user, hash_password, issue_tokens, verify_password

settings = get_settings()
app = FastAPI(title="InterviewOS API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def setup():
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        from sqlalchemy import text
        table_info = conn.execute(text("PRAGMA table_info(questions)")).fetchall()
        columns = [row[1] for row in table_info]
        if "is_bookmarked" not in columns:
            conn.execute(text("ALTER TABLE questions ADD COLUMN is_bookmarked BOOLEAN DEFAULT 0"))
            conn.commit()

@app.get("/health")
def health(): return {"status": "ok", "service": settings.app_name}

@app.post("/api/auth/register", response_model=TokenOut, status_code=201)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == data.email)): raise HTTPException(409, "Email already registered")
    user = User(name=data.name, email=str(data.email).lower(), password_hash=hash_password(data.password)); db.add(user); db.commit(); db.refresh(user); return issue_tokens(user)

@app.post("/api/auth/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == str(data.email).lower()))
    if not user or not verify_password(data.password, user.password_hash): raise HTTPException(401, "Incorrect email or password")
    return issue_tokens(user)

@app.get("/api/me", response_model=UserOut)
def me(user: User = Depends(current_user)): return user

@app.patch("/api/me", response_model=UserOut)
def update_me(data: ProfileUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    for key, value in data.model_dump(exclude_unset=True).items(): setattr(user, key, value)
    db.commit(); db.refresh(user); return user

@app.post("/api/resumes")
async def upload_resume(file: UploadFile = File(...), user: User = Depends(current_user), db: Session = Depends(get_db)):
    if file.content_type != "application/pdf": raise HTTPException(415, "Upload a PDF resume")
    content = await file.read()
    try: text = "\n".join(page.get_text() for page in fitz.open(stream=content, filetype="pdf"))
    except Exception: raise HTTPException(422, "Could not read this PDF")
    if not text.strip(): raise HTTPException(422, "No readable text was found in this PDF")
    analysis = analyze_resume(text); resume = Resume(user_id=user.id, filename=file.filename or "resume.pdf", extracted_text=text, analysis=analysis); db.add(resume); db.commit(); db.refresh(resume)
    return {"id": resume.id, "filename": resume.filename, "analysis": analysis}

@app.get("/api/resumes")
def list_resumes(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return [{"id": r.id, "filename": r.filename, "analysis": r.analysis, "created_at": r.created_at} for r in db.scalars(select(Resume).where(Resume.user_id == user.id).order_by(Resume.created_at.desc())).all()]

@app.post("/api/interviews", response_model=InterviewOut, status_code=201)
def create_interview(data: InterviewCreate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    interview = Interview(user_id=user.id, role=data.role, interview_type=data.interview_type, difficulty=data.difficulty); db.add(interview); db.flush()
    if data.custom_questions and len(data.custom_questions) > 0:
        raw_qs = [q.strip() for q in data.custom_questions if q.strip()]
        for pos, qtext in enumerate(raw_qs, 1):
            db.add(Question(interview_id=interview.id, position=pos, prompt=qtext, category=data.interview_type, model_answer="A complete response outlines the situation, action taken, key technical trade-offs, and measurable outcome."))
    else:
        # Fetch candidate's previously asked question prompts across all past interviews to prevent repeating questions
        previous_prompts = list(db.scalars(select(Question.prompt).join(Interview).where(Interview.user_id == user.id)).all())
        latest_resume = db.scalars(select(Resume).where(Resume.user_id == user.id).order_by(Resume.created_at.desc())).first()
        resume_text = latest_resume.extracted_text if latest_resume else None
        
        generated = generate_questions(
            role=data.role,
            kind=data.interview_type,
            level=data.difficulty,
            count=data.question_count,
            previous_prompts=previous_prompts,
            resume_text=resume_text
        )
        for pos, question in enumerate(generated, 1):
            db.add(Question(interview_id=interview.id, position=pos, **question))
    db.commit(); return db.scalar(select(Interview).options(selectinload(Interview.questions)).where(Interview.id == interview.id))


@app.get("/api/interviews", response_model=list[InterviewOut])
def interviews(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.scalars(select(Interview).options(selectinload(Interview.questions)).where(Interview.user_id == user.id).order_by(Interview.created_at.desc())).all()

@app.get("/api/interviews/{interview_id}", response_model=InterviewOut)
def interview(interview_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    row = db.scalar(select(Interview).options(selectinload(Interview.questions)).where(Interview.id == interview_id, Interview.user_id == user.id))
    if not row: raise HTTPException(404, "Interview not found")
    return row

@app.put("/api/questions/{question_id}/answer")
def answer(question_id: int, data: AnswerIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    question = db.get(Question, question_id)
    if not question or question.interview.user_id != user.id: raise HTTPException(404, "Question not found")
    question.answer_text = data.answer_text; question.feedback = evaluate_answer(data.answer_text, question.prompt); question.score = question.feedback["overall"]; db.commit()
    return {"question_id": question.id, "score": question.score, "feedback": question.feedback, "is_bookmarked": question.is_bookmarked}

@app.get("/api/questions/bookmarked", response_model=list[QuestionOut])
def get_bookmarked_questions(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.scalars(select(Question).join(Question.interview).where(Interview.user_id == user.id, Question.is_bookmarked == True).order_by(Question.id.desc())).all()

@app.patch("/api/questions/{question_id}/bookmark")
def toggle_bookmark(question_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    question = db.get(Question, question_id)
    if not question or question.interview.user_id != user.id: raise HTTPException(404, "Question not found")
    question.is_bookmarked = not bool(question.is_bookmarked)
    db.commit()
    return {"id": question.id, "is_bookmarked": question.is_bookmarked}

@app.post("/api/interviews/{interview_id}/complete", response_model=InterviewOut)
def complete(interview_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    row = db.scalar(select(Interview).options(selectinload(Interview.questions)).where(Interview.id == interview_id, Interview.user_id == user.id))
    if not row: raise HTTPException(404, "Interview not found")
    scores = [q.score for q in row.questions if q.score is not None]; row.overall_score = round(sum(scores) / len(scores)) if scores else 0; row.status = "completed"; row.completed_at = datetime.utcnow(); db.commit(); db.refresh(row); return row

@app.get("/api/dashboard")
def dashboard(user: User = Depends(current_user), db: Session = Depends(get_db)):
    completed = db.scalars(select(Interview).where(Interview.user_id == user.id, Interview.status == "completed")).all(); scores = [x.overall_score for x in completed if x.overall_score is not None]
    return {"completed_interviews": len(completed), "average_score": round(sum(scores)/len(scores)) if scores else 0, "readiness": "Building momentum" if len(scores) < 3 else "Interview ready", "recent": [{"id": x.id, "role": x.role, "score": x.overall_score, "created_at": x.created_at} for x in completed[:5]]}

# Preparation intelligence: adaptive plans, resume-to-job matching, and quick-review sheets.
from datetime import date as Date
from io import BytesIO
from pydantic import BaseModel, Field
from fastapi.responses import StreamingResponse
from .models import PreparationPlan
from .preparation import build_plan, job_match

class PlanIn(BaseModel):
    role: str = Field(min_length=2, max_length=120)
    experience_level: str = "Intermediate"
    interview_date: Date
    duration_weeks: int = Field(default=2, ge=1, le=4)
    job_description: str | None = Field(default=None, max_length=15000)

class TaskStateIn(BaseModel):
    completed: bool

class JobMatchIn(BaseModel):
    job_description: str = Field(min_length=40, max_length=15000)


def _latest_resume(db, user_id):
    return db.scalars(select(Resume).where(Resume.user_id == user_id).order_by(Resume.created_at.desc())).first()


def _latest_plan(db, user_id):
    return db.scalars(select(PreparationPlan).where(PreparationPlan.user_id == user_id).order_by(PreparationPlan.updated_at.desc())).first()


def _plan_payload(plan):
    payload = dict(plan.plan or {})
    completed = sum(1 for task in payload.get("tasks", []) if task.get("completed"))
    total = len(payload.get("tasks", [])) or 1
    payload.update({"id": plan.id, "progress": round(completed / total * 100), "completed_tasks": completed, "total_tasks": total, "updated_at": plan.updated_at})
    return payload

@app.post("/api/preparation/plan")
def create_plan(data: PlanIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    interviews = db.scalars(select(Interview).options(selectinload(Interview.questions)).where(Interview.user_id == user.id, Interview.status == "completed")).all()
    resume = _latest_resume(db, user.id)
    content = build_plan(data.role, data.experience_level, data.interview_date, data.duration_weeks, interviews, resume.analysis if resume else None)
    plan = PreparationPlan(user_id=user.id, role=data.role, experience_level=data.experience_level, interview_date=datetime.combine(data.interview_date, datetime.min.time()), duration_weeks=data.duration_weeks, job_description=data.job_description, plan=content)
    db.add(plan); db.commit(); db.refresh(plan)
    return _plan_payload(plan)

@app.get("/api/preparation/plan")
def get_plan(user: User = Depends(current_user), db: Session = Depends(get_db)):
    plan = _latest_plan(db, user.id)
    if not plan: raise HTTPException(404, "Create a preparation plan first")
    return _plan_payload(plan)

@app.patch("/api/preparation/plan/{plan_id}/tasks/{day}")
def toggle_plan_task(plan_id: int, day: int, data: TaskStateIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    plan = db.scalar(select(PreparationPlan).where(PreparationPlan.id == plan_id, PreparationPlan.user_id == user.id))
    if not plan: raise HTTPException(404, "Preparation plan not found")
    from copy import deepcopy
    content = deepcopy(plan.plan or {}); task = next((x for x in content.get("tasks", []) if x.get("day") == day), None)
    if not task: raise HTTPException(404, "Task not found")
    task["completed"] = data.completed; plan.plan = content; db.commit(); db.refresh(plan)
    return _plan_payload(plan)

@app.post("/api/job-match")
def create_job_match(data: JobMatchIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    resume = _latest_resume(db, user.id)
    if not resume: raise HTTPException(400, "Upload a resume before creating a job match report")
    return job_match(resume.extracted_text, resume.analysis or {}, data.job_description)
