from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

from ..db.database import jobs_collection, candidates_collection

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.get("/data", response_model=list)
async def get_data():
    pipeline = [
        {"$match": {"status": "open"}},
        {"$lookup": {
            "from": "candidates",
              "let": {"jobId": "$id"},
            "pipeline": [
                {"$match": {
                    "$expr": {"$and": [
                        {"$eq": ["$job_id", "$$jobId"]},
                        {"$eq": [{ "$toLower": "$status" }, "new" ]}
                    ]}
                }},
                {"$project": {"_id": 0}}
            ],
            "as": "candidates"
        }},
        {"$project": {
            "_id": 0,
            "id": 1,
            "title": 1,
            "department": 1,
            "background_criteria": 1,
            "project_criteria": 1,
            "skill_criteria": 1,
            "certification_criteria": 1,
            "candidates": 1
        }}
    ]

    jobs_with_candidates = jobs_collection.aggregate(pipeline)
    results = []

    async for doc in jobs_with_candidates:
        # rename fields to match response format
        results.append({
            "id": doc["id"],
            "name": doc.get("title"),
            "field": doc.get("department"),
            "rq_background": doc.get("background_criteria"),
            "rq_project": doc.get("project_criteria"),
            "rq_skill": doc.get("skill_criteria"),
            "rq_certification": doc.get("certification_criteria"),
            "candidates": doc.get("candidates", [])
        })

    return results
    

@router.get("/new_candidates")
async def get_new_candidates(job_id: str):
    pipeline = [
        {
            "$match": {
                "$expr": {
                    "$and": [
                        {"$eq": ["$job_id", job_id]},
                        {"$eq": [{"$toLower": "$status"}, "new"]}
                    ]
                }
            }
        },
        {
            "$group": {
                "_id": "$job_id",
                "candidates": {"$push": "$$ROOT"}
            }
        }
    ]

    jobs_with_candidates = candidates_collection.aggregate(pipeline)
    grouped_result = await jobs_with_candidates.to_list(length=1)

    if not grouped_result:
        return []

    candidates = grouped_result[0]["candidates"]

    # Loại bỏ ObjectId trong từng candidate
    for c in candidates:
        c.pop("_id", None)

    return candidates


