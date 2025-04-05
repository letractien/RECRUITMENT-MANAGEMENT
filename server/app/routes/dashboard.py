from fastapi import APIRouter, Query
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random

from ..db.database import jobs_collection, candidates_collection, interviews_collection

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_stats(
    time_range: str = Query("month", description="Time range for the stats (week, month, quarter, year)")
):
    """
    Get dashboard statistics
    """
    # Calculate date range
    start_date = get_date_from_range(time_range)
    
    # Get active jobs count
    active_jobs = await jobs_collection.count_documents({
            "status": "OPEN"
    })
    
    # Get new applications count
    new_applications = await candidates_collection.count_documents({
        "created_at": {"$gte": start_date}
    })
    
    # Get scheduled interviews count
    scheduled_interviews = await interviews_collection.count_documents({
        "scheduled_date": {"$gte": start_date},
        "status": {"$nin": ["cancelled", "completed"]}
    })
    
    # Get positions filled count
    positions_filled = await candidates_collection.count_documents({
        "status": "hired",
        "updated_at": {"$gte": start_date}
    })
    
    # Get previous period data for comparison
    previous_start = get_previous_period_start(time_range, start_date)
    previous_end = start_date
    
    # Get previous period applications
    prev_applications = await candidates_collection.count_documents({
        "created_at": {"$gte": previous_start, "$lt": previous_end}
    })
    
    # Get previous period interviews
    prev_interviews = await interviews_collection.count_documents({
        "scheduled_date": {"$gte": previous_start, "$lt": previous_end},
        "status": {"$nin": ["cancelled", "completed"]}
    })
    
    # Get previous period filled positions
    prev_filled = await candidates_collection.count_documents({
        "status": "hired",
        "updated_at": {"$gte": previous_start, "$lt": previous_end}
    })
    
    # Calculate changes
    applications_change = calculate_percentage_change(prev_applications, new_applications)
    interviews_change = calculate_percentage_change(prev_interviews, scheduled_interviews)
    filled_change = calculate_percentage_change(prev_filled, positions_filled)
    
    # For jobs, count the change in raw numbers (not percentage)
    prev_active_jobs = await jobs_collection.count_documents({
        "created_at": {"$gte": previous_start, "$lt": previous_end},
        "status": "OPEN"
    })

    active_jobs_change = active_jobs - prev_active_jobs
    return {
        "activeJobs": active_jobs,
        "activeJobsChange": active_jobs_change,
        "newApplications": new_applications,
        "applicationsChange": applications_change,
        "scheduledInterviews": scheduled_interviews,
        "interviewsChange": interviews_change,
        "positionsFilled": positions_filled,
        "filledChange": filled_change
    }


@router.get("/jobs-by-department")
async def get_jobs_by_department(
    time_range: str = Query("month", description="Time range for the data (week, month, quarter, year)")
):
    """
    Get job distribution by department
    """
    # Aggregate jobs by department
    pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}},
        {"$project": {"department": "$_id", "count": 1, "_id": 0}},
        {"$sort": {"count": -1}}
    ]
    
    cursor = jobs_collection.aggregate(pipeline)
    departments = await cursor.to_list(length=100)
    
    return departments


