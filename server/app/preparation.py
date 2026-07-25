from datetime import date
import re

TOPIC_KEYWORDS = {
    "backend": ["python", "fastapi", "django", "sql", "postgresql", "database", "docker", "api", "redis", "kubernetes", "jwt", "authentication"],
    "frontend": ["react", "javascript", "typescript", "css", "html", "redux", "next.js", "accessibility", "testing"],
    "data": ["python", "sql", "pandas", "machine learning", "statistics", "tensorflow", "pytorch", "tableau"],
}

def role_topics(role: str):
    r = role.lower()
    if "front" in r: return TOPIC_KEYWORDS["frontend"]
    if any(k in r for k in ["data", "analyst", "machine learning"]): return TOPIC_KEYWORDS["data"]
    return TOPIC_KEYWORDS["backend"]

def _weaknesses(interviews):
    totals, count = {"communication": 0, "technical": 0, "completeness": 0}, 0
    for interview in interviews:
        for question in interview.questions:
            if question.feedback:
                totals["communication"] += question.feedback.get("communication", 70)
                totals["technical"] += question.feedback.get("technical_accuracy", 70)
                totals["completeness"] += question.feedback.get("completeness", 70)
                count += 1
    if not count: return ["resume stories", "technical foundations"]
    return [key for key, value in totals.items() if value / count < 72] or ["mock interview refinement"]

def build_plan(role, experience_level, interview_date, duration_weeks, interviews, resume_analysis=None):
    days = max(7, min(28, duration_weeks * 7))
    weak = _weaknesses(interviews)
    topics = role_topics(role)
    defaults = [
        ("Resume stories", "Turn two projects into concise STAR stories", 35),
        (f"{topics[0].title()} fundamentals", "Answer five role-specific technical questions", 45),
        ("Databases and performance", "Practice indexing, query trade-offs, and one optimisation story", 45),
        ("Behavioral", "Record three leadership, conflict, or challenge answers", 35),
        ("System design", "Design one scalable product feature and explain trade-offs", 55),
        ("Weak areas", "Revise the lowest-scoring topic from your recent feedback", 40),
        ("Mock interview", "Complete a mixed mock interview and review every improvement", 60),
    ]
    tasks=[]
    for day in range(1, days + 1):
        if day <= len(defaults): focus, task, minutes = defaults[day-1]
        else:
            focus = f"Adaptive: {weak[(day-len(defaults)-1) % len(weak)].replace('_',' ').title()}"
            topic = topics[(day-len(defaults)-1) % len(topics)]
            task = f"Practice {topic} and use your latest feedback to improve one answer"
            minutes = 45
        tasks.append({"day": day, "focus": focus, "task": task, "minutes": minutes, "completed": False})
    return {"role": role, "experience_level": experience_level, "interview_date": interview_date.isoformat(), "days_remaining": max(0, (interview_date - date.today()).days), "progress": 0, "streak": 0, "weaknesses": weak, "tasks": tasks}

TAXONOMY = [
    "python", "javascript", "typescript", "java", "c++", "c#", "golang", "rust", "ruby", "php", "sql", "html", "css", "bash",
    "react", "next.js", "vue", "angular", "node.js", "express", "fastapi", "django", "flask", "spring", "spring boot", "tailwind", "redux", "graphql", "rest api", "restful",
    "postgresql", "postgres", "mysql", "sqlite", "mongodb", "redis", "elasticsearch", "dynamodb", "cassandra",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd", "github actions", "jenkins", "linux", "nginx",
    "pandas", "numpy", "scikit-learn", "pytorch", "tensorflow", "spark", "kafka", "machine learning", "data engineering",
    "system design", "microservices", "object-oriented design", "unit testing", "agile", "scrum", "code review", "performance optimization"
]

RESPONSIBILITY_TERMS = [
    "design", "build", "deploy", "monitor", "collaborate", "lead", "optimize", "test", "architect", "scale", "maintain", "integrate", "refactor", "own"
]

def job_match(resume_text, analysis, job_description):
    jd = job_description.lower()
    resume = (resume_text or "").lower()
    analysis_skills = [s.lower() for s in (analysis.get("skills", []) or [])]
    
    # Extract skills requested in Job Description
    jd_skills = [s for s in TAXONOMY if s in jd]
    if not jd_skills:
        jd_words = re.findall(r'\b[a-zA-Z]{3,15}\b', jd)
        jd_skills = list(set([w for w in jd_words if len(w) > 4]))[:10]

    # Matched vs Missing
    strong = [s for s in jd_skills if s in resume or s in analysis_skills]
    missing = [s for s in jd_skills if s not in strong]
    
    # Responsibilities
    jd_responsibilities = [r for r in RESPONSIBILITY_TERMS if r in jd]
    matched_responsibilities = [r for r in jd_responsibilities if r in resume]
    missing_responsibilities = [r for r in jd_responsibilities if r not in resume]

    # Calculate match score
    total_reqs = max(1, len(jd_skills) + len(jd_responsibilities))
    matched_reqs = len(strong) + len(matched_responsibilities)
    score = min(98, max(20, round((matched_reqs / total_reqs) * 100)))

    # Suggested STAR bullets customized for JD
    star_bullets = []
    if strong:
        star_bullets.append(f"Architected & implemented scalable features using {strong[0].title()}" + (f" and {strong[1].title()}" if len(strong) > 1 else "") + ", improving system performance and delivery timelines.")
    if any(k in jd for k in ["docker", "kubernetes", "aws", "cloud", "ci/cd"]):
        star_bullets.append("Streamlined deployment pipelines using containerization & CI/CD tools, reducing environment setup and deployment overhead.")
    if any(k in jd for k in ["database", "sql", "postgresql", "mysql", "redis"]):
        star_bullets.append("Optimized database queries and schema designs to support high throughput with sub-100ms response times.")
    if not star_bullets:
        star_bullets.append("Led key software development efforts following modern engineering practices, delivering reliable code backed by automated testing.")

    # Action plan for boosting match
    action_plan = []
    if missing:
        action_plan.append(f"Add critical missing technical keywords ({', '.join([s.title() for s in missing[:4]])}) under your Skills or Experience sections.")
    if missing_responsibilities:
        action_plan.append(f"Highlight responsibilities like '{missing_responsibilities[0].capitalize()}' and '{missing_responsibilities[1].capitalize() if len(missing_responsibilities)>1 else 'Scale'}' in project bullet points.")
    action_plan.append("Quantify accomplishments with measurable outcomes (e.g., 'reduced latency by 25%', 'improved test coverage to 85%').")

    return {
        "match_score": score,
        "match_level": "High Match" if score >= 75 else ("Moderate Match" if score >= 50 else "Needs Alignment"),
        "strong_match": [s.title() for s in strong],
        "missing_skills": [s.title() for s in missing],
        "ats_keywords": [s.title() for s in missing[:6]],
        "matched_responsibilities": [r.capitalize() for r in matched_responsibilities],
        "missing_responsibilities": [r.capitalize() for r in missing_responsibilities],
        "star_bullet_suggestions": star_bullets,
        "action_plan": action_plan,
        "rewrite_guidance": "Format your resume bullets using STAR: Action Verb + Technology + Scope + Measurable Result.",
        "detail_prompt": "Which of your past projects best demonstrate the required skills and responsibilities listed above?"
    }