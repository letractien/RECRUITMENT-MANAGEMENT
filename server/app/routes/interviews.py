from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from ..email.email import send_interview_email
from ..db.database import interviews_collection, candidates_collection, jobs_collection
from ..models.interview import (
    Interview, 
    InterviewCreate, 
    InterviewInDB, 
    InterviewUpdate,
    InterviewResult
)
from datetime import datetime, timedelta

router = APIRouter(prefix="/interviews", tags=["interviews"])

# Thêm route xử lý gốc để tránh redirect
@router.get("", response_model=List[Interview])
async def get_interviews_no_slash(
    status: Optional[str] = None,
    interviewer_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """
    Get all interviews with optional filtering (no trailing slash)
    """
    return await get_interviews(status, interviewer_id, skip, limit)


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
    match_stage = {}
    
    if status:
        match_stage["status"] = status
        
    # If interviewer_id is provided, filter by it
    if interviewer_id:
        match_stage["interviewer_id"] = interviewer_id
    
    # Create aggregation pipeline
    pipeline = [
        {"$match": match_stage},
        {"$skip": skip},
        {"$limit": limit},
        # Join with candidates collection for candidate info
        {
            "$lookup": {
                "from": "candidates",
                "localField": "candidate_id",
                "foreignField": "id",
                "as": "candidate"
            }
        },
        # Join with jobs collection for job info
        {
            "$lookup": {
                "from": "jobs",
                "localField": "job_id",
                "foreignField": "id",
                "as": "job"
            }
        },
        # Join with candidates collection again for interviewer info
        {
            "$lookup": {
                "from": "candidates",
                "localField": "interviewer_id",
                "foreignField": "id",
                "as": "interviewer"
            }
        },
        # Process and structure the results
        {
            "$addFields": {
                "candidate_name": {
                    "$cond": {
                        "if": {"$gt": [{"$size": "$candidate"}, 0]},
                        "then": {
                            "$concat": [
                                {"$ifNull": [{"$arrayElemAt": ["$candidate.first_name", 0]}, ""]}, 
                                " ", 
                                {"$ifNull": [{"$arrayElemAt": ["$candidate.last_name", 0]}, ""]}
                            ]
                        },
                        "else": "Unknown Candidate"
                    }
                },
                "job_title": {
                    "$cond": {
                        "if": {"$gt": [{"$size": "$job"}, 0]},
                        "then": {"$ifNull": [{"$arrayElemAt": ["$job.title", 0]}, "Unknown Position"]},
                        "else": "Unknown Position"
                    }
                },
                "interviewer_name": {
                    "$cond": {
                        "if": {"$gt": [{"$size": "$interviewer"}, 0]},
                        "then": {
                            "$concat": [
                                {"$ifNull": [{"$arrayElemAt": ["$interviewer.first_name", 0]}, ""]}, 
                                " ", 
                                {"$ifNull": [{"$arrayElemAt": ["$interviewer.last_name", 0]}, ""]}
                            ]
                        },
                        "else": "Unknown Interviewer"
                    }
                },
                "result": {
                    "$cond": {
                        "if": {
                            "$or": [
                                {"$eq": [{"$type": "$result"}, "string"]},
                                {"$ne": [{"$type": "$result"}, "object"]}
                            ]
                        },
                        "then": None,
                        "else": "$result"
                    }
                }
            }
        },
        # Remove the arrays from the final output
        {
            "$project": {
                "candidate": 0,
                "job": 0,
                "interviewer": 0
            }
        }
    ]
    
    # Execute the aggregation pipeline
    interviews = await interviews_collection.aggregate(pipeline).to_list(length=limit)
    
    return interviews


@router.post("", response_model=Interview, status_code=status.HTTP_201_CREATED)
async def create_interview(
    interview_data: InterviewCreate,
):
    send_interview_email(interview_data.dict())
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


@router.get("/upcoming", response_model=List[dict])
async def get_upcoming_interviews(
    days: int = Query(7, description="Number of days to look ahead"),
    limit: int = Query(5, description="Maximum number of interviews to return")
):
    """
    Get upcoming interviews
    """
    # Calculate date range
    now = datetime.now()
    end_date = now + timedelta(days=days)
    
    # Find upcoming interviews
    interviews = interviews_collection.find({
        "scheduled_date": {"$gte": now, "$lte": end_date},
        "status": {"$nin": ["cancelled", "completed"]}
    }).sort("scheduled_date", 1).limit(limit)
    
    interviews = await interviews.to_list(length=limit)
    
    # Format and augment interview data
    upcoming = []
    for interview in interviews:
        # Get candidate info
        candidate = await candidates_collection.find_one({"id": interview.get("candidate_id")})
        candidate_name = "Unknown"
        if candidate:
            candidate_name = f"{candidate.get('first_name', '')} {candidate.get('last_name', '')}"
            if not candidate_name.strip():  # If name is empty
                candidate_name = candidate.get("name", "Unknown")
        
        # Get job info
        job = await jobs_collection.find_one({"id": interview.get("job_id")})
        job_title = job.get("title", "Unknown Position") if job else "Unknown Position"
        
        upcoming.append({
            "id": interview.get("id"),
            "candidateName": candidate_name,
            "jobTitle": job_title,
            "scheduledAt": interview.get("scheduled_date").isoformat() if interview.get("scheduled_date") else "",
            "type": interview.get("type", "Interview").title()
        })
    
    return upcoming


@router.get("/{interview_id}", response_model=Interview)
async def get_interview(
    interview_id: str,
):
    """
    Get a specific interview by ID
    """
    # Create aggregation pipeline
    pipeline = [
        {"$match": {"id": interview_id}},
        # Join with candidates collection for candidate info
        {
            "$lookup": {
                "from": "candidates",
                "localField": "candidate_id",
                "foreignField": "id",
                "as": "candidate"
            }
        },
        # Join with jobs collection for job info
        {
            "$lookup": {
                "from": "jobs",
                "localField": "job_id",
                "foreignField": "id",
                "as": "job"
            }
        },
        # Join with candidates collection again for interviewer info
        {
            "$lookup": {
                "from": "candidates",
                "localField": "interviewer_id",
                "foreignField": "id",
                "as": "interviewer"
            }
        },
        # Process and structure the results
        {
            "$addFields": {
                "candidate_name": {
                    "$cond": {
                        "if": {"$gt": [{"$size": "$candidate"}, 0]},
                        "then": {
                            "$concat": [
                                {"$ifNull": [{"$arrayElemAt": ["$candidate.first_name", 0]}, ""]}, 
                                " ", 
                                {"$ifNull": [{"$arrayElemAt": ["$candidate.last_name", 0]}, ""]}
                            ]
                        },
                        "else": "Unknown Candidate"
                    }
                },
                "job_title": {
                    "$cond": {
                        "if": {"$gt": [{"$size": "$job"}, 0]},
                        "then": {"$ifNull": [{"$arrayElemAt": ["$job.title", 0]}, "Unknown Position"]},
                        "else": "Unknown Position"
                    }
                },
                "interviewer_name": {
                    "$cond": {
                        "if": {"$gt": [{"$size": "$interviewer"}, 0]},
                        "then": {
                            "$concat": [
                                {"$ifNull": [{"$arrayElemAt": ["$interviewer.first_name", 0]}, ""]}, 
                                " ", 
                                {"$ifNull": [{"$arrayElemAt": ["$interviewer.last_name", 0]}, ""]}
                            ]
                        },
                        "else": "Unknown Interviewer"
                    }
                },
                "result": {
                    "$cond": {
                        "if": {
                            "$or": [
                                {"$eq": [{"$type": "$result"}, "string"]},
                                {"$ne": [{"$type": "$result"}, "object"]}
                            ]
                        },
                        "then": None,
                        "else": "$result"
                    }
                }
            }
        },
        # Remove the arrays from the final output
        {
            "$project": {
                "candidate": 0,
                "job": 0,
                "interviewer": 0
            }
        }
    ]
    
    # Execute the aggregation pipeline
    interview_results = await interviews_collection.aggregate(pipeline).to_list(length=1)
    
    if not interview_results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview with ID {interview_id} not found",
        )
    
    return interview_results[0]


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


@router.get("/job/{job_id}", response_model=List[Interview])
async def get_job_interviews(
    job_id: str,
):
    """
    Get all interviews for a specific job
    """
    # Check if job exists
    job = await jobs_collection.find_one({"id": job_id})
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found",
        )
    
    # Create aggregation pipeline
    pipeline = [
        {"$match": {"job_id": job_id}},
        # Join with candidates collection for candidate info
        {
            "$lookup": {
                "from": "candidates",
                "localField": "candidate_id",
                "foreignField": "id",
                "as": "candidate"
            }
        },
        # Join with candidates collection again for interviewer info
        {
            "$lookup": {
                "from": "candidates",
                "localField": "interviewer_id",
                "foreignField": "id",
                "as": "interviewer"
            }
        },
        # Process and structure the results
        {
            "$addFields": {
                "candidate_name": {
                    "$cond": {
                        "if": {"$gt": [{"$size": "$candidate"}, 0]},
                        "then": {
                            "$concat": [
                                {"$ifNull": [{"$arrayElemAt": ["$candidate.first_name", 0]}, ""]}, 
                                " ", 
                                {"$ifNull": [{"$arrayElemAt": ["$candidate.last_name", 0]}, ""]}
                            ]
                        },
                        "else": "Unknown Candidate"
                    }
                },
                "job_title": job.get("title", "Unknown Position"),
                "interviewer_name": {
                    "$cond": {
                        "if": {"$gt": [{"$size": "$interviewer"}, 0]},
                        "then": {
                            "$concat": [
                                {"$ifNull": [{"$arrayElemAt": ["$interviewer.first_name", 0]}, ""]}, 
                                " ", 
                                {"$ifNull": [{"$arrayElemAt": ["$interviewer.last_name", 0]}, ""]}
                            ]
                        },
                        "else": "Unknown Interviewer"
                    }
                },
                "result": {
                    "$cond": {
                        "if": {
                            "$or": [
                                {"$eq": [{"$type": "$result"}, "string"]},
                                {"$ne": [{"$type": "$result"}, "object"]}
                            ]
                        },
                        "then": None,
                        "else": "$result"
                    }
                }
            }
        },
        # Remove the arrays from the final output
        {
            "$project": {
                "candidate": 0,
                "interviewer": 0
            }
        }
    ]
    
    # Execute the aggregation pipeline
    interviews = await interviews_collection.aggregate(pipeline).to_list(length=100)
    
    return interviews


@router.get("/today", response_model=List[dict])
async def get_today_interviews():
    """
    Get all interviews scheduled for today
    """
    # Calculate today's date range
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    # Find today's interviews
    interviews = interviews_collection.find({
        "scheduled_date": {"$gte": today_start, "$lt": today_end},
        "status": {"$nin": ["cancelled"]}
    }).sort("scheduled_date", 1)
    
    interviews = await interviews.to_list(length=100)
    
    # Format and augment interview data
    today_interviews = []
    for interview in interviews:
        # Get additional data for each interview
        candidate_name = "Unknown"
        job_title = "Unknown Position"
        
        # Fetch candidate info
        candidate = await candidates_collection.find_one({"id": interview.get("candidate_id")})
        if candidate:
            candidate_name = f"{candidate.get('first_name', '')} {candidate.get('last_name', '')}"
            if not candidate_name.strip():  # If name is empty
                candidate_name = candidate.get("name", "Unknown")
        
        # Fetch job info
        job = await jobs_collection.find_one({"id": interview.get("job_id")})
        if job:
            job_title = job.get("title", "Unknown Position")
        
        # Format interview data
        today_interviews.append({
            "id": interview.get("id"),
            "candidateId": interview.get("candidate_id"),
            "candidateName": candidate_name,
            "jobId": interview.get("job_id"),
            "jobTitle": job_title,
            "interviewType": interview.get("type", "Interview"),
            "scheduledAt": interview.get("scheduled_date").isoformat() if interview.get("scheduled_date") else "",
            "duration": interview.get("duration_minutes", 60),
            "status": interview.get("status", "scheduled"),
            "interviewer": interview.get("interviewer_name", "")
        })
    
    return today_interviews


