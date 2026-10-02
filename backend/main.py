import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routes import auth, jobs, candidates, recruiters, applications, dashboard

app = FastAPI(
    title="Job Portal & Applicant Tracking System API",
    description="Backend API for a full-stack job portal and ATS built with FastAPI + MongoDB.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.upload_dir, exist_ok=True)

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(recruiters.router)
app.include_router(applications.router)
app.include_router(dashboard.router)


@app.get("/")
async def root():
    return {
        "message": "Job Portal & ATS API is running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
