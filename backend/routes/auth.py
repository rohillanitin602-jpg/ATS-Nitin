from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm

from database import users_collection, candidates_collection, recruiters_collection
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserOut
from utils.security import hash_password, verify_password, create_access_token
from utils.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    existing = await users_collection.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    if payload.role == "recruiter" and not payload.company_name:
        raise HTTPException(status_code=400, detail="company_name is required for recruiters")

    user_doc = {
        "name": payload.name,
        "email": payload.email.lower(),
        "password": hash_password(payload.password),
        "role": payload.role,
        "created_at": datetime.utcnow().isoformat(),
    }
    result = await users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)

    if payload.role == "candidate":
        await candidates_collection.insert_one({
            "user_id": user_id,
            "phone": None,
            "headline": None,
            "skills": [],
            "experience_years": None,
            "location": None,
            "bio": None,
            "resume_filename": None,
        })
    else:
        await recruiters_collection.insert_one({
            "user_id": user_id,
            "company_name": payload.company_name,
        })

    token = create_access_token({"sub": user_id, "role": payload.role})
    return TokenResponse(
        access_token=token, role=payload.role, name=payload.name, user_id=user_id
    )


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_collection.find_one({"email": form_data.username.lower()})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return TokenResponse(
        access_token=token,
        role=user["role"],
        name=user["name"],
        user_id=str(user["_id"]),
    )


@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
    )
