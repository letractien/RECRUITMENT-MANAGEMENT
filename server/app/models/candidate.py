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
    phone: str
    position: str
    department: str
    experience: int
    status: CandidateStatus = CandidateStatus.NEW
    resume_url: Optional[HttpUrl] = None
    skills: List[str] = []
    notes: Optional[str] = None
    salary_expectation: Optional[float] = None


class CandidateCreate(CandidateBase):
    pass


class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    experience: Optional[int] = None
    status: Optional[CandidateStatus] = None
    resume_url: Optional[HttpUrl] = None
    skills: Optional[List[str]] = None
    notes: Optional[str] = None
    salary_expectation: Optional[float] = None


class CandidateInDB(CandidateBase):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    applied_date: datetime = Field(default_factory=datetime.now)


class Candidate(CandidateBase):
    id: str
    created_at: datetime
    updated_at: datetime
    applied_date: datetime


class CandidateSearchParams(BaseModel):
    status: Optional[CandidateStatus] = None
    department: Optional[str] = None
    search: Optional[str] = None 