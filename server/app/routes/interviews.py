from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

from ..db.database import interviews_collection, candidates_collection, jobs_collection
from ..models.interview import (
    Interview, 
    InterviewCreate, 
    InterviewInDB, 
    InterviewUpdate,
    InterviewResult
)
from datetime import datetime

router = APIRouter(prefix="/interviews", tags=["interviews"])


@router.get("/", response_model=List[Interview])
async def get_interviews(
    status: Optional[str] = None,
    interviewer_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """
    Get all interviews with optional filtering
    """
    # Build the filter query
    query = {}
    
    if status:
        query["status"] = status
        
    # If interviewer_id is provided, filter by it
    if interviewer_id:
        query["interviewer_id"] = interviewer_id
    
    # Fetch interviews
    cursor = interviews_collection.find(query).skip(skip).limit(limit)
    interviews = await cursor.to_list(length=limit)
    
    # Enhance interviews with related information
    enhanced_interviews = []
    
    for interview in interviews:
        # Fetch candidate info
        candidate = await candidates_collection.find_one({"id": interview["candidate_id"]})
        if candidate:
            interview["candidate_name"] = f"{candidate.get('first_name', '')} {candidate.get('last_name', '')}"
        else:
            interview["candidate_name"] = "Unknown Candidate"
            
        # Fetch job info
        job = await jobs_collection.find_one({"id": interview["job_id"]})
        if job:
            interview["job_title"] = job.get("title", "Unknown Position")
        else:
            interview["job_title"] = "Unknown Position"
            
        # Fetch interviewer info (assuming there's an interviewers collection)
        try:
            interviewer = await candidates_collection.find_one({"id": interview["interviewer_id"]})
            if interviewer:
                interview["interviewer_name"] = f"{interviewer.get('first_name', '')} {interviewer.get('last_name', '')}"
            else:
                interview["interviewer_name"] = "Unknown Interviewer"
        except:
            interview["interviewer_name"] = "Unknown Interviewer"
            
        enhanced_interviews.append(interview)
    
    return enhanced_interviews


@router.post("/", response_model=Interview, status_code=status.HTTP_201_CREATED)
async def create_interview(
    interview_data: InterviewCreate,
):
    """
    Schedule a new interview
    """
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


@router.get("/{interview_id}", response_model=Interview)
async def get_interview(
    interview_id: str,
):
    """
    Get a specific interview by ID
    """
    interview = await interviews_collection.find_one({"id": interview_id})
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview with ID {interview_id} not found",
        )
    
    # Enhance interview with related information
    # Fetch candidate info
    candidate = await candidates_collection.find_one({"id": interview["candidate_id"]})
    if candidate:
        interview["candidate_name"] = f"{candidate.get('first_name', '')} {candidate.get('last_name', '')}"
    else:
        interview["candidate_name"] = "Unknown Candidate"
        
    # Fetch job info
    job = await jobs_collection.find_one({"id": interview["job_id"]})
    if job:
        interview["job_title"] = job.get("title", "Unknown Position")
    else:
        interview["job_title"] = "Unknown Position"
        
    # Fetch interviewer info
    try:
        interviewer = await candidates_collection.find_one({"id": interview["interviewer_id"]})
        if interviewer:
            interview["interviewer_name"] = f"{interviewer.get('first_name', '')} {interviewer.get('last_name', '')}"
        else:
            interview["interviewer_name"] = "Unknown Interviewer"
    except:
        interview["interviewer_name"] = "Unknown Interviewer"
    
    return interview


@router.put("/{interview_id}", response_model=Interview)
async def update_interview(
    interview_id: str,
    interview_data: InterviewUpdate,
):
    """
    Update an interview
    """
    # Check if interview exists
    interview = await interviews_collection.find_one({"id": interview_id})
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview with ID {interview_id} not found",
        )
    
    # Filter out None values from update data
    update_data = {k: v for k, v in interview_data.dict().items() if v is not None}
    
    if not update_data:
        return interview
    
    # Add updated timestamp
    update_data["updated_at"] = datetime.now()
    
    # Update interview
    await interviews_collection.update_one(
        {"id": interview_id},
        {"$set": update_data}
    )
    
    # Get updated interview
    updated_interview = await interviews_collection.find_one({"id": interview_id})
    
    return updated_interview


@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interview(
    interview_id: str,
):
    """
    Delete an interview
    """
    # Check if interview exists
    interview = await interviews_collection.find_one({"id": interview_id})
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview with ID {interview_id} not found",
        )
    
    # Delete the interview
    await interviews_collection.delete_one({"id": interview_id})
    
    # Update job interviews count
    await jobs_collection.update_one(
        {"id": interview["job_id"]},
        {"$inc": {"interviews": -1}}
    )
    
    return None


@router.patch("/{interview_id}/status", response_model=Interview)
async def update_interview_status(
    interview_id: str,
    status: str,
):
    """
    Update an interview's status
    """
    # Check if interview exists
    interview = await interviews_collection.find_one({"id": interview_id})
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview with ID {interview_id} not found",
        )
    
    # Update status
    await interviews_collection.update_one(
        {"id": interview_id},
        {"$set": {"status": status, "updated_at": datetime.now()}}
    )
    
    # Get updated interview
    updated_interview = await interviews_collection.find_one({"id": interview_id})
    
    return updated_interview


@router.post("/{interview_id}/result", response_model=Interview)
async def add_interview_result(
    interview_id: str,
    result_data: InterviewResult,
):
    """
    Add result to an interview
    """
    # Check if interview exists
    interview = await interviews_collection.find_one({"id": interview_id})
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview with ID {interview_id} not found",
        )
    
    # Mark interview as completed
    await interviews_collection.update_one(
        {"id": interview_id},
        {
            "$set": {
                "status": "completed", 
                "updated_at": datetime.now(),
                "result": result_data.dict()
            }
        }
    )
    
    # Get updated interview
    updated_interview = await interviews_collection.find_one({"id": interview_id})
    
    # Optionally update candidate status based on result
    if result_data.hiring_recommendation:
        await candidates_collection.update_one(
            {"id": interview["candidate_id"]},
            {"$set": {"status": "offer", "updated_at": datetime.now()}}
        )
    
    return updated_interview 