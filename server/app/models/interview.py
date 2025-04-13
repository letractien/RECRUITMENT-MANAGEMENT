from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class InterviewStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"
    PENDING = "pending"


class InterviewType(str, Enum):
    PHONE = "phone"
    VIDEO = "video"
    ONSITE = "onsite"
    TECHNICAL = "technical"
    HR = "hr"


class InterviewBase(BaseModel):
    candidate_id: str  # Foreign key to Candidate model
    job_id: str  # Foreign key to Job model
    interviewer_id: str  # Foreign key to User model
    scheduled_date: datetime
    duration_minutes: int
    status: InterviewStatus = InterviewStatus.SCHEDULED
    type: InterviewType
    description: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    interviewer_id: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: Optional[InterviewStatus] = None
    type: Optional[InterviewType] = None
    description: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None


class InterviewResult(BaseModel):
    interview_id: str
    rating: int
    feedback: str
    strengths: List[str] = []
    weaknesses: List[str] = []
    recommended_next_steps: Optional[str] = None
    hiring_recommendation: bool


class InterviewInDB(InterviewBase):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    result: Optional[InterviewResult] = None


class Interview(InterviewBase):
    id: str
    created_at: datetime
    updated_at: datetime
    result: Optional[InterviewResult] = None 