from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

from ..db.database import jobs_collection, candidates_collection
from ..models.job import (
    Job, 
    JobCreate, 
    JobInDB, 
    JobSearchParams, 
    JobUpdate,
    JobStatus
)
from ..models.candidate import Candidate
from datetime import datetime

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/", response_model=List[Job])
async def get_jobs(
    status: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """
    Get all jobs with optional filtering
    """
    # Build the filter query
    query = {}
    
    if status:
        query["status"] = status
        
    if department:
        query["department"] = department
        
    if search:
        search_lower = search.lower()
        query["$or"] = [
            {"title": {"$regex": search_lower, "$options": "i"}},
            {"description": {"$regex": search_lower, "$options": "i"}},
            {"department": {"$regex": search_lower, "$options": "i"}},
        ]
    
    # Fetch jobs
    cursor = jobs_collection.find(query).skip(skip).limit(limit)
    jobs = await cursor.to_list(length=limit)
    
    return jobs


@router.post("/", response_model=Job, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_data: JobCreate,
):
    """
    Create a new job posting
    """
    # Create new job
    job_in_db = JobInDB(**job_data.dict())
    new_job = job_in_db.dict()
    
    # Insert into database
    result = await jobs_collection.insert_one(new_job)
    
    # Get created job
    created_job = await jobs_collection.find_one({"_id": result.inserted_id})
    
    return created_job


@router.get("/{job_id}", response_model=Job)
async def get_job(
    job_id: str,
):
    """
    Get a specific job by ID
    """
    job = await jobs_collection.find_one({"id": job_id})
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found",
        )
    
    return job


@router.put("/{job_id}", response_model=Job)
async def update_job(
    job_id: str,
    job_data: JobUpdate,
):
    """
    Update a job posting
    """
    # Check if job exists
    job = await jobs_collection.find_one({"id": job_id})
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found",
        )
    
    # Filter out None values from update data
    update_data = {k: v for k, v in job_data.dict().items() if v is not None}
    
    if not update_data:
        return job
    
    # Add updated timestamp
    update_data["updated_at"] = datetime.now()
    
    # Update job
    await jobs_collection.update_one(
        {"id": job_id},
        {"$set": update_data}
    )
    
    # Get updated job
    updated_job = await jobs_collection.find_one({"id": job_id})
    
    return updated_job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: str,
):
    """
    Delete a job posting
    """
    # Check if job exists
    job = await jobs_collection.find_one({"id": job_id})
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found",
        )
    
    # Delete the job
    await jobs_collection.delete_one({"id": job_id})
    
    return None


@router.patch("/{job_id}/status", response_model=Job)
async def update_job_status(
    job_id: str,
    status: JobStatus,
):
    """
    Update a job's status
    """
    # Check if job exists
    job = await jobs_collection.find_one({"id": job_id})
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found",
        )
    
    # Update status based on the new status
    update_data = {"status": status, "updated_at": datetime.now()}
    
    # If status is OPEN, set posted_date if not already set
    if status == JobStatus.OPEN and not job.get("posted_date"):
        update_data["posted_date"] = datetime.now()
    
    # If status is CLOSED, set closed_date
    if status == JobStatus.CLOSED:
        update_data["closed_date"] = datetime.now()
    
    # Update job
    await jobs_collection.update_one(
        {"id": job_id},
        {"$set": update_data}
    )
    
    # Get updated job
    updated_job = await jobs_collection.find_one({"id": job_id})
    
    return updated_job


@router.get("/{job_id}/candidates", response_model=List[Candidate])
async def get_job_candidates(
    job_id: str,
):
    """
    Get all candidates who applied for a specific job
    """
    # Check if job exists
    job = await jobs_collection.find_one({"id": job_id})
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found",
        )
    
    # Get candidates with matching position
    cursor = candidates_collection.find({"position": job["title"]})
    candidates = await cursor.to_list(length=100)
    
    return candidates


@router.get("/department/{department}", response_model=List[Job])
async def get_jobs_by_department(
    department: str,
):
    """
    Get all jobs for a specific department
    """
    cursor = jobs_collection.find({"department": department})
    jobs = await cursor.to_list(length=100)
    
    return jobs 