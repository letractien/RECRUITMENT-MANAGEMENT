import os
import motor.motor_asyncio
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from dotenv import load_dotenv
import pathlib

# Load environment variables from .env.development
env_path = pathlib.Path(__file__).parents[2] / '.env.development'
load_dotenv(dotenv_path=env_path)

# Get MongoDB URI from environment variable
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Async client for FastAPI
async_client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
async_db = async_client[DATABASE_NAME]

# Sync client for initialization and management tasks
sync_client = MongoClient(MONGODB_URI)
sync_db = sync_client[DATABASE_NAME]

# Collections
users_collection = async_db["users"]
candidates_collection = async_db["candidates"]
jobs_collection = async_db["jobs"]
interviews_collection = async_db["interviews"]


# Database initialization function
def init_db():
    try:
        # Check connection
        sync_client.admin.command('ping')
        print("Successfully connected to MongoDB")

        # Create indexes for performance
        # Users collection
        sync_db.users.create_index("username", unique=True)
        sync_db.users.create_index("email", unique=True)

        # Candidates collection
        sync_db.candidates.create_index("email", unique=True)
        sync_db.candidates.create_index("name")
        sync_db.candidates.create_index("status")
        sync_db.candidates.create_index("department")

        # Jobs collection
        sync_db.jobs.create_index("title")
        sync_db.jobs.create_index("status")
        sync_db.jobs.create_index("department")

        # Interviews collection
        sync_db.interviews.create_index("candidate_id")
        sync_db.interviews.create_index("job_id")
        sync_db.interviews.create_index("interviewer_id")
        sync_db.interviews.create_index("scheduled_date")
        sync_db.interviews.create_index("status")

        print("Database initialized successfully")
    except ServerSelectionTimeoutError:
        print("Failed to connect to MongoDB server. Make sure it's running.")
    except Exception as e:
        print(f"Error initializing database: {e}")


# Check if this is run directly (for initialization)
if __name__ == "__main__":
    init_db() 