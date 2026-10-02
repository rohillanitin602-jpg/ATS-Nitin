from fastapi import APIRouter, Depends, HTTPException

from database import recruiters_collection, users_collection
from utils.dependencies import get_current_user, require_role

router = APIRouter(prefix="/recruiters", tags=["Recruiters"])


@router.get("/me")
async def get_my_company(current_user: dict = Depends(require_role("recruiter"))):
    recruiter = await recruiters_collection.find_one({"user_id": current_user["id"]})
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    return {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "company_name": recruiter.get("company_name"),
    }


@router.put("/me")
async def update_my_company(
    company_name: str, current_user: dict = Depends(require_role("recruiter"))
):
    await recruiters_collection.update_one(
        {"user_id": current_user["id"]}, {"$set": {"company_name": company_name}}
    )
    return {"message": "Company profile updated"}
