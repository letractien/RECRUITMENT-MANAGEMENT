from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

from ..db.database import candidates_collection, interviews_collection, jobs_collection
from ..models.candidate import (
    Candidate, 
    CandidateCreate, 
    CandidateInDB, 
    CandidateSearchParams, 
    CandidateUpdate,
    CandidateUpdateStatus,
)
from ..models.interview import Interview, InterviewCreate, InterviewInDB

router = APIRouter(prefix="/candidates", tags=["candidates"])

# Thêm route xử lý gốc để tránh redirect
@router.get("", response_model=List[Candidate])
async def get_candidates_no_slash(
    status: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """
    Get all candidates with optional filtering (no trailing slash)
    """
    return await get_candidates(status, department, search, skip, limit)


@router.get("/", response_model=List[Candidate])
async def get_candidates(
    status: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """
    Get all candidates with optional filtering
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
            {"name": {"$regex": search_lower, "$options": "i"}},
            {"email": {"$regex": search_lower, "$options": "i"}},
            {"position": {"$regex": search_lower, "$options": "i"}},
        ]
    
    # Fetch candidates
    cursor = candidates_collection.find(query).skip(skip).limit(limit)
    candidates = await cursor.to_list(length=limit)
    
    return candidates

@router.post("/", response_model=Candidate, status_code=status.HTTP_201_CREATED)
async def create_interview(
    interview_data: InterviewCreate,
):
    """
    Schedule a new interview
    """
    print("interview_data", interview_data)   
    # Check if candidate exists
    candidate = await candidates_collection.find_one({"id": interview_data.candidate_id})
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID {interview_data.candidate_id} not found",
        )
    
    # Check if job exists
    job = await jobs_collection.find_one({"id": interview_data.job_id})
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {interview_data.job_id} not found",
        )
    
    # Create new interview
    interview_in_db = InterviewInDB(**interview_data.dict())
    new_interview = interview_in_db.dict()
    
    # Insert into database
    result = await interviews_collection.insert_one(new_interview)
    
    # Get created interview
    created_interview = await interviews_collection.find_one({"_id": result.inserted_id})
    
    # Update job interviews count
    await jobs_collection.update_one(
        {"id": interview_data.job_id},
        {"$inc": {"interviews": 1}}
    )
    
    return created_interview

@router.post("/", response_model=Candidate, status_code=status.HTTP_201_CREATED)
async def create_candidate(
    candidate_data: CandidateCreate,
):
    """
    Create a new candidate
    """
    # Check if candidate with email already exists
    existing_candidate = await candidates_collection.find_one({"email": candidate_data.email})
    if existing_candidate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Candidate with email {candidate_data.email} already exists",
        )
    
    # Create new candidate
    candidate_in_db = CandidateInDB(**candidate_data.dict())
    new_candidate = candidate_in_db.dict()
    
    # Insert into database
    result = await candidates_collection.insert_one(new_candidate)
    
    # Get created candidate
    created_candidate = await candidates_collection.find_one({"_id": result.inserted_id})
    
    return created_candidate


@router.get("/{candidate_id}", response_model=Candidate)
async def get_candidate(
    candidate_id: str,
):
    """
    Get a specific candidate by ID
    """
    candidate = await candidates_collection.find_one({"id": candidate_id})
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID {candidate_id} not found",
        )
    
    return candidate


@router.put("/{candidate_id}", response_model=Candidate)
async def update_candidate(
    candidate_id: str,
    candidate_data: CandidateUpdate,
):
    """
    Update a candidate
    """
    # Check if candidate exists
    candidate = await candidates_collection.find_one({"id": candidate_id})
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID {candidate_id} not found",
        )
    
    # Filter out None values from update data
    update_data = {k: v for k, v in candidate_data.dict().items() if v is not None}
    
    if not update_data:
        return candidate
    
    # Add updated timestamp
    from datetime import datetime
    update_data["updated_at"] = datetime.now()
    
    # Update candidate
    await candidates_collection.update_one(
        {"id": candidate_id},
        {"$set": update_data}
    )
    
    # Get updated candidate
    updated_candidate = await candidates_collection.find_one({"id": candidate_id})
    
    return updated_candidate


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate(
    candidate_id: str,
):
    """
    Delete a candidate
    """
    # Check if candidate exists
    candidate = await candidates_collection.find_one({"id": candidate_id})
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID {candidate_id} not found",
        )
    
    # Delete the candidate
    await candidates_collection.delete_one({"id": candidate_id})
    
    # Delete associated interviews
    await interviews_collection.delete_many({"candidate_id": candidate_id})
    
    return None


@router.patch("/{candidate_id}/status", response_model=Candidate)
async def update_candidate_status(
    candidate_id: str,
    status: str,
):
    """
    Update a candidate's status
    """
    # Check if candidate exists
    candidate = await candidates_collection.find_one({"id": candidate_id})
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID {candidate_id} not found",
        )
    
    # Update status
    from datetime import datetime
    await candidates_collection.update_one(
        {"id": candidate_id},
        {"$set": {"status": status, "updated_at": datetime.now()}}
    )
    
    # Get updated candidate
    updated_candidate = await candidates_collection.find_one({"id": candidate_id})
    
    return updated_candidate


@router.get("/{candidate_id}/interviews", response_model=List[Interview])
async def get_candidate_interviews(
    candidate_id: str,
):
    """
    Get all interviews for a specific candidate
    """
    # Check if candidate exists
    candidate = await candidates_collection.find_one({"id": candidate_id})
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID {candidate_id} not found",
        )
    
    # Get interviews
    cursor = interviews_collection.find({"candidate_id": candidate_id})
    interviews = await cursor.to_list(length=100)
    
    # Process interviews to ensure result field is properly structured
    for interview in interviews:
        if "result" in interview:
            # If result is a string like 'passed', 'failed', 'pending', set it to None
            if isinstance(interview["result"], str) or not isinstance(interview["result"], dict):
                interview["result"] = None
    
    return interviews 