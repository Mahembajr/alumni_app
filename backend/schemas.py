from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    graduation_year: Optional[int] = None
    program: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

# User
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    current_company: Optional[str] = None
    current_position: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    program: Optional[str] = None
    graduation_year: Optional[int] = None

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    graduation_year: Optional[int]
    program: Optional[str]
    phone: Optional[str]
    bio: Optional[str]
    current_company: Optional[str]
    current_position: Optional[str]
    location: Optional[str]
    linkedin: Optional[str]
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Job
class JobCreate(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    salary: Optional[str] = None
    job_type: Optional[str] = "full-time"
    deadline: Optional[datetime] = None

class JobOut(BaseModel):
    id: int
    title: str
    company: str
    location: Optional[str]
    description: Optional[str]
    requirements: Optional[str]
    salary: Optional[str]
    job_type: Optional[str]
    is_active: bool
    posted_by: Optional[int]
    created_at: datetime
    deadline: Optional[datetime]
    class Config:
        from_attributes = True

# Event
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_date: datetime
    end_date: Optional[datetime] = None
    image_url: Optional[str] = None

class EventOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    location: Optional[str]
    event_date: datetime
    end_date: Optional[datetime]
    image_url: Optional[str]
    is_active: bool
    posted_by: Optional[int]
    created_at: datetime
    rsvp_count: Optional[int] = 0
    class Config:
        from_attributes = True

# Club
class ClubCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None

class ClubOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: Optional[str]
    image_url: Optional[str]
    is_active: bool
    created_by: Optional[int]
    created_at: datetime
    member_count: Optional[int] = 0
    class Config:
        from_attributes = True

# Achievement
class AchievementCreate(BaseModel):
    title: str
    description: Optional[str] = None
    year: Optional[int] = None

class AchievementOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    year: Optional[int]
    created_at: datetime
    class Config:
        from_attributes = True

# Announcement
class AnnouncementCreate(BaseModel):
    title: str
    content: str

class AnnouncementOut(BaseModel):
    id: int
    title: str
    content: str
    posted_by: Optional[int]
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Message
class MessageCreate(BaseModel):
    receiver_id: int
    content: str

class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Certificate
class CertificateRequestCreate(BaseModel):
    request_type: str
    reason: str

class CertificateRequestOut(BaseModel):
    id: int
    user_id: int
    request_type: str
    reason: str
    status: str
    admin_note: Optional[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
