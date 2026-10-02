from collections import defaultdict
from datetime import datetime

from fastapi import APIRouter, Depends

from database import jobs_collection, applications_collection
from utils.dependencies import require_role

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/recruiter")
async def recruiter_dashboard(current_user: dict = Depends(require_role("recruiter"))):
    job_cursor = jobs_collection.find({"recruiter_id": current_user["id"]})
    jobs = [job async for job in job_cursor]
    job_ids = [str(j["_id"]) for j in jobs]

    app_cursor = applications_collection.find({"job_id": {"$in": job_ids}})
    applications = [a async for a in app_cursor]

    total_jobs = len(jobs)
    total_applications = len(applications)
    shortlisted = sum(1 for a in applications if a["status"] == "shortlisted")
    interviews = sum(1 for a in applications if a["status"] == "interview")
    selected = sum(1 for a in applications if a["status"] == "selected")
    rejected = sum(1 for a in applications if a["status"] == "rejected")

    by_month: dict = defaultdict(int)
    for a in applications:
        try:
            month_key = a["applied_at"][:7]  # YYYY-MM
        except Exception:
            month_key = "unknown"
        by_month[month_key] += 1
    applications_per_month = [
        {"month": k, "count": v} for k, v in sorted(by_month.items())
    ]

    job_title_map = {str(j["_id"]): j["title"] for j in jobs}
    by_job: dict = defaultdict(int)
    for a in applications:
        by_job[job_title_map.get(a["job_id"], "Unknown")] += 1
    applications_by_job = [{"job": k, "count": v} for k, v in by_job.items()]

    status_distribution = [
        {"status": "applied", "count": sum(1 for a in applications if a["status"] == "applied")},
        {"status": "shortlisted", "count": shortlisted},
        {"status": "interview", "count": interviews},
        {"status": "selected", "count": selected},
        {"status": "rejected", "count": rejected},
        {"status": "withdrawn", "count": sum(1 for a in applications if a["status"] == "withdrawn")},
    ]

    return {
        "kpis": {
            "total_jobs": total_jobs,
            "total_applications": total_applications,
            "shortlisted": shortlisted,
            "interviews": interviews,
            "selected": selected,
            "rejected": rejected,
        },
        "applications_per_month": applications_per_month,
        "applications_by_job": applications_by_job,
        "status_distribution": status_distribution,
    }
