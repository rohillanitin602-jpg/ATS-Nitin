from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from database import applications_collection, jobs_collection, users_collection, candidates_collection
from schemas.application import ApplicationCreate, ApplicationStatusUpdate, ApplicationOut
from utils.dependencies import get_current_user, require_role

router = APIRouter(prefix="/applications", tags=["Applications"])


async def _app_to_out(app_doc: dict) -> ApplicationOut:
    job = await jobs_collection.find_one({"_id": ObjectId(app_doc["job_id"])})
    candidate_user = await users_collection.find_one({"_id": ObjectId(app_doc["candidate_id"])})
    candidate_profile = await candidates_collection.find_one({"user_id": app_doc["candidate_id"]})
    return ApplicationOut(
        id=str(app_doc["_id"]),
        job_id=app_doc["job_id"],
        job_title=job["title"] if job else "Deleted job",
        company=job["company"] if job else "",
        candidate_id=app_doc["candidate_id"],
        candidate_name=candidate_user["name"] if candidate_user else "",
        candidate_email=candidate_user["email"] if candidate_user else "",
        resume_filename=candidate_profile.get("resume_filename") if candidate_profile else None,
        status=app_doc["status"],
        cover_note=app_doc.get("cover_note"),
        applied_at=app_doc.get("applied_at", ""),
    )


@router.post("", response_model=ApplicationOut, status_code=201)
async def apply_to_job(
    payload: ApplicationCreate, current_user: dict = Depends(require_role("candidate"))
):
    job = await jobs_collection.find_one({"_id": ObjectId(payload.job_id)})
    if not job or job.get("status") != "active":
        raise HTTPException(status_code=404, detail="Job not found or no longer active")

    existing = await applications_collection.find_one(
        {"job_id": payload.job_id, "candidate_id": current_user["id"]}
    )
    if existing:
        raise HTTPException(status_code=400, detail="You already applied to this job")

    app_doc = {
        "job_id": payload.job_id,
        "candidate_id": current_user["id"],
        "status": "applied",
        "cover_note": payload.cover_note,
        "applied_at": datetime.utcnow().isoformat(),
    }
    result = await applications_collection.insert_one(app_doc)
    saved = await applications_collection.find_one({"_id": result.inserted_id})
    return await _app_to_out(saved)


@router.get("/mine", response_model=List[ApplicationOut])
async def my_applications(current_user: dict = Depends(require_role("candidate"))):
    cursor = applications_collection.find({"candidate_id": current_user["id"]}).sort(
        "applied_at", -1
    )
    return [await _app_to_out(a) async for a in cursor]


@router.get("/job/{job_id}", response_model=List[ApplicationOut])
async def applicants_for_job(job_id: str, current_user: dict = Depends(require_role("recruiter"))):
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["recruiter_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only view applicants for your own jobs")

    cursor = applications_collection.find({"job_id": job_id}).sort("applied_at", -1)
    return [await _app_to_out(a) async for a in cursor]


@router.get("/recruiter/all", response_model=List[ApplicationOut])
async def all_applications_for_recruiter(current_user: dict = Depends(require_role("recruiter"))):
    job_cursor = jobs_collection.find({"recruiter_id": current_user["id"]})
    job_ids = [str(j["_id"]) async for j in job_cursor]
    cursor = applications_collection.find({"job_id": {"$in": job_ids}}).sort("applied_at", -1)
    return [await _app_to_out(a) async for a in cursor]


@router.put("/{application_id}/status", response_model=ApplicationOut)
async def update_application_status(
    application_id: str,
    payload: ApplicationStatusUpdate,
    current_user: dict = Depends(require_role("recruiter")),
):
    app_doc = await applications_collection.find_one({"_id": ObjectId(application_id)})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found")
    job = await jobs_collection.find_one({"_id": ObjectId(app_doc["job_id"])})
    if not job or job["recruiter_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You cannot manage this application")

    await applications_collection.update_one(
        {"_id": ObjectId(application_id)}, {"$set": {"status": payload.status}}
    )
    updated = await applications_collection.find_one({"_id": ObjectId(application_id)})
    return await _app_to_out(updated)


@router.put("/{application_id}/withdraw", response_model=ApplicationOut)
async def withdraw_application(
    application_id: str, current_user: dict = Depends(require_role("candidate"))
):
    app_doc = await applications_collection.find_one({"_id": ObjectId(application_id)})
    if not app_doc or app_doc["candidate_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Application not found")

    await applications_collection.update_one(
        {"_id": ObjectId(application_id)}, {"$set": {"status": "withdrawn"}}
    )
    updated = await applications_collection.find_one({"_id": ObjectId(application_id)})
    return await _app_to_out(updated)
