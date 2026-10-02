from typing import Literal, Optional
from pydantic import BaseModel

ApplicationStatus = Literal[
    "applied", "shortlisted", "interview", "rejected", "selected", "withdrawn"
]


class ApplicationCreate(BaseModel):
    job_id: str
    cover_note: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationOut(BaseModel):
    id: str
    job_id: str
    job_title: str
    company: str
    candidate_id: str
    candidate_name: str
    candidate_email: str
    resume_filename: Optional[str] = None
    status: str
    cover_note: Optional[str] = None
    applied_at: str
