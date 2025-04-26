from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

from ..db.database import jobs_collection, candidates_collection

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.get("/data", response_model=[])
async def get_data():
    open_jobs_with_candidates = []
    open_jobs = jobs_collection.find({"status": "open"})
    open_jobs = await open_jobs.to_list(length=100)

    if len(open_jobs) == 0:
        return open_jobs_with_candidates

    for open_job in open_jobs:
        open_job.pop('_id', None)
        
        candidates = candidates_collection.find({
            "job_id": open_job['id'],
            "status": "New"
        })
        candidates = await candidates.to_list(length=100)
        if len(candidates) == 0:
            continue
        
        for candidate in candidates:
            candidate.pop('_id', None)

        open_jobs_with_candidates.append({
            "id": open_job['id'],
            "name": open_job['title'],
        	"field": open_job['department'],
            "rq_background": open_job['background_criteria'],
            "rq_project": open_job['project_criteria'],
            "rq_skill": open_job['skill_criteria'],
            "rq_certification": open_job['certification_criteria'],
            "candidates": candidates
        })

    return open_jobs_with_candidates
    

    

    
    

