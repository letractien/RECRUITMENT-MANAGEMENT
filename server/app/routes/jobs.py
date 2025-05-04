from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

from ..db.database import jobs_collection, candidates_collection
from ..models.job import (
    Job, 
    JobCreate, 
    JobInDB, 
    JobUpdate,
    JobStatus
)
from ..models.candidate import Candidate
from datetime import datetime

router = APIRouter(prefix="/jobs", tags=["jobs"])

# Thêm route xử lý gốc để tránh redirect
@router.get("", response_model=List[Job])
async def get_jobs_no_slash(
    status: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """
    Get all jobs with optional filtering (no trailing slash)
    """
    return await get_jobs(status, department, search, skip, limit)


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
    jobs = jobs_collection.find(query).skip(skip).limit(limit)
    jobs = await jobs.to_list(length=limit)
    return jobs


@router.post("", response_model=Job, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_data: JobCreate,
):
    print(job_data)
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
    job_data: dict,
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
    status_data: dict,
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
    
    # Get status from request body
    if 'status' not in status_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="status field is required in request body"
        )
    
    job_status = status_data['status']
    
    # Validate status value
    try:
        job_status = JobStatus(job_status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status value: {job_status}"
        )
    
    # Update status based on the new status
    update_data = {"status": job_status, "updated_at": datetime.now()}
    
    # If status is OPEN, set posted_date if not already set
    if job_status == JobStatus.OPEN and not job.get("posted_date"):
        update_data["posted_date"] = datetime.now()
    
    # If status is CLOSED, set closed_date
    if job_status == JobStatus.CLOSED:
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
    candidates = candidates_collection.find({"position": job["title"]})
    candidates = await candidates.to_list(length=100)
    
    return candidates


@router.get("/department/{department}", response_model=List[Job])
async def get_jobs_by_department(
    department: str,
):
    """
    Get all jobs for a specific department
    """
    jobs = jobs_collection.find({"department": department})
    jobs = await jobs.to_list(length=100)
    
    return jobs 

@router.get("/{job_id}/applications", response_model=List[Candidate])
async def get_job_applications(
    job_id: str,
):
    """
    Get all applications for a specific job
    """
    # Check if job exists
    job = jobs_collection.find_one({"id": job_id})
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found",
        )
    
    # Get applications for the job
    applications = candidates_collection.find({"job_id": job_id})
    applications = await applications.to_list(length=100)
    applications = [transform_candidate_data(application) for application in applications]

    return applications


def transform_candidate_data(candidate):
    """
    Transform MongoDB candidate document to match Pydantic model requirements
    """
    if not candidate:
        return None
        
    # Create a copy to avoid modifying the original
    candidate = dict(candidate)
    
    # Convert MongoDB _id to string id if not present
    if "_id" in candidate and "id" not in candidate:
        candidate["id"] = str(candidate["_id"])
    
    # Ensure status is lowercase to match enum
    if "status" in candidate and candidate["status"] == "New":
        candidate["status"] = "new"
        
    # Set default values for required fields if missing
    if "phone" not in candidate:
        candidate["phone"] = "Not provided"
        
    if "department" not in candidate:
        candidate["department"] = "Not specified"
        
    if "experience" not in candidate:
        candidate["experience"] = 0
        
    # Add timestamps if missing
    now = datetime.now()
    if "created_at" not in candidate:
        candidate["created_at"] = now
        
    if "updated_at" not in candidate:
        candidate["updated_at"] = now
        
    if "applied_date" not in candidate:
        candidate["applied_date"] = now
        
    # Fix resume_url to be a valid URL
    if "resume_url" in candidate and candidate["resume_url"]:
        if not candidate["resume_url"].startswith(("http://", "https://")):
            # Convert relative path to absolute URL
            base_url = "https://ftp.cntt.io/view"
            candidate["resume_url"] = f"{base_url}/{candidate['resume_url']}"
            
            # # Convert relative path to absolute URL with URL encoding for the path parameter
            # path = urllib.parse.quote(candidate["resume_url"])
            # candidate["resume_url"] = f"https://ftp.cntt.io/api/files/cat?path=%2F{path}"
    
    return candidate