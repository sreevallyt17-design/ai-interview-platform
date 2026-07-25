import json
import random
import re
from .config import get_settings

def analyze_resume(text: str) -> dict:
    words = text.lower()
    known_skills = [
        "python", "react", "javascript", "typescript", "sql", "postgresql", "mysql", 
        "docker", "aws", "kubernetes", "fastapi", "django", "flask", "node", "express", 
        "java", "spring", "redis", "graphql", "mongodb", "ci/cd", "microservices", "go"
    ]
    skills = [s for s in known_skills if s in words]
    return {
        "ats_score": min(94, 52 + len(skills) * 5), 
        "quality_score": min(92, 55 + len(skills) * 4), 
        "skills": skills, 
        "strengths": ["Clear, machine-readable resume text", "Relevant skills are stated explicitly"], 
        "gaps": ["Add measurable impact to recent experience", "Tailor keywords to the target role"], 
        "roadmap": ["Strengthen one target-role project", "Practice STAR stories", "Run a weekly mock interview"]
    }


def _extract_resume_skills(text: str) -> list[str]:
    if not text:
        return []
    words = text.lower()
    known_skills = [
        "Python", "React", "JavaScript", "TypeScript", "SQL", "PostgreSQL", "MySQL", 
        "Docker", "AWS", "Kubernetes", "FastAPI", "Django", "Flask", "Node.js", 
        "Java", "Spring Boot", "Redis", "GraphQL", "MongoDB", "Microservices", "Go", "C++"
    ]
    return [s for s in known_skills if s.lower() in words]


