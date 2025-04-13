from enum import Enum
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr

class UserRole(str, Enum):
    ADMIN = "admin"
    HR = "hr"
    INTERVIEWER = "interviewer"
    USER = "user"

class UserBase(BaseModel):
    username: str
    email: EmailStr
    fullname: str
    role: UserRole
    is_active: bool = True
    department: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    fullname: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    department: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None

class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    hashed_password: str

class User(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime 