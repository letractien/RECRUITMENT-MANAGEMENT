"""
Seed script to initialize MongoDB with sample data.
This creates test data for users, candidates, jobs, and interviews.
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta
import random
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import pathlib

# Add parent directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.models.user import UserRole

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

# Sample data - Users
sample_users = [
    {
        "id": str(datetime.now().timestamp()),
        "username": "admin",
        "email": "admin@example.com",
        "fullname": "Admin User",
        "role": UserRole.ADMIN,
        "is_active": True,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "id": str(datetime.now().timestamp() + 1),
        "username": "hr_manager",
        "email": "hr@example.com",
        "fullname": "HR Manager",
        "role": UserRole.HR,
        "is_active": True,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "id": str(datetime.now().timestamp() + 2),
        "username": "interviewer1",
        "email": "interviewer1@example.com",
        "fullname": "Technical Interviewer",
        "role": UserRole.INTERVIEWER,
        "is_active": True,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    {
        "id": str(datetime.now().timestamp() + 3),
        "username": "user",
        "email": "user@example.com",
        "fullname": "Regular User",
        "role": UserRole.USER,
        "is_active": True,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
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

# Generate sample jobs
sample_jobs = []
job_id_by_title = {}

# Helper function to generate dates
def generate_date():
    now = datetime.now()
    return now - timedelta(days=random.randint(0, 30))

def generate_future_date():
    now = datetime.now()
    return now + timedelta(days=random.randint(1, 14))

for i, dept in enumerate(departments):
    for j, title in enumerate(job_titles[dept]):
        job_id = str(datetime.now().timestamp() + i * 100 + j)
        job_id_by_title[title] = job_id
        
        posting_date = generate_date()
        sample_jobs.append({
            "id": job_id,
            "title": title,
            "description": f"We are looking for a {title} to join our {dept} team.",
            "department": dept,
            "location": random.choice(["New York", "San Francisco", "Remote", "Berlin", "London", "Singapore"]),
            "requirements": random.sample(skills_by_department[dept], min(4, len(skills_by_department[dept]))),
            "responsibilities": [
                f"Work with the {dept} team on various projects",
                "Collaborate with cross-functional teams",
                "Contribute to the company's growth",
                "Implement best practices"
            ],
            "min_salary": random.randint(40, 80) * 1000,
            "max_salary": random.randint(90, 150) * 1000,
            "status": random.choice(["open", "closed", "draft", "paused"]),
            "is_remote": random.choice([True, False]),
            "employment_type": random.choice(["full-time", "part-time", "contract"]),
            "created_at": posting_date,
            "updated_at": posting_date,
            "posted_date": posting_date if random.random() > 0.2 else None,
            "closed_date": None,
            "applicants": random.randint(0, 20),
            "interviews": random.randint(0, 10)
        })

# Generate sample candidates
sample_candidates = []
candidate_ids = []

for i in range(30):
    candidate_id = str(datetime.now().timestamp() + i)
    candidate_ids.append(candidate_id)
    
    dept = random.choice(departments)
    position = random.choice(job_titles[dept])
    applied_date = datetime.now() - timedelta(days=random.randint(0, 30))
    
    sample_candidates.append({
        "id": candidate_id,
        "name": f"Candidate {i+1}",
        "email": f"candidate{i+1}@example.com",
        "phone": f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
        "position": position,
        "department": dept,
        "experience": random.randint(1, 10),
        "status": random.choice(["new", "screening", "interview", "offer", "hired", "rejected"]),
        "resume_url": f"https://example.com/resumes/candidate{i+1}.pdf",
        "skills": random.sample(skills_by_department[dept], min(5, len(skills_by_department[dept]))),
        "notes": "Looks promising" if random.random() > 0.5 else "Needs further evaluation",
        "salary_expectation": random.randint(50, 120) * 1000,
        "created_at": applied_date,
        "updated_at": applied_date,
        "applied_date": applied_date
    })

# Generate sample interviews
sample_interviews = []

for i in range(20):
    # Only create interviews for candidates that exist and jobs that exist
    candidate_id = random.choice(candidate_ids)
    candidate = next((c for c in sample_candidates if c["id"].startswith(candidate_id)), None)
    
    if candidate:
        position = candidate["position"]
        job_id = job_id_by_title.get(position)
        
        if job_id:
            # Generate past interview
            interview_date = generate_date()
            sample_interviews.append({
                "id": str(datetime.now().timestamp() + i),
                "candidate_id": candidate_id,
                "job_id": job_id,
                "interviewer_id": sample_users[2]["id"] if random.random() > 0.5 else sample_users[1]["id"],
                "scheduled_date": interview_date,
                "duration_minutes": random.choice([30, 45, 60, 90]),
                "status": random.choice(["completed", "cancelled"]),
                "type": random.choice(["phone", "video", "onsite", "technical", "hr"]),
                "description": f"Interview for {position} position",
                "location": "Video Call" if random.random() > 0.3 else "Office",
                "meeting_link": "https://meet.example.com/interview",
                "created_at": interview_date,
                "updated_at": interview_date,
                "result": random.choice(["passed", "failed", "pending"]) if interview_date < datetime.now() else None,
                "candidate_name": candidate["name"],
                "job_title": position
            })
            
            # Generate future interview
            future_interview_date = generate_future_date()
            sample_interviews.append({
                "id": str(datetime.now().timestamp() + i + 1000),  # Different ID for future interview
                "candidate_id": candidate_id,
                "job_id": job_id,
                "interviewer_id": sample_users[2]["id"] if random.random() > 0.5 else sample_users[1]["id"],
                "scheduled_date": future_interview_date,
                "duration_minutes": random.choice([30, 45, 60, 90]),
                "status": "scheduled",
                "type": random.choice(["phone", "video", "onsite", "technical", "hr"]),
                "description": f"Upcoming interview for {position} position",
                "location": "Video Call" if random.random() > 0.3 else "Office",
                "meeting_link": "https://meet.example.com/interview",
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                "result": None,
                "candidate_name": candidate["name"],
                "job_title": position
            })


def seed_database():
    """Seed the database with sample data"""
    # Clear existing data
    users_collection.delete_many({})
    candidates_collection.delete_many({})
    jobs_collection.delete_many({})
    interviews_collection.delete_many({})
    
    print("Cleared existing data")
    
    # Insert sample data
    users_collection.insert_many(sample_users)
    candidates_collection.insert_many(sample_candidates)
    jobs_collection.insert_many(sample_jobs)
    interviews_collection.insert_many(sample_interviews)
    
    print(f"Inserted {len(sample_users)} users")
    print(f"Inserted {len(sample_candidates)} candidates")
    print(f"Inserted {len(sample_jobs)} jobs")
    print(f"Inserted {len(sample_interviews)} interviews")


if __name__ == "__main__":
    seed_database()
    print("Database seeding completed!") 