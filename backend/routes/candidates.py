import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse

from config import settings
from database import candidates_collection, users_collection
from schemas.candidate import CandidateProfileUpdate, CandidateOut
from utils.dependencies import get_current_user, require_role

router = APIRouter(prefix="/candidates", tags=["Candidates"])

ALLOWED_RESUME_EXTENSIONS = {".pdf"}


async def _build_candidate_out(candidate: dict) -> CandidateOut:
    user = await users_collection.find_one({"_id": _oid(candidate["user_id"])})
    return CandidateOut(
        id=candidate["user_id"],
        name=user["name"] if user else "",
        email=user["email"] if user else "",
        phone=candidate.get("phone"),
        headline=candidate.get("headline"),
        skills=candidate.get("skills", []),
        experience_years=candidate.get("experience_years"),
        location=candidate.get("location"),
        bio=candidate.get("bio"),
        resume_filename=candidate.get("resume_filename"),
    )


def _oid(id_str: str):
    from bson import ObjectId
    return ObjectId(id_str)


@router.get("/me", response_model=CandidateOut)
async def get_my_profile(current_user: dict = Depends(require_role("candidate"))):
    candidate = await candidates_collection.find_one({"user_id": current_user["id"]})
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    return await _build_candidate_out(candidate)


@router.put("/me", response_model=CandidateOut)
async def update_my_profile(
    payload: CandidateProfileUpdate,
    current_user: dict = Depends(require_role("candidate")),
):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update_data:
        await candidates_collection.update_one(
            {"user_id": current_user["id"]}, {"$set": update_data}
        )
    candidate = await candidates_collection.find_one({"user_id": current_user["id"]})
    return await _build_candidate_out(candidate)


@router.post("/me/resume", response_model=CandidateOut)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role("candidate")),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_RESUME_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF resumes are accepted")

    os.makedirs(settings.upload_dir, exist_ok=True)
    stored_name = f"{current_user['id']}_{uuid.uuid4().hex}{ext}"
    stored_path = os.path.join(settings.upload_dir, stored_name)

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Resume must be under 5MB")

    with open(stored_path, "wb") as f:
        f.write(contents)

    await candidates_collection.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"resume_filename": stored_name, "resume_original_name": file.filename}},
    )
    candidate = await candidates_collection.find_one({"user_id": current_user["id"]})
    return await _build_candidate_out(candidate)


@router.get("/{candidate_id}/resume")
async def download_resume(
    candidate_id: str, current_user: dict = Depends(require_role("recruiter", "candidate"))
):
    candidate = await candidates_collection.find_one({"user_id": candidate_id})
    if not candidate or not candidate.get("resume_filename"):
        raise HTTPException(status_code=404, detail="Resume not found")

    path = os.path.join(settings.upload_dir, candidate["resume_filename"])
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Resume file missing on server")

    download_name = candidate.get("resume_original_name") or "resume.pdf"
    return FileResponse(path, filename=download_name, media_type="application/pdf")
