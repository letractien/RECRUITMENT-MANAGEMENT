from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class JobStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    DRAFT = "draft"
    PAUSED = "paused"


class JobBase(BaseModel):
    title: str
    description: str
    department: str
    location: str
    requirements: List[str]
    responsibilities: List[str]
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    status: JobStatus = JobStatus.DRAFT
    is_remote: bool = False
    employment_type: str  # full-time, part-time, contract


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    requirements: Optional[List[str]] = None
    responsibilities: Optional[List[str]] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    status: Optional[JobStatus] = None
    is_remote: Optional[bool] = None
    employment_type: Optional[str] = None


class JobInDB(JobBase):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    posted_date: Optional[datetime] = None
    closed_date: Optional[datetime] = None
    applicants: int = 0
    interviews: int = 0


class Job(JobBase):
    id: str
    created_at: datetime
    updated_at: datetime
    posted_date: Optional[datetime]
    closed_date: Optional[datetime]
    applicants: int
    interviews: int


class JobSearchParams(BaseModel):
    status: Optional[JobStatus] = None
    department: Optional[str] = None
    search: Optional[str] = None 