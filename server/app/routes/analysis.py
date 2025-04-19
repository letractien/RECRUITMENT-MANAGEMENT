from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

from ..db.database import jobs_collection, candidates_collection

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.get("/data", response_model=[])
async def get_data():
    open_jobs = []

    # Get open jobs
    data_open_jobs = jobs_collection.find({
        "status": "open"
    })
    
    data_open_jobs = await data_open_jobs.to_list(length=100)

    if len(data_open_jobs) == 0:
        return open_jobs

    # Get candidate with status new in job open
    for open_job in data_open_jobs:
        print(open_job)
        candidates = candidates_collection.find({
            "job_id": open_job['id']
        })
        candidates = await candidates.to_list(length=100)

        open_jobs.append({
            "id": open_job['id'],
            "name": open_job['title'],
        	"field": open_job['department'],
            "rq_background": open_job['background_criteria'],
            "rq_project": open_job['project_criteria'],
            "rq_skill": open_job['skill_criteria'],
            "rq_certification": open_job['certification_criteria'],
            "candidates": candidates
        })

    return open_jobs
    

    

    
    

