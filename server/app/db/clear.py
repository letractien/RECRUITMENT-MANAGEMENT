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


async def seed_database():
    # Clear existing data
    users_collection.delete_many({})
    jobs_collection.delete_many({})
    candidates_collection.delete_many({})
    interviews_collection.delete_many({})

if __name__ == "__main__":
    print("Seeding database...")
    asyncio.run(seed_database())
    print("Database seeding completed.") 