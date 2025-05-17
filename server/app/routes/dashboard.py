from fastapi import APIRouter, Query
from datetime import datetime, timedelta

from ..db.database import jobs_collection, candidates_collection, interviews_collection

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("", tags=["dashboard"])
async def get_dashboard():
    """
    Get dashboard overview (no trailing slash)
    """
    return {"message": "Dashboard API is working"}


@router.get("/stats")
async def get_stats(
    time_range: str = Query("month", description="Time range for the stats (week, month, quarter, year)")
):
    """
    Get dashboard statistics
    """
    # Calculate date ranges
    start_date = get_date_from_range(time_range)
    previous_start = get_previous_period_start(time_range, start_date)
    previous_end = start_date
    
    # Aggregation pipeline cho jobs collection
    jobs_pipeline = [
        {
            "$facet": {
                "activeJobs": [
                    {"$match": {"status": "open"}},
                    {"$count": "count"}
                ],
                "prevActiveJobs": [
                    {"$match": {
                        "created_at": {"$gte": previous_start, "$lt": previous_end},
                        "status": "OPEN"
                    }},
                    {"$count": "count"}
                ]
            }
        }
    ]
    
    # Aggregation pipeline cho candidates collection
    candidates_pipeline = [
        {
            "$facet": {
                "newApplications": [
                    {"$match": {"created_at": {"$gte": start_date}}},
                    {"$count": "count"}
                ],
                "prevApplications": [
                    {"$match": {"created_at": {"$gte": previous_start, "$lt": previous_end}}},
                    {"$count": "count"}
                ],
                "positionsFilled": [
                    {"$match": {
                        "status": "hired",
                        "updated_at": {"$gte": start_date}
                    }},
                    {"$count": "count"}
                ],
                "prevFilled": [
                    {"$match": {
                        "status": "hired",
                        "updated_at": {"$gte": previous_start, "$lt": previous_end}
                    }},
                    {"$count": "count"}
                ]
            }
        }
    ]
    
    # Aggregation pipeline cho interviews collection
    interviews_pipeline = [
        {
            "$facet": {
                "scheduledInterviews": [
                    {"$match": {
                        "scheduled_date": {"$gte": start_date},
                        "status": {"$nin": ["cancelled", "completed"]}
                    }},
                    {"$count": "count"}
                ],
                "prevInterviews": [
                    {"$match": {
                        "scheduled_date": {"$gte": previous_start, "$lt": previous_end},
                        "status": {"$nin": ["cancelled", "completed"]}
                    }},
                    {"$count": "count"}
                ]
            }
        }
    ]
    
    # Thực thi các aggregation pipelines
    jobs_results = await jobs_collection.aggregate(jobs_pipeline).to_list(length=1)
    candidates_results = await candidates_collection.aggregate(candidates_pipeline).to_list(length=1)
    interviews_results = await interviews_collection.aggregate(interviews_pipeline).to_list(length=1)
    
    # Lấy kết quả từ jobs collection
    jobs_result = jobs_results[0] if jobs_results else {}
    
    # An toàn khi truy cập vào mảng - xử lý trường hợp mảng rỗng
    active_jobs = jobs_result.get("activeJobs", [])
    active_jobs = active_jobs[0].get("count", 0) if active_jobs else 0
    
    prev_active_jobs_list = jobs_result.get("prevActiveJobs", [])
    prev_active_jobs = prev_active_jobs_list[0].get("count", 0) if prev_active_jobs_list else 0
    
    # Lấy kết quả từ candidates collection
    candidates_result = candidates_results[0] if candidates_results else {}
    
    new_applications_list = candidates_result.get("newApplications", [])
    new_applications = new_applications_list[0].get("count", 0) if new_applications_list else 0
    
    prev_applications_list = candidates_result.get("prevApplications", [])
    prev_applications = prev_applications_list[0].get("count", 0) if prev_applications_list else 0
    
    positions_filled_list = candidates_result.get("positionsFilled", [])
    positions_filled = positions_filled_list[0].get("count", 0) if positions_filled_list else 0
    
    prev_filled_list = candidates_result.get("prevFilled", [])
    prev_filled = prev_filled_list[0].get("count", 0) if prev_filled_list else 0
    
    # Lấy kết quả từ interviews collection
    interviews_result = interviews_results[0] if interviews_results else {}
    
    scheduled_interviews_list = interviews_result.get("scheduledInterviews", [])
    scheduled_interviews = scheduled_interviews_list[0].get("count", 0) if scheduled_interviews_list else 0
    
    prev_interviews_list = interviews_result.get("prevInterviews", [])
    prev_interviews = prev_interviews_list[0].get("count", 0) if prev_interviews_list else 0
    
    # Tính toán sự thay đổi
    applications_change = calculate_percentage_change(prev_applications, new_applications)
    interviews_change = calculate_percentage_change(prev_interviews, scheduled_interviews)
    filled_change = calculate_percentage_change(prev_filled, positions_filled)
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
    # Tính toán khoảng thời gian
    start_date = get_date_from_range(time_range)
    
    # Aggregate jobs by department với bộ lọc thời gian
    # Bao gồm cả những bản ghi không có trường created_at
    pipeline = [
        {"$match": {"$or": [
            {"created_at": {"$gte": start_date}},
            {"created_at": {"$exists": False}}
        ]}},
        {"$group": {"_id": "$department", "count": {"$sum": 1}}},
        {"$project": {"department": "$_id", "count": 1, "_id": 0}},
        {"$sort": {"count": -1}}
    ]
    
    jobs_by_department = jobs_collection.aggregate(pipeline)
    jobs_by_department = await jobs_by_department.to_list(length=100)
    
    return jobs_by_department


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
    
    statuses = candidates_collection.aggregate(pipeline)
    statuses = await statuses.to_list(length=100)
    
    # Ensure we have all stages in the funnel
    all_stages = ["new", "screening", "interview", "offer", "hired", "rejected"]
    
    # Map actual stages to expected stages and fill in missing ones
    stage_map = {status["stage"]: status["count"] for status in statuses}
    
    hiring_funnel = []
    for stage in all_stages:
        display_name = stage.title()
        hiring_funnel.append({
            "stage": display_name,
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
    
    # Aggregation pipeline để lấy ứng viên gần đây và thông tin công việc của họ
    pipeline = [
        # Lọc ứng viên theo khoảng thời gian
        {"$match": {"created_at": {"$gte": start_date}}},
        # Sắp xếp theo thời gian tạo (mới nhất trước)
        {"$sort": {"created_at": -1}},
        # Giới hạn số lượng kết quả
        {"$limit": 10},
        # Lookup thông tin công việc
        {"$lookup": {
            "from": "jobs",
            "localField": "job_id",
            "foreignField": "id",
            "as": "job_info"
        }},
        # Định dạng kết quả trả về
        {"$project": {
            "_id": 0,
            "id": 1,
            "candidate": {"$ifNull": ["$name", "Unknown"]},
            "position": {
                "$cond": {
                    "if": {"$gt": [{"$size": "$job_info"}, 0]},
                    "then": {"$ifNull": [{"$arrayElemAt": ["$job_info.title", 0]}, "Unknown"]},
                    "else": {"$ifNull": ["$position", "Unknown"]}
                }
            },
            "appliedDate": {
                "$cond": {
                    "if": "$created_at",
                    "then": {"$dateToString": {"format": "%Y-%m-%dT%H:%M:%S.%LZ", "date": "$created_at"}},
                    "else": ""
                }
            },
            "status": {
                "$cond": {
                    "if": "$status",
                    "then": {
                        "$switch": {
                            "branches": [
                                {"case": {"$eq": ["$status", "new"]}, "then": "New"},
                                {"case": {"$eq": ["$status", "screening"]}, "then": "Screening"},
                                {"case": {"$eq": ["$status", "interview"]}, "then": "Interview"},
                                {"case": {"$eq": ["$status", "offer"]}, "then": "Offer"},
                                {"case": {"$eq": ["$status", "hired"]}, "then": "Hired"},
                                {"case": {"$eq": ["$status", "rejected"]}, "then": "Rejected"}
                            ],
                            "default": {"$concat": [
                                {"$toUpper": {"$substrCP": ["$status", 0, 1]}},
                                {"$cond": {
                                    "if": {"$gt": [{"$strLenCP": "$status"}, 1]},
                                    "then": {"$substrCP": ["$status", 1, {"$subtract": [{"$strLenCP": "$status"}, 1]}]},
                                    "else": ""
                                }}
                            ]}
                        }
                    },
                    "else": "Pending"
                }
            }
        }}
    ]
    
    # Thực hiện các aggregation
    applications = await candidates_collection.aggregate(pipeline).to_list(length=100)
    
    return applications


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
    
    # Aggregation pipeline để lấy phỏng vấn sắp tới và thông tin liên quan
    pipeline = [
        # Lọc các phỏng vấn trong phạm vi ngày
        {"$match": {
            "scheduled_date": {"$gte": now, "$lte": end_date},
            "status": {"$nin": ["cancelled", "completed"]}
        }},
        # Sắp xếp theo ngày phỏng vấn
        {"$sort": {"scheduled_date": 1}},
        # Giới hạn số lượng kết quả
        {"$limit": limit},
        # Lookup thông tin ứng viên
        {"$lookup": {
            "from": "candidates",
            "localField": "candidate_id",
            "foreignField": "id",
            "as": "candidate_info"
        }},
        # Lookup thông tin công việc
        {"$lookup": {
            "from": "jobs",
            "localField": "job_id",
            "foreignField": "id",
            "as": "job_info"
        }},
        # Định dạng kết quả trả về
        {"$project": {
            "_id": 0,
            "id": 1,
            "candidateName": {
                "$let": {
                    "vars": {
                        "candidate": {"$arrayElemAt": ["$candidate_info", 0]}
                    },
                    "in": {
                        "$cond": {
                            "if": {"$and": [
                                {"$ifNull": ["$$candidate.first_name", ""]}, 
                                {"$ifNull": ["$$candidate.last_name", ""]}
                            ]},
                            "then": {
                                "$concat": [
                                    {"$ifNull": ["$$candidate.first_name", ""]}, 
                                    " ", 
                                    {"$ifNull": ["$$candidate.last_name", ""]}
                                ]
                            },
                            "else": {"$ifNull": ["$$candidate.name", "Unknown"]}
                        }
                    }
                }
            },
            "jobTitle": {
                "$ifNull": [
                    {"$arrayElemAt": ["$job_info.title", 0]},
                    "Unknown Position"
                ]
            },
            "scheduledAt": {
                "$cond": {
                    "if": "$scheduled_date",
                    "then": {"$dateToString": {"format": "%Y-%m-%dT%H:%M:%S.%LZ", "date": "$scheduled_date"}},
                    "else": ""
                }
            },
            "type": {
                "$cond": {
                    "if": "$type",
                    "then": {
                        "$switch": {
                            "branches": [
                                {"case": {"$eq": ["$type", "interview"]}, "then": "Interview"},
                                {"case": {"$eq": ["$type", "screening"]}, "then": "Screening"},
                                {"case": {"$eq": ["$type", "technical"]}, "then": "Technical"},
                                {"case": {"$eq": ["$type", "final"]}, "then": "Final"}
                            ],
                            "default": {"$concat": [
                                {"$toUpper": {"$substrCP": ["$type", 0, 1]}},
                                {"$cond": {
                                    "if": {"$gt": [{"$strLenCP": "$type"}, 1]},
                                    "then": {"$substrCP": ["$type", 1, {"$subtract": [{"$strLenCP": "$type"}, 1]}]},
                                    "else": ""
                                }}
                            ]}
                        }
                    },
                    "else": "Interview"
                }
            }
        }}
    ]
    
    # Thực hiện aggregation
    upcoming = await interviews_collection.aggregate(pipeline).to_list(length=limit)
    
    return upcoming


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = Query(10, description="Number of activities to return")
):
    """
    Get recent activity from database
    """
    # Lấy hoạt động dựa trên candidates tạo mới
    candidates_pipeline = [
        {"$sort": {"created_at": -1}},
        {"$limit": limit},
        {"$lookup": {
            "from": "jobs",
            "localField": "job_id",
            "foreignField": "id",
            "as": "job_info"
        }},
        {"$project": {
            "type": {"$literal": "application"},
            "actor": {"$ifNull": ["$name", "Unknown Candidate"]},
            "action": {"$literal": "applied for"},
            "target": {
                "$ifNull": [
                    {"$arrayElemAt": ["$job_info.title", 0]},
                    "Unknown Position"
                ]
            },
            "timestamp": {"$ifNull": ["$created_at", "$$NOW"]},
            "_id": 0,
            "id": {"$concat": ["candidate_", {"$toString": "$id"}]}
        }}
    ]

    # Lấy hoạt động dựa trên interviews tạo mới
    interviews_pipeline = [
        {"$sort": {"created_at": -1}},
        {"$limit": limit},
        {"$lookup": {
            "from": "jobs",
            "localField": "job_id",
            "foreignField": "id",
            "as": "job_info"
        }},
        {"$lookup": {
            "from": "candidates",
            "localField": "candidate_id",
            "foreignField": "id",
            "as": "candidate_info"
        }},
        {"$project": {
            "type": {"$literal": "interview"},
            "actor": {
                "$ifNull": [
                    {"$arrayElemAt": ["$candidate_info.name", 0]},
                    "Unknown Candidate"
                ]
            },
            "action": {"$literal": "scheduled for"},
            "target": {
                "$ifNull": [
                    {"$arrayElemAt": ["$job_info.title", 0]},
                    "Unknown Position"
                ]
            },
            "timestamp": {"$ifNull": ["$created_at", "$$NOW"]},
            "_id": 0,
            "id": {"$concat": ["interview_", {"$toString": "$id"}]}
        }}
    ]

    # Lấy hoạt động dựa trên jobs tạo mới
    jobs_pipeline = [
        {"$sort": {"created_at": -1}},
        {"$limit": limit},
        {"$project": {
            "type": {"$literal": "job_posting"},
            "actor": {"$ifNull": ["$title", "Unknown Position"]},
            "action": {"$literal": "was posted"},
            "target": {"$ifNull": ["$department", ""]},
            "timestamp": {"$ifNull": ["$created_at", "$$NOW"]},
            "_id": 0,
            "id": {"$concat": ["job_", {"$toString": "$id"}]}
        }}
    ]

    # Thực thi các pipeline
    candidate_activities = await candidates_collection.aggregate(candidates_pipeline).to_list(length=limit)
    interview_activities = await interviews_collection.aggregate(interviews_pipeline).to_list(length=limit)
    job_activities = await jobs_collection.aggregate(jobs_pipeline).to_list(length=limit)

    # Gộp và sắp xếp tất cả hoạt động
    all_activities = candidate_activities + interview_activities + job_activities
    sorted_activities = sorted(
        all_activities,
        key=lambda x: x["timestamp"],
        reverse=True
    )

    # Trả về các hoạt động gần đây nhất
    return sorted_activities[:limit]


@router.get("/application-trend")
async def get_application_trend(
    time_range: str = Query("month", description="Time range for the data (week, month, quarter, year)")
):
    """
    Get application trend data
    """
    now = datetime.now()
    
    # Set grouping format based on time range
    if time_range == "week":
        # Daily data for a week
        start_date = now - timedelta(days=7)
        pipeline_date_format = "%Y-%m-%d"
        
    elif time_range == "month":
        # Weekly data for a month
        start_date = now - timedelta(days=30)
        pipeline_date_format = "%Y-%U" # Year and week number
        
    elif time_range == "quarter":
        # Monthly data for a quarter
        start_date = now - timedelta(days=90)
        pipeline_date_format = "%Y-%m"
        
    else:  # year
        # Quarterly data for a year
        start_date = now - timedelta(days=365)
        pipeline_date_format = "year-quarter"
    
    # Tạo định dạng date string phù hợp cho từng collection
    candidates_pipeline = []
    interviews_pipeline = []
    
    # Xác định stage cho việc định dạng ngày tháng
    if pipeline_date_format == "year-quarter":
        # Trường hợp đặc biệt cho định dạng năm-quý
        candidates_date_format_stage = {
            "$addFields": {
                "date_key": {
                    "$concat": [
                        {"$toString": {"$year": "$created_at"}},
                        "-Q",
                        {"$toString": {"$add": [{"$ceil": {"$divide": [{"$month": "$created_at"}, 3]}}, 0]}}
                    ]
                }
            }
        }
        
        interviews_date_format_stage = {
            "$addFields": {
                "date_key": {
                    "$concat": [
                        {"$toString": {"$year": "$created_at"}},
                        "-Q",
                        {"$toString": {"$add": [{"$ceil": {"$divide": [{"$month": "$created_at"}, 3]}}, 0]}}
                    ]
                }
            }
        }
    else:
        # Định dạng ngày tháng thông thường
        candidates_date_format_stage = {
            "$addFields": {
                "date_key": {
                    "$dateToString": {"format": pipeline_date_format, "date": "$created_at"}
                }
            }
        }
        
        interviews_date_format_stage = {
            "$addFields": {
                "date_key": {
                    "$dateToString": {"format": pipeline_date_format, "date": "$created_at"}
                }
            }
        }
    
    # Candidates collection - sử dụng facet để thực hiện hai pipeline trong một truy vấn
    candidates_pipeline = [
        {"$match": {"created_at": {"$gte": start_date}}},
        candidates_date_format_stage,
        {"$facet": {
            "applications": [
                {"$group": {
                    "_id": "$date_key",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}}
            ],
            "offers": [
                {"$match": {"status": "offer"}},
                {"$group": {
                    "_id": "$date_key",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}}
            ]
        }}
    ]
    
    # Interviews collection
    interviews_pipeline = [
        {"$match": {"created_at": {"$gte": start_date}}},
        interviews_date_format_stage,
        {"$group": {
            "_id": "$date_key",
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    # Thực thi các aggregation
    candidates_results = await candidates_collection.aggregate(candidates_pipeline).to_list(length=1)
    interviews_results = await interviews_collection.aggregate(interviews_pipeline).to_list(length=100)
    
    # Xử lý kết quả từ candidates - xử lý an toàn với mảng rỗng
    if candidates_results and len(candidates_results) > 0:
        candidates_result = candidates_results[0]
        applications_data = candidates_result.get("applications", []) if candidates_result else []
        offers_data = candidates_result.get("offers", []) if candidates_result else []
    else:
        applications_data = []
        offers_data = []
    
    # Tạo dictionaries cho việc tra cứu dễ dàng
    app_dict = {item["_id"]: item["count"] for item in applications_data}
    offer_dict = {item["_id"]: item["count"] for item in offers_data}
    interview_dict = {item["_id"]: item["count"] for item in interviews_results}
    
    # Lấy tất cả các ngày duy nhất
    all_dates = sorted(set(
        list(app_dict.keys()) + 
        list(interview_dict.keys()) + 
        list(offer_dict.keys())
    ))
    
    # Xây dựng kết quả cuối cùng
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