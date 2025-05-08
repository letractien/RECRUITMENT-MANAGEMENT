from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class EvaluationCriterion(BaseModel):
    description: str
    max_score: int

class EvaluationSection(BaseModel):
    importance_ratio: float
    required: str
    criteria: List[EvaluationCriterion]


class JobStatus(str, Enum):
    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"
    PAUSED = "paused"


class EmploymentType(str, Enum):
    FULL_TIME = "full-time"
    PART_TIME = "part-time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"


class JobBase(BaseModel):
    title: str
    description: str
    department: str
    location: str
    requirements: str
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    status: JobStatus = JobStatus.DRAFT
    is_remote: bool = False
    employment_type: EmploymentType
    created_by: str  # Foreign key to User model (HR/Admin who created the job)
    hiring_manager: Optional[str] = None  # Foreign key to User model


    # New sections for evaluation
    background_criteria: Optional[EvaluationSection] = None
    project_criteria: Optional[EvaluationSection] = None
    skill_criteria: Optional[EvaluationSection] = None
    certification_criteria: Optional[EvaluationSection] = None


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    requirements: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    status: Optional[JobStatus] = None
    is_remote: Optional[bool] = None
    employment_type: Optional[EmploymentType] = None
    hiring_manager: Optional[str] = None
    background_criteria: Optional[EvaluationSection] = None
    project_criteria: Optional[EvaluationSection] = None
    skill_criteria: Optional[EvaluationSection] = None
    certification_criteria: Optional[EvaluationSection] = None


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
    employment_type: Optional[EmploymentType] = None
    search: Optional[str] = None 