@router.get("/by-date/{date}", response_model=List[dict])
async def get_interviews_by_date(
    date: str  # Format: YYYY-MM-DD
):
    """
    Get all interviews scheduled for a specific date
    """
    try:
        # Parse the date string to datetime
        parsed_date = datetime.strptime(date, "%Y-%m-%d")
        day_start = parsed_date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        # Find interviews for the specified date
        interviews = interviews_collection.find({
            "scheduled_date": {"$gte": day_start, "$lt": day_end}
        }).sort("scheduled_date", 1)
        
        interviews = await interviews.to_list(length=100)
        
        # Format and augment interview data
        day_interviews = []
        for interview in interviews:
            # Get additional data for each interview
            candidate_name = "Unknown"
            job_title = "Unknown Position"
            
            # Fetch candidate info
            candidate = await candidates_collection.find_one({"id": interview.get("candidate_id")})
            if candidate:
                candidate_name = f"{candidate.get('first_name', '')} {candidate.get('last_name', '')}"
                if not candidate_name.strip():  # If name is empty
                    candidate_name = candidate.get("name", "Unknown")
            
            # Fetch job info
            job = await jobs_collection.find_one({"id": interview.get("job_id")})
            if job:
                job_title = job.get("title", "Unknown Position")
            
            # Format interview data
            day_interviews.append({
                "id": interview.get("id"),
                "candidateId": interview.get("candidate_id"),
                "candidateName": candidate_name,
                "jobId": interview.get("job_id"),
                "jobTitle": job_title,
                "interviewType": interview.get("type", "Interview"),
                "scheduledAt": interview.get("scheduled_date").isoformat() if interview.get("scheduled_date") else "",
                "duration": interview.get("duration_minutes", 60),
                "status": interview.get("status", "scheduled"),
                "interviewer": interview.get("interviewer_name", "")
            })
        
        return day_interviews
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date format. Please use YYYY-MM-DD."
        )


@router.get("/by-date-range/{start_date}/{end_date}", response_model=List[dict])
async def get_interviews_by_date_range(
    start_date: str,  # Format: YYYY-MM-DD
    end_date: str     # Format: YYYY-MM-DD
):
    """
    Get all interviews scheduled between a start date and end date (inclusive)
    """
    try:
        # Parse the date strings to datetime
        parsed_start_date = datetime.strptime(start_date, "%Y-%m-%d")
        start_day = parsed_start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        parsed_end_date = datetime.strptime(end_date, "%Y-%m-%d")
        end_day = parsed_end_date.replace(hour=23, minute=59, second=59, microsecond=999)
        
        # Use aggregation pipeline to join collections and get all data in one query
        pipeline = [
            {
                "$match": {
                    "scheduled_date": {"$gte": start_day, "$lte": end_day}
                }
            },
            {
                "$lookup": {
                    "from": "candidates",
                    "localField": "candidate_id",
                    "foreignField": "id",
                    "as": "candidate"
                }
            },
            {
                "$lookup": {
                    "from": "jobs",
                    "localField": "job_id",
                    "foreignField": "id",
                    "as": "job"
                }
            },
            {
                "$sort": {"scheduled_date": 1}
            },
            {
                "$project": {
                    "_id": 0,  # Exclude _id field
                    "id": 1,
                    "candidateId": "$candidate_id",
                    "candidateName": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$candidate.name", 0]},
                            "Unknown"
                        ]
                    },
                    "jobId": "$job_id",
                    "jobTitle": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$job.title", 0]},
                            "Unknown Position"
                        ]
                    },
                    "interviewType": {"$ifNull": ["$type", "Interview"]},
                    "scheduledAt": {
                        "$ifNull": [
                            {"$dateToString": {"date": "$scheduled_date", "format": "%Y-%m-%dT%H:%M:%S.%LZ"}},
                            ""
                        ]
                    },
                    "duration": {"$ifNull": ["$duration_minutes", 60]},
                    "status": {"$ifNull": ["$status", "scheduled"]},
                    "interviewer": {"$ifNull": ["$interviewer_name", ""]}
                }
            }
        ]
        
        interviews = await interviews_collection.aggregate(pipeline).to_list(length=500)
        return interviews
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date format. Please use YYYY-MM-DD."
        ) 