from enum import Enum
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class UserRole(str, Enum):
    ADMIN = "admin"
    HR = "hr"
    INTERVIEWER = "interviewer"
    USER = "user"

class User(BaseModel):
    id: str
    username: str
    email: str
    fullname: str
    role: UserRole
    is_active: bool = True
    created_at: datetime
    updated_at: datetime 