"""
Seed script to initialize MongoDB with sample data.
This creates test data for users, candidates, jobs, and interviews.
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone
import random
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import pathlib

# Add parent directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.models.user import UserRole
from app.models.job import JobStatus, EmploymentType
from app.models.candidate import CandidateStatus
from app.models.interview import InterviewStatus, InterviewType

# Load environment variables from .env.development
env_path = pathlib.Path(__file__).parents[2] / '.env.development'
load_dotenv(dotenv_path=env_path)

# MongoDB connection from environment variables
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = MongoClient(MONGODB_URI)
db = client[DATABASE_NAME]

# Collections
users_collection = db["users"]
candidates_collection = db["candidates"]
jobs_collection = db["jobs"]
interviews_collection = db["interviews"]

# Define UTC+7 timezone
UTC_PLUS_7 = timezone(timedelta(hours=7))

# Helper function to get current time in UTC+7
def now_utc7():
    return datetime.now(UTC_PLUS_7)

# Sample data - Users
sample_users = [
    {
        "id": str(now_utc7().timestamp()),
        "username": "admin",
        "email": "admin@example.com",
        "fullname": "Admin User",
        "role": UserRole.ADMIN,
        "is_active": True,
        "department": "Administration",
        "position": "System Administrator",
        "phone": "+1-555-123-4567",
        "created_at": now_utc7(),
        "updated_at": now_utc7(),
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"  # password: secret
    },
    {
        "id": str(now_utc7().timestamp() + 1),
        "username": "hr_manager",
        "email": "hr@example.com",
        "fullname": "HR Manager",
        "role": UserRole.HR,
        "is_active": True,
        "department": "Human Resources",
        "position": "HR Manager",
        "phone": "+1-555-234-5678",
        "created_at": now_utc7(),
        "updated_at": now_utc7(),
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
    },
    {
        "id": str(now_utc7().timestamp() + 2),
        "username": "interviewer1",
        "email": "interviewer1@example.com",
        "fullname": "Technical Interviewer",
        "role": UserRole.INTERVIEWER,
        "is_active": True,
        "department": "Engineering",
        "position": "Senior Software Engineer",
        "phone": "+1-555-345-6789",
        "created_at": now_utc7(),
        "updated_at": now_utc7(),
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
    },
    {
        "id": str(now_utc7().timestamp() + 3),
        "username": "user",
        "email": "user@example.com",
        "fullname": "Regular User",
        "role": UserRole.USER,
        "is_active": True,
        "department": "Marketing",
        "position": "Marketing Specialist",
        "phone": "+1-555-456-7890",
        "created_at": now_utc7(),
        "updated_at": now_utc7(),
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
    }
]

# Sample data - Departments
departments = [
    "Engineering", 
    "Product", 
    "Marketing", 
    "Sales", 
    "Customer Support", 
    "Human Resources", 
    "Finance"
]

# Sample data - Jobs
job_titles = {
    "Engineering": ["Software Engineer", "Frontend Developer", "Backend Developer", "DevOps Engineer", "QA Engineer"],
    "Product": ["Product Manager", "Product Designer", "UX Designer", "UI Designer"],
    "Marketing": ["Marketing Manager", "Content Writer", "SEO Specialist", "Social Media Manager"],
    "Sales": ["Sales Representative", "Account Manager", "Sales Manager"],
    "Customer Support": ["Customer Support Specialist", "Support Engineer", "Support Manager"],
    "Human Resources": ["HR Specialist", "Recruiter", "HR Manager"],
    "Finance": ["Financial Analyst", "Accountant", "Finance Manager"]
}

# Sample data - Skills by department
skills_by_department = {
    "Engineering": ["Python", "JavaScript", "React", "Node.js", "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes"],
    "Product": ["Product Management", "Design Thinking", "Wireframing", "Prototyping", "User Research", "Figma", "Sketch"],
    "Marketing": ["Content Marketing", "SEO", "Social Media", "Email Marketing", "Google Analytics", "Adobe Creative Suite"],
    "Sales": ["CRM", "Negotiation", "Prospecting", "Closing", "Account Management", "HubSpot", "Salesforce"],
    "Customer Support": ["Communication", "Problem Solving", "Documentation", "Zendesk", "Intercom", "Technical Troubleshooting"],
    "Human Resources": ["Recruitment", "Onboarding", "Performance Management", "Compensation", "Benefits", "HR Software"],
    "Finance": ["Financial Analysis", "Accounting", "Forecasting", "Budgeting", "Excel", "QuickBooks", "Financial Reporting"]
}

# Helper function to generate dates
def generate_date():
    now = now_utc7()
    return now - timedelta(days=random.randint(0, 30))

def generate_future_date():
    now = now_utc7()
    return now + timedelta(days=random.randint(1, 14))

# Generate sample jobs
sample_jobs = []
job_id_by_title = {}

for i, dept in enumerate(departments):
    for j, title in enumerate(job_titles[dept]):
        job_id = str(now_utc7().timestamp() + i * 100 + j)
        job_id_by_title[title] = job_id
        
        posting_date = generate_date()
        
        # Randomly assign created_by and hiring_manager from HR or admin users
        created_by = sample_users[0]["id"] if random.random() > 0.5 else sample_users[1]["id"]
        hiring_manager = sample_users[1]["id"] if random.random() > 0.7 else sample_users[2]["id"]
        
        sample_jobs.append({
            "id": job_id,
            "title": title,
            "description": f"We are looking for a {title} to join our {dept} team.",
            "department": dept,
            "location": random.choice(["New York", "San Francisco", "Remote", "Berlin", "London", "Singapore"]),
            "requirements": random.choice(skills_by_department[dept]),
            "min_salary": random.randint(40, 80) * 1000,
            "max_salary": random.randint(90, 150) * 1000,
            "status": random.choice([s.value for s in JobStatus]),
            "is_remote": random.choice([True, False]),
            "employment_type": random.choice([e.value for e in EmploymentType]),
            "created_by": created_by,  # Foreign key to User model
            "hiring_manager": hiring_manager,  # Foreign key to User model
            "created_at": posting_date,
            "updated_at": posting_date,
            "posted_date": posting_date if random.random() > 0.2 else None,
            "closed_date": None,
            "applicants": 0,  # Will be calculated later
            "interviews": 0,   # Will be calculated later
            # New criteria fields
            "background_criteria": {
                "importance_ratio": 25,
                "required": f"Bachelor's degree in {dept} or related field with relevant experience.",
                "criteria": [
                    {
                        "description": f"Education level in {dept}",
                        "max_score": 5
                    },
                    {
                        "description": "Years of relevant experience",
                        "max_score": 5
                    }
                ]
            },
            "project_criteria": {
                "importance_ratio": 25,
                "required": f"Experience working on {dept} projects with demonstrable results.",
                "criteria": [
                    {
                        "description": f"Number of {dept} projects completed",
                        "max_score": 5
                    },
                    {
                        "description": "Project complexity and impact",
                        "max_score": 5
                    }
                ]
            },
            "skill_criteria": {
                "importance_ratio": 25,
                "required": f"Proficiency in {', '.join(random.sample(skills_by_department[dept], min(3, len(skills_by_department[dept]))))}.",
                "criteria": [
                    {
                        "description": f"Technical skills in {dept}",
                        "max_score": 5
                    },
                    {
                        "description": "Problem-solving abilities",
                        "max_score": 5
                    }
                ]
            },
            "certification_criteria": {
                "importance_ratio": 25,
                "required": f"Relevant certifications in {dept} are a plus but not required.",
                "criteria": [
                    {
                        "description": f"Professional certifications in {dept}",
                        "max_score": 5
                    },
                    {
                        "description": "Industry recognition and achievements",
                        "max_score": 5
                    }
                ]
            }
        })

# Sample data - Candidates
sample_candidates = []
candidate_ids = []

# Helper function to calculate cultural fit
def calculate_cultural_fit(candidate, job):
    # Calculate cultural fit based on skill match with job requirements
    if not job or not candidate:
        return 3  # Default value
        
    # Count matching skills
    matching_skills = len(set(candidate["skills"]).intersection(set(job["requirements"])))
    total_requirements = len(job["requirements"])
    
    if total_requirements == 0:
        return 3  # Default if no requirements
        
    # Calculate fit on a scale of 1-5
    match_ratio = matching_skills / total_requirements
    
    if match_ratio >= 0.8:
        return 5
    elif match_ratio >= 0.6:
        return 4
    elif match_ratio >= 0.4:
        return 3
    elif match_ratio >= 0.2:
        return 2
    else:
        return 1

# Helper function to calculate technical skills score
def calculate_technical_skills(candidate, job):
    if not job or not candidate:
        return 3
    
    # Calculate based on matching technical skills and experience
    matching_skills = len(set(candidate["skills"]).intersection(set(job["requirements"])))
    total_requirements = max(1, len(job["requirements"]))
    
    # Factor in experience
    experience_factor = min(candidate["experience"] / 5, 1)  # Cap at 1 for 5+ years
    
    # Calculate score on scale of 1-5
    skill_match_score = (matching_skills / total_requirements) * 4 + 1
    experience_score = experience_factor * 4 + 1
    
    return min(5, round((skill_match_score + experience_score) / 2))

# Helper function to calculate communication skills
def calculate_communication_skills(candidate):
    if not candidate:
        return 3
    
    # Assume certain jobs or departments indicate better communication
    communication_focused_departments = ["Marketing", "Sales", "Customer Support", "Human Resources"]
    communication_boost = 1 if candidate["department"] in communication_focused_departments else 0
    
    # Base score between 2-4 plus department boost
    base_score = 2 + communication_boost
    
    # Add some variation but keep within 1-5 range
    return max(1, min(5, base_score + random.choice([-1, 0, 1])))

# Helper function to calculate problem solving score
def calculate_problem_solving(candidate, job):
    if not job or not candidate:
        return 3
    
    # Technical roles typically require more problem solving
    problem_solving_departments = ["Engineering", "Product"]
    problem_solving_boost = 1 if candidate["department"] in problem_solving_departments else 0
    
    # Experience factor - more experience generally means better problem solving
    experience_factor = min(candidate["experience"] / 6, 1)  # Cap at 1 for 6+ years
    
    # Calculate score
    base_score = 2 + problem_solving_boost
    experience_score = experience_factor * 2
    
    return max(1, min(5, round(base_score + experience_score)))

for i in range(30):
    candidate_id = str(now_utc7().timestamp() + i)
    candidate_ids.append(candidate_id)
    
    dept = random.choice(departments)
    job_title = random.choice(job_titles[dept])
    job_id = job_id_by_title.get(job_title, "")
    applied_date = now_utc7() - timedelta(days=random.randint(0, 30))
    
    # Assign recruiter (HR user)
    assigned_recruiter = sample_users[1]["id"] if random.random() > 0.3 else None
    
    sample_candidates.append({
        "id": candidate_id,
        "name": f"Candidate {i+1}",
        "email": f"candidate{i+1}@example.com",
        "phone": f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
        "job_id": job_id,  # Foreign key to Job model
        "department": dept,
        "experience": random.randint(1, 10),
        "status": random.choice([s.value for s in CandidateStatus]),
        "resume_url": f"https://example.com/resumes/candidate{i+1}.pdf",
        "skills": random.sample(skills_by_department[dept], min(5, len(skills_by_department[dept]))),
        "notes": "Looks promising" if random.random() > 0.5 else "Needs further evaluation",
        "salary_expectation": random.randint(50, 120) * 1000,
        "source": random.choice(["LinkedIn", "Company Website", "Referral", "Job Board", "Recruiter"]),
        "current_company": f"Company {random.randint(1, 20)}",
        "current_position": random.choice(job_titles[dept]),
        "notice_period": random.choice([0, 15, 30, 60, 90]),
        "total_score": round(random.uniform(0, 10), 1),
        "background_score": round(random.uniform(0, 10), 1),
        "project_score": round(random.uniform(0, 10), 1),
        "skill_score": round(random.uniform(0, 10), 1),
        "certificate_score": round(random.uniform(0, 10), 1),
        "created_at": applied_date,
        "updated_at": applied_date,
        "applied_date": applied_date,
        "assigned_recruiter": assigned_recruiter  # Foreign key to User model
    })

# Generate sample interviews
sample_interviews = []

for i in range(50):
    # Only create interviews for candidates that exist and jobs that exist
    candidate_id = random.choice(candidate_ids)
    candidate = next((c for c in sample_candidates if c["id"] == candidate_id), None)
    
    if candidate:
        job_id = candidate["job_id"]
        job = next((j for j in sample_jobs if j["id"] == job_id), None)
        
        if job:
            # Pick an interviewer
            interviewer_id = sample_users[2]["id"] if random.random() > 0.5 else sample_users[1]["id"]
            
            # Generate past interview
            interview_date = generate_date()
            interview_id = str(now_utc7().timestamp() + i)
            
            # Only create result for completed interviews
            interview_status = random.choice([s.value for s in InterviewStatus])
            interview_result = None
            
            if interview_status == InterviewStatus.COMPLETED:
                # Calculate individual scores
                technical_score = calculate_technical_skills(candidate, job)
                communication_score = calculate_communication_skills(candidate)
                problem_solving_score = calculate_problem_solving(candidate, job)
                cultural_fit_score = calculate_cultural_fit(candidate, job)
                
                # Calculate overall rating based on average of scores
                rating = round((technical_score + communication_score + problem_solving_score + cultural_fit_score) / 4)
                
                interview_result = {
                    "interview_id": interview_id,
                    "rating": rating,
                    "feedback": f"Candidate performed {'well' if rating > 3 else 'poorly'}",
                    "strengths": random.sample(candidate["skills"], min(2, len(candidate["skills"]))),
                    "weaknesses": ["Communication Skills", "Problem Solving"] if rating < 4 else [],
                    "recommended_next_steps": "Schedule technical interview" if rating > 3 else "Reject",
                    "hiring_recommendation": rating > 3,
                    "technical_skills": technical_score,
                    "communication_skills": communication_score,
                    "problem_solving": problem_solving_score,
                    "cultural_fit": cultural_fit_score,
                    "submitted_by": interviewer_id,
                    "submitted_at": interview_date + timedelta(hours=1)
                }
            
            sample_interviews.append({
                "id": interview_id,
                "candidate_id": candidate_id,
                "job_id": job_id,
                "interviewer_id": interviewer_id,
                "scheduled_date": interview_date,
                "duration_minutes": random.choice([30, 45, 60, 90]),
                "status": interview_status,
                "type": random.choice([t.value for t in InterviewType]),
                "description": f"Interview for {job['title']} position",
                "location": "Video Call" if random.random() > 0.3 else "Office",
                "meeting_link": "https://meet.example.com/interview",
                "created_at": interview_date - timedelta(days=3),  # Created 3 days before the interview
                "updated_at": interview_date,
                "result": interview_result,
                "created_by": sample_users[1]["id"],  # HR created the interview
                "round_number": random.randint(1, 3)
            })
            
            # Generate future interview
            future_interview_date = generate_future_date()
            
            sample_interviews.append({
                "id": str(now_utc7().timestamp() + i + 1000),  # Different ID for future interview
                "candidate_id": candidate_id,
                "job_id": job_id,
                "interviewer_id": interviewer_id,
                "scheduled_date": future_interview_date,
                "duration_minutes": random.choice([30, 45, 60, 90]),
                "status": InterviewStatus.SCHEDULED,
                "type": random.choice([t.value for t in InterviewType]),
                "description": f"Upcoming interview for {job['title']} position",
                "location": "Video Call" if random.random() > 0.3 else "Office",
                "meeting_link": "https://meet.example.com/interview",
                "feedback_deadline": future_interview_date + timedelta(days=1),  # Feedback due 1 day after
                "created_at": now_utc7() - timedelta(days=random.randint(1, 5)),
                "updated_at": now_utc7(),
                "result": None,
                "created_by": sample_users[1]["id"],  # HR created the interview
                "round_number": random.randint(1, 3)
            })

async def seed_database():
    # Clear existing data
    users_collection.delete_many({})
    jobs_collection.delete_many({})
    candidates_collection.delete_many({})
    interviews_collection.delete_many({})
    
    # Insert new data
    users_collection.insert_many(sample_users)
    
    # Calculate and update job counters before inserting
    job_applicants_count = {}
    job_interviews_count = {}
    
    # Count applicants per job
    for candidate in sample_candidates:
        job_id = candidate["job_id"]
        if job_id:
            job_applicants_count[job_id] = job_applicants_count.get(job_id, 0) + 1
    
    # Count interviews per job
    for interview in sample_interviews:
        job_id = interview["job_id"]
        if job_id:
            job_interviews_count[job_id] = job_interviews_count.get(job_id, 0) + 1
    
    # Update job counts
    for job in sample_jobs:
        job_id = job["id"]
        job["applicants"] = job_applicants_count.get(job_id, 0)
        job["interviews"] = job_interviews_count.get(job_id, 0)
    
    jobs_collection.insert_many(sample_jobs)
    candidates_collection.insert_many(sample_candidates)
    interviews_collection.insert_many(sample_interviews)
    
    print(f"Database seeded with:")
    print(f"- {len(sample_users)} users")
    print(f"- {len(sample_jobs)} jobs")
    print(f"- {len(sample_candidates)} candidates")
    print(f"- {len(sample_interviews)} interviews")

if __name__ == "__main__":
    print("Seeding database...")
    asyncio.run(seed_database())
    print("Database seeding completed.") 