def generate_questions(
    role: str, 
    kind: str, 
    level: str, 
    count: int, 
    previous_prompts: list[str] | None = None,
    resume_text: str | None = None
) -> list[dict]:
    prev_set = set(p.strip().lower() for p in (previous_prompts or []))
    resume_skills = _extract_resume_skills(resume_text or "")

    candidate_pool = []

    # 1. Resume skill-specific questions
    for skill in resume_skills:
        candidate_pool.append({
            "prompt": f"In your experience working with {skill}, how do you approach performance optimization and debugging complex issues?",
            "category": kind,
            "model_answer": f"Outline a structured scenario using {skill}, detailing performance bottleneck identification, tools used (profilers, logs), trade-offs, and final outcome."
        })
        candidate_pool.append({
            "prompt": f"Can you explain a high-impact architectural decision you made using {skill} in a recent project?",
            "category": kind,
            "model_answer": f"Explain the context requiring {skill}, alternative approaches considered, key trade-offs, implementation steps, and measurable results."
        })
        candidate_pool.append({
            "prompt": f"How do you ensure code quality, security, and testability when writing production systems in {skill}?",
            "category": kind,
            "model_answer": f"Discuss unit testing strategies, automated linting, security best practices (input validation, secret management), and code review practices for {skill}."
        })

    # 2. Level and Role-specific questions
    base_templates = [
        # Technical & Architecture
        f"How would you approach debugging an intermittent production latency spike in a {level} {role} application?",
        f"Explain how you design database schemas and manage migrations for a high-throughput {role} service.",
        f"What trade-offs do you consider when choosing between asynchronous task queues and synchronous processing in a {role} architecture?",
        f"How do you handle API versioning, backwards compatibility, and deprecation strategies for a {role} product?",
        f"Describe how you implement caching strategies (e.g. read-through, write-through, cache invalidation) in a {role} system.",
        f"How do you monitor application health, error budgets, and logging metrics in a production {role} environment?",
        f"Explain how you prevent common security vulnerabilities (e.g. OWASP Top 10, SQL injection, XSS, SSRF) as a {role}.",
        f"What strategies do you use for data consistency and transaction management in a microservices-based {role} architecture?",
        f"How do you approach refactoring a legacy monolithic codebase into modular components as a {level} {role}?",
        f"Design a rate limiter and throttling system for an external-facing {role} API.",
        
        # Behavioral & Leadership (STAR)
        f"Describe a situation as a {role} where technical stakeholders disagreed on system design. How did you align the team?",
        f"Tell me about a time you made a technical compromise under tight deadline pressure. What were the short and long-term consequences?",
        f"Walk me through a complex bug or system failure you personally investigated and resolved as a {role}.",
        f"Give an example of how you mentored a junior engineer or advocated for engineering best practices in a recent role.",
        f"Tell me about a project where product requirements changed late in the release cycle. How did you adapt your engineering plan?",
        f"Describe a time when a production release broke unexpected functionality. What post-mortem actions did you implement?",
        f"How do you prioritize technical debt versus delivering new customer features as a {role}?",

        # System Design & Edge Cases
        f"Architect a real-time event notifications pipeline that scales to millions of active connections for a {role} application.",
        f"How would you design a distributed, fault-tolerant file upload and image processing pipeline?",
        f"Design an idempotent payment processing gateway that handles network timeouts and retries safely.",
        f"How do you architect a multi-tenant SaaS application to guarantee data isolation and tenant performance fairness?",
        f"Design a global search and indexing engine for unstructured data in a {role} system.",
        f"How would you handle database connection pooling and failover during primary database outages?"
    ]

    for t in base_templates:
        candidate_pool.append({
            "prompt": t,
            "category": kind,
            "model_answer": "A strong STAR/technical response sets clear context, details precise architectural or debugging actions taken, addresses trade-offs, and quantifies measurable business or technical outcomes."
        })

    # 3. Dynamic scenario variations generator to guarantee endless unique questions
    scenarios = [
        "under high concurrent write load",
        "during a region-wide cloud provider outage",
        "when dealing with legacy third-party API rate limits",
        "to achieve sub-50ms p99 latency SLAs",
        "with strict GDPR and data encryption requirements",
        "when migrating multi-terabyte SQL databases live",
        "during a distributed denial of service (DDoS) event",
        "when zero-downtime rolling updates are strictly required"
    ]
    
    focus_areas = [
        "memory management and garbage collection tuning",
        "graceful degradation and circuit breaking",
        "distributed tracing and telemetry instrumentation",
        "eventual consistency vs immediate consistency trade-offs",
        "cost optimization and resource utilization",
        "disaster recovery and multi-region replication"
    ]

    for scenario in scenarios:
        for area in focus_areas:
            candidate_pool.append({
                "prompt": f"As a {level} {role}, how do you design systems to address {area} {scenario}?",
                "category": kind,
                "model_answer": "Explain the scenario constraints, proposed architectural patterns, error boundaries, failure modes, and monitoring criteria."
            })

    # Filter out previously asked questions for this candidate
    unasked = [q for q in candidate_pool if q["prompt"].strip().lower() not in prev_set]

    # If unasked pool is smaller than count, generate seed-variant questions
    if len(unasked) < count:
        seed = random.randint(1000, 9999)
        extra_prompts = [
            f"Scenario #{seed}: As a {level} {role}, how would you resolve a critical cascading failure in a microservices dependency chain?",
            f"Scenario #{seed+1}: How do you design automated integration testing for a stateful {role} pipeline?",
            f"Scenario #{seed+2}: Explain your strategy for capacity planning and auto-scaling logic in a high-growth {role} service.",
            f"Scenario #{seed+3}: Describe how you perform root cause analysis (RCA) following an outage caused by unexpected memory leaks.",
            f"Scenario #{seed+4}: How do you balance rapid prototyping with long-term software maintainability as a {level} {role}?"
        ]
        for ep in extra_prompts:
            if ep.strip().lower() not in prev_set:
                unasked.append({
                    "prompt": ep,
                    "category": kind,
                    "model_answer": "Provide a structured breakdown of diagnosis, preventive architecture, and engineering metrics."
                })

    random.shuffle(unasked)
    return unasked[:count]


def evaluate_answer(answer: str, prompt: str) -> dict:
    length = len(answer.split())
    score = max(35, min(95, 42 + length // 4 + (10 if any(x in answer.lower() for x in ["result", "impact", "because", "trade-off", "performance", "architecture"]) else 0)))
    return {
        "overall": score, 
        "technical_accuracy": min(95, score + 2), 
        "communication": min(95, score - 2), 
        "completeness": min(95, score - 5), 
        "strengths": ["Your answer addresses the prompt directly"], 
        "improvements": ["Use a concise situation-action-result structure", "Include a concrete metric or outcome"], 
        "model_answer": "Set the context, explain your decisions and constraints, then close with a measurable result and reflection."
    }
