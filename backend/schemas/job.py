from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=120)
    company: str = Field(..., min_length=1, max_length=120)
    location: str = Field(..., min_length=1, max_length=120)
    experience: str = Field(..., description="e.g. '0-2 years'")
    salary: str = Field(..., description="e.g. '5-8 LPA'")
    job_type: Literal["Full-time", "Part-time", "Internship", "Contract", "Remote"] = "Full-time"
    skills: List[str] = []
    description: str = Field(..., min_length=10)


class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[str] = None
    salary: Optional[str] = None
    job_type: Optional[str] = None
    skills: Optional[List[str]] = None
    description: Optional[str] = None
    status: Optional[Literal["active", "closed"]] = None


class JobOut(BaseModel):
    id: str
    title: str
    company: str
    location: str
    experience: str
    salary: str
    job_type: str
    skills: List[str]
    description: str
    status: str
    recruiter_id: str
    applicants_count: int = 0
    created_at: str