@router.get("/hiring-funnel")
async def get_hiring_funnel(
    time_range: str = Query("month", description="Time range for the data (week, month, quarter, year)")
):
    """
    Get hiring funnel data showing candidates at each stage
    """
    # Calculate date range
    start_date = get_date_from_range(time_range)
    
    # Count candidates at each stage
    pipeline = [
        {"$match": {"created_at": {"$gte": start_date}}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$project": {"stage": "$_id", "count": 1, "_id": 0}},
        {"$sort": {"count": -1}}
    ]
    
    cursor = candidates_collection.aggregate(pipeline)
    statuses = await cursor.to_list(length=100)
    
    # Ensure we have all stages in the funnel
    all_stages = ["applied", "screening", "interview", "offer", "hired", "rejected"]
    
    # Map actual stages to expected stages and fill in missing ones
    stage_map = {status["stage"]: status["count"] for status in statuses}
    
    hiring_funnel = []
    for stage in all_stages:
        hiring_funnel.append({
            "stage": stage.title(),
            "count": stage_map.get(stage, 0)
        })
    
    return hiring_funnel


@router.get("/recent-applications")
async def get_recent_applications(
    time_range: str = Query("month", description="Time range for the data (week, month, quarter, year)")
):
    """
    Get recent applications based on time range
    """
    # Calculate date range
    start_date = get_date_from_range(time_range)
    
    # Get filtered candidates
    cursor = candidates_collection.find({
        "created_at": {"$gte": start_date}
    }).sort("created_at", -1)
    
    candidates = await cursor.to_list(length=100)  # Lấy tối đa 100 ứng viên gần nhất
    
    # Get total count for the selected time range
    total = await candidates_collection.count_documents({
        "created_at": {"$gte": start_date}
    })
    
    # Format response
    applications = []
    for candidate in candidates:
        # Get job info for this candidate
        job = None
        if candidate.get("job_id"):
            job = await jobs_collection.find_one({"id": candidate.get("job_id")})
        
        applications.append({
            "id": candidate.get("id"),
            "candidate": candidate.get("name", "Unknown"),
            "position": job.get("title", "Unknown") if job else candidate.get("position", "Unknown"),
            "appliedDate": candidate.get("created_at").isoformat() if candidate.get("created_at") else "",
            "status": candidate.get("status", "Pending").title()
        })
    
    return {
        "applications": applications,
        "total": total
    }


@router.get("/upcoming-interviews")
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
    cursor = interviews_collection.find({
        "scheduled_date": {"$gte": now, "$lte": end_date},
        "status": {"$nin": ["cancelled", "completed"]}
    }).sort("scheduled_date", 1).limit(limit)
    
    interviews = await cursor.to_list(length=limit)
    
    # Format and augment interview data
    upcoming = []
    for interview in interviews:
        upcoming.append({
            "id": interview.get("id"),
            "candidateName": interview.get("candidate_name", "Unknown"),
            "jobTitle": interview.get("job_title", "Unknown"),
            "scheduledAt": interview.get("scheduled_date").isoformat() if interview.get("scheduled_date") else "",
            "type": interview.get("type", "Interview").title()
        })
    
    return upcoming


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = Query(10, description="Number of activities to return")
):
    """
    Get recent activity from database
    """
    activities = []
    
    # Get recent candidates (new applications)
    candidate_cursor = candidates_collection.find().sort("created_at", -1).limit(limit)
    recent_candidates = await candidate_cursor.to_list(length=limit)
    
    for candidate in recent_candidates:
        job = None
        if candidate.get("job_id"):
            job = await jobs_collection.find_one({"id": candidate.get("job_id")})
            
        job_title = job.get("title", "Unknown") if job else "Unknown Position"
        
        activities.append({
            "id": f"candidate_{candidate.get('id')}",
            "type": "application",
            "actor": candidate.get("name", "Unknown Candidate"),
            "action": "applied for",
            "target": job_title,
            "timestamp": candidate.get("created_at").isoformat() if candidate.get("created_at") else datetime.now().isoformat()
        })
    
    # Get recent interviews
    interview_cursor = interviews_collection.find().sort("created_at", -1).limit(limit)
    recent_interviews = await interview_cursor.to_list(length=limit)
    
    for interview in recent_interviews:
        candidate = await candidates_collection.find_one({"id": interview.get("candidate_id")})
        job = await jobs_collection.find_one({"id": interview.get("job_id")})
        
        candidate_name = candidate.get("name", "Unknown") if candidate else "Unknown Candidate"
        job_title = job.get("title", "Unknown") if job else "Unknown Position"
        
        activities.append({
            "id": f"interview_{interview.get('id')}",
            "type": "interview",
            "actor": candidate_name,
            "action": "scheduled for",
            "target": job_title,
            "timestamp": interview.get("created_at").isoformat() if interview.get("created_at") else datetime.now().isoformat()
        })
    
    # Get recent job postings
    job_cursor = jobs_collection.find().sort("created_at", -1).limit(limit)
    recent_jobs = await job_cursor.to_list(length=limit)
    
    for job in recent_jobs:
        activities.append({
            "id": f"job_{job.get('id')}",
            "type": "job_posting",
            "actor": job.get("title", "Unknown Position"),
            "action": "was posted",
            "target": job.get("department", ""),
            "timestamp": job.get("created_at").isoformat() if job.get("created_at") else datetime.now().isoformat()
        })
    
    # Sort all activities by timestamp (newest first)
    sorted_activities = sorted(
        activities, 
        key=lambda x: x["timestamp"], 
        reverse=True
    )
    
    # Return only the most recent activities up to the limit
    return sorted_activities[:limit]


@router.get("/application-trend")
async def get_application_trend(
    time_range: str = Query("month", description="Time range for the data (week, month, quarter, year)")
):
    """
    Get application trend data
    """
    now = datetime.now()
    group_id = "$created_at_day"
    
    # Set grouping format based on time range
    if time_range == "week":
        # Daily data for a week
        start_date = now - timedelta(days=7)
        pipeline_date_format = "%Y-%m-%d"
        group_stage = {
            "$addFields": {
                "created_at_day": {
                    "$dateToString": {"format": pipeline_date_format, "date": "$created_at"}
                }
            }
        }
    elif time_range == "month":
        # Weekly data for a month
        start_date = now - timedelta(days=30)
        pipeline_date_format = "%Y-%U" # Year and week number
        group_stage = {
            "$addFields": {
                "created_at_day": {
                    "$dateToString": {"format": pipeline_date_format, "date": "$created_at"}
                }
            }
        }
    elif time_range == "quarter":
        # Monthly data for a quarter
        start_date = now - timedelta(days=90)
        pipeline_date_format = "%Y-%m"
        group_stage = {
            "$addFields": {
                "created_at_day": {
                    "$dateToString": {"format": pipeline_date_format, "date": "$created_at"}
                }
            }
        }
    else:  # year
        # Quarterly data for a year
        start_date = now - timedelta(days=365)
        group_stage = {
            "$addFields": {
                "created_at_day": {
                    "$concat": [
                        {"$toString": {"$year": "$created_at"}},
                        "-Q",
                        {"$toString": {"$add": [{"$ceil": {"$divide": [{"$month": "$created_at"}, 3]}}, 0]}}
                    ]
                }
            }
        }
    
    # Application pipeline
    application_pipeline = [
        {"$match": {"created_at": {"$gte": start_date}}},
        group_stage,
        {"$group": {
            "_id": group_id,
            "applications": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    # Interview pipeline
    interview_pipeline = [
        {"$match": {"created_at": {"$gte": start_date}}},
        group_stage,
        {"$group": {
            "_id": group_id,
            "interviews": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    # Offers pipeline (candidates with offer status)
    offers_pipeline = [
        {"$match": {
            "created_at": {"$gte": start_date},
            "status": "offer"
        }},
        group_stage,
        {"$group": {
            "_id": group_id,
            "offers": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    # Execute aggregations
    app_cursor = candidates_collection.aggregate(application_pipeline)
    app_data = await app_cursor.to_list(length=100)
    
    interview_cursor = interviews_collection.aggregate(interview_pipeline)
    interview_data = await interview_cursor.to_list(length=100)
    
    offer_cursor = candidates_collection.aggregate(offers_pipeline)
    offer_data = await offer_cursor.to_list(length=100)
    
    # Create dictionaries for easy lookup
    app_dict = {item["_id"]: item["applications"] for item in app_data}
    interview_dict = {item["_id"]: item["interviews"] for item in interview_data}
    offer_dict = {item["_id"]: item["offers"] for item in offer_data}
    
    # Get all unique dates
    all_dates = sorted(set(
        list(app_dict.keys()) + 
        list(interview_dict.keys()) + 
        list(offer_dict.keys())
    ))
    
    # Build the final result
    trend_data = []
    for date_key in all_dates:
        trend_data.append({
            "date": date_key,
            "applications": app_dict.get(date_key, 0),
            "interviews": interview_dict.get(date_key, 0),
            "offers": offer_dict.get(date_key, 0)
        })
    
    return trend_data


# Helper functions
def get_date_from_range(time_range: str) -> datetime:
    """
    Calculate the start date of the current time period (week, month, quarter, year)
    """
    now = datetime.now()
    
    if time_range == "week":
        # Start of current week (Monday)
        start_of_week = now - timedelta(days=now.weekday())
        return datetime(start_of_week.year, start_of_week.month, start_of_week.day, 0, 0, 0)
    elif time_range == "month":
        # Start of current month
        return datetime(now.year, now.month, 1, 0, 0, 0)
    elif time_range == "quarter":
        # Start of current quarter
        quarter_month = ((now.month - 1) // 3) * 3 + 1
        return datetime(now.year, quarter_month, 1, 0, 0, 0)
    elif time_range == "year":
        # Start of current year
        return datetime(now.year, 1, 1, 0, 0, 0)
    else:
        # Default to month
        return datetime(now.year, now.month, 1, 0, 0, 0)


def get_previous_period_start(time_range: str, current_period_start: datetime) -> datetime:
    """
    Calculate the start date of the previous period
    """
    if time_range == "week":
        # Previous week
        return current_period_start - timedelta(days=7)
    elif time_range == "month":
        # Previous month
        if current_period_start.month == 1:
            return datetime(current_period_start.year - 1, 12, 1, 0, 0, 0)
        else:
            return datetime(current_period_start.year, current_period_start.month - 1, 1, 0, 0, 0)
    elif time_range == "quarter":
        # Previous quarter
        if current_period_start.month == 1:  # First quarter
            return datetime(current_period_start.year - 1, 10, 1, 0, 0, 0)
        else:
            previous_quarter_month = ((current_period_start.month - 1) - 3)
            if previous_quarter_month <= 0:
                previous_quarter_month += 12
            return datetime(
                current_period_start.year if previous_quarter_month > 9 else current_period_start.year - 1,
                previous_quarter_month, 
                1, 0, 0, 0
            )
    elif time_range == "year":
        # Previous year
        return datetime(current_period_start.year - 1, 1, 1, 0, 0, 0)
    else:
        # Default to previous month
        if current_period_start.month == 1:
            return datetime(current_period_start.year - 1, 12, 1, 0, 0, 0)
        else:
            return datetime(current_period_start.year, current_period_start.month - 1, 1, 0, 0, 0)


def calculate_percentage_change(previous: int, current: int) -> int:
    """
    Calculate percentage change between two values
    """
    if previous == 0:
        return 100 if current > 0 else 0
    
    change = ((current - previous) / previous) * 100
    return int(round(change)) 