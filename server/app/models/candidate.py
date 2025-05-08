from pydantic import BaseModel, EmailStr, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CandidateStatus(str, Enum):
    NEW = "new"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFER = "offer"
    HIRED = "hired"
    REJECTED = "rejected"


class CandidateBase(BaseModel):
    name: str
    email: EmailStr
    status: CandidateStatus = CandidateStatus.NEW

    job_id: str  # Foreign key to Job model
    department: Optional[str] = "Not specified"
    phone: Optional[str] = "Not provided"

    position: Optional[str] = None
    linkedin_url: Optional[str] = None
    address: Optional[str] = None
    career_goal: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[int] = 0
    
    skills: Optional[List[str]] = None
    notes: Optional[str] = None
    salary_expectation: Optional[float] = None
    source: Optional[str] = None  # How did they find the job posting
    current_company: Optional[str] = None
    current_position: Optional[str] = None
    notice_period: Optional[int] = None  # In days
    resume_url: Optional[str] = None
    resume_download_url: Optional[str] = None
    resume_drive_url: Optional[str] = None

    # Scoring fields
    total_score: Optional[float] = 0
    background_score: Optional[float] = 0
    project_score: Optional[float] = 0
    skill_score: Optional[float] = 0
    certificate_score: Optional[float] = 0


class CandidateCreate(CandidateBase):
    pass


class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    job_id: Optional[str] = None
    department: Optional[str] = None
    experience: Optional[int] = None
    status: Optional[CandidateStatus] = None
    resume_url: Optional[str] = None
    skills: Optional[List[str]] = None
    notes: Optional[str] = None
    salary_expectation: Optional[float] = None
    source: Optional[str] = None
    current_company: Optional[str] = None
    current_position: Optional[str] = None
    notice_period: Optional[int] = None

    # Scoring fields
    total_score: Optional[float] = None
    background_score: Optional[float] = None
    project_score: Optional[float] = None
    skill_score: Optional[float] = None
    certificate_score: Optional[float] = None


class CandidateInDB(CandidateBase):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    applied_date: datetime = Field(default_factory=datetime.now)
    assigned_recruiter: Optional[str] = None  # Foreign key to User model


class Candidate(CandidateBase):
    id: str
    created_at: datetime
    updated_at: datetime
    applied_date: datetime
    assigned_recruiter: Optional[str] = None


class CandidateSearchParams(BaseModel):
    status: Optional[CandidateStatus] = None
    department: Optional[str] = None
    job_id: Optional[str] = None
    search: Optional[str] = None 