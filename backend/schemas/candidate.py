from typing import List, Optional
from pydantic import BaseModel


class CandidateProfileUpdate(BaseModel):
    phone: Optional[str] = None
    headline: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[float] = None
    location: Optional[str] = None
    bio: Optional[str] = None


class CandidateOut(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    headline: Optional[str] = None
    skills: List[str] = []
    experience_years: Optional[float] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    resume_filename: Optional[str] = None
