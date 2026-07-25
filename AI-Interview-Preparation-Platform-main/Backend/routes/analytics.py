from fastapi import APIRouter, Depends, HTTPException
from database import scores_col, interviews_col
from bson import ObjectId
from datetime import datetime
from typing import List, Dict

router = APIRouter()

@router.get("/dashboard/{user_id}")
async def get_dashboard_analytics(user_id: str):
    # Convert string ID to MongoDB ObjectId
    uid = ObjectId(user_id)

    # 1. Calculate Overall Performance Metrics
    pipeline = [
        {"$match": {"user": uid}},
        {"$group": {
            "_id": None,
            "avgRelevance": {"$avg": "$relevance"},
            "avgClarity": {"$avg": "$clarity"},
            "avgCompleteness": {"$avg": "$completeness"},
            "avgConfidence": {"$avg": "$confidence"},
            "avgOverall": {"$avg": "$overallScore"},
            "totalInterviews": {"$addToSet": "$interview"}
        }}
    ]
    
    perf_results = await scores_col.aggregate(pipeline).to_list(length=1)
    
    if not perf_results:
        return {"message": "No data found for this user"}

    stats = perf_results[0]

    # 2. Identify Strengths and Weaknesses
    # Logic: Score >= 7 is a strength; Score < 7 is a weakness
    strengths = []
    weaknesses = []
    
    metrics = {
        "Relevance": stats["avgRelevance"],
        "Clarity": stats["avgClarity"],
        "Completeness": stats["avgCompleteness"],
        "Confidence": stats["avgConfidence"]
    }

    for name, value in metrics.items():
        if value >= 7:
            strengths.append(name)
        else:
            weaknesses.append(name)

    # 3. Format Response for Chart.js
    return {
        "overallPerformance": {
            "relevance": round(stats["avgRelevance"], 1),
            "clarity": round(stats["avgClarity"], 1),
            "completeness": round(stats["avgCompleteness"], 1),
            "confidence": round(stats["avgConfidence"], 1),
            "overall": round(stats["avgOverall"], 1)
        },
        "strengthsAndWeaknesses": {
            "strengths": strengths,
            "weaknesses": weaknesses
        },
        "totalInterviewsCount": len(stats["totalInterviews"])
    }