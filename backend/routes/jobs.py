from datetime import datetime
from typing import Optional, List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from database import jobs_collection, applications_collection
from schemas.job import JobCreate, JobUpdate, JobOut
from utils.dependencies import get_current_user, require_role

router = APIRouter(prefix="/jobs", tags=["Jobs"])


async def _job_to_out(job: dict) -> JobOut:
    applicants_count = await applications_collection.count_documents({"job_id": str(job["_id"])})
    return JobOut(
        id=str(job["_id"]),
        title=job["title"],
        company=job["company"],
        location=job["location"],
        experience=job["experience"],
        salary=job["salary"],
        job_type=job.get("job_type", "Full-time"),
        skills=job.get("skills", []),
        description=job["description"],
        status=job.get("status", "active"),
        recruiter_id=job["recruiter_id"],
        applicants_count=applicants_count,
        created_at=job.get("created_at", ""),
    )


@router.get("", response_model=List[JobOut])
async def list_jobs(
    search: Optional[str] = Query(None, description="keyword across title/company/skills"),
    location: Optional[str] = None,
    skill: Optional[str] = None,
    job_type: Optional[str] = None,
    min_experience: Optional[str] = None,
    mine: Optional[bool] = Query(False, description="only recruiter's own jobs (requires auth)"),
    status_filter: Optional[str] = Query("active", alias="status"),
):
    query: dict = {}
    if status_filter and status_filter != "all":
        query["status"] = status_filter
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if job_type:
        query["job_type"] = job_type
    if skill:
        query["skills"] = {"$regex": skill, "$options": "i"}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"company": {"$regex": search, "$options": "i"}},
            {"skills": {"$regex": search, "$options": "i"}},
        ]

    cursor = jobs_collection.find(query).sort("created_at", -1)
    jobs = [await _job_to_out(job) async for job in cursor]
    return jobs


@router.get("/{job_id}", response_model=JobOut)
async def get_job(job_id: str):
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return await _job_to_out(job)


@router.post("", response_model=JobOut, status_code=201)
async def create_job(payload: JobCreate, current_user: dict = Depends(require_role("recruiter"))):
    job_doc = payload.model_dump()
    job_doc.update({
        "status": "active",
        "recruiter_id": current_user["id"],
        "created_at": datetime.utcnow().isoformat(),
    })
    result = await jobs_collection.insert_one(job_doc)
    job = await jobs_collection.find_one({"_id": result.inserted_id})
    return await _job_to_out(job)


@router.put("/{job_id}", response_model=JobOut)
async def update_job(
    job_id: str, payload: JobUpdate, current_user: dict = Depends(require_role("recruiter"))
):
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["recruiter_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only edit your own job postings")

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update_data:
        await jobs_collection.update_one({"_id": ObjectId(job_id)}, {"$set": update_data})
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    return await _job_to_out(job)


@router.delete("/{job_id}", status_code=204)
async def delete_job(job_id: str, current_user: dict = Depends(require_role("recruiter"))):
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["recruiter_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own job postings")
    await jobs_collection.delete_one({"_id": ObjectId(job_id)})
    await applications_collection.delete_many({"job_id": job_id})
