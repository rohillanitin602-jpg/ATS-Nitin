# Hirely — Job Portal & Applicant Tracking System (ATS)

A full-stack job portal and applicant tracking system built with **FastAPI + MongoDB** on the
backend and **React + Vite + Tailwind CSS** on the frontend, featuring a glassmorphic /
neumorphic dark UI.

## Features

- JWT authentication with two roles: **candidate** and **recruiter**
- Candidate: profile management, PDF resume upload, job search & filters, apply to jobs,
  track application status, withdraw applications
- Recruiter: post/edit/close/delete jobs, view & filter applicants, change application status
  (applied → shortlisted → interview → selected / rejected), download candidate resumes
- Recruiter analytics dashboard: KPI cards + applications-per-month line chart,
  applications-by-job bar chart, and status-distribution pie chart (Recharts)
- Role-based route protection on both the API (FastAPI dependencies) and the frontend
  (protected routes)

## Tech stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 18, Vite, React Router, Tailwind CSS, Recharts, Axios |
| Backend   | Python, FastAPI, Pydantic v2, python-jose (JWT), Passlib (bcrypt) |
| Database  | MongoDB (via Motor async driver) |
| Files     | Resume PDFs stored on disk, served via FastAPI |

## Project structure

```
jobportal/
├── backend/
│   ├── main.py                # FastAPI app entrypoint
│   ├── config.py              # Settings (reads .env)
│   ├── database.py            # Motor/MongoDB client + collections
│   ├── schemas/                # Pydantic request/response models
│   ├── routes/                 # auth, jobs, candidates, recruiters, applications, dashboard
│   ├── utils/                  # security (JWT/bcrypt) + auth dependencies
│   ├── uploads/                 # uploaded resume PDFs (created automatically)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js          # Axios instance with auth header interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/           # Navbar, JobCard, StatCard, ProtectedRoute
    │   ├── pages/                # Home, Login, Register, Jobs, JobDetails,
    │   │                         # CandidateDashboard, CandidateProfile, Applications,
    │   │                         # RecruiterDashboard, ManageJobs, PostJob, Applicants
    │   ├── index.css             # Tailwind + glassmorphism/neumorphism design system
    │   └── App.jsx / main.jsx
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── .env.example
```

## 1. Backend setup

### Prerequisites
- Python 3.10+
- A running MongoDB instance (local `mongod`, Docker, or MongoDB Atlas)

### Steps

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Edit .env and set MONGO_URI (e.g. mongodb://localhost:27017) and a real JWT_SECRET_KEY

uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`.

### Don't have MongoDB installed?

The quickest way is Docker:

```bash
docker run -d --name jobportal-mongo -p 27017:27017 mongo:7
```

Then keep `MONGO_URI=mongodb://localhost:27017` in `.env`.

## 2. Frontend setup

### Prerequisites
- Node.js 18+

### Steps

```bash
cd frontend
npm install

cp .env.example .env
# VITE_API_URL should point at your running backend, e.g. http://localhost:8000

npm run dev
```

The app will be live at `http://localhost:5173`.

To build a production bundle:

```bash
npm run build
npm run preview
```

## 3. Using the app

1. Go to `http://localhost:5173/register`.
2. Create a **recruiter** account (enter a company name), then post a few jobs from
   the recruiter dashboard.
3. Open an incognito window (or log out) and create a **candidate** account.
4. Fill in the candidate profile, upload a PDF resume, then browse jobs and apply.
5. Log back in as the recruiter to see applicants roll in on the dashboard, change
   their status, and download resumes.

## API overview

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/auth/register` | Register as candidate or recruiter |
| POST | `/auth/login` | Log in (OAuth2 password form), returns JWT |
| GET  | `/auth/me` | Current user info |
| GET  | `/jobs` | List/search/filter jobs (`search`, `location`, `skill`, `job_type`, `status`) |
| POST | `/jobs` | Create a job (recruiter only) |
| GET/PUT/DELETE | `/jobs/{id}` | Job detail / update / delete (owner recruiter only) |
| GET/PUT | `/candidates/me` | Candidate profile |
| POST | `/candidates/me/resume` | Upload resume PDF |
| GET | `/candidates/{id}/resume` | Download a resume (recruiter or the candidate) |
| POST | `/applications` | Apply to a job (candidate only) |
| GET | `/applications/mine` | Candidate's own applications |
| GET | `/applications/job/{job_id}` | Applicants for one job (owning recruiter) |
| GET | `/applications/recruiter/all` | All applicants across a recruiter's jobs |
| PUT | `/applications/{id}/status` | Update application status (recruiter) |
| PUT | `/applications/{id}/withdraw` | Withdraw an application (candidate) |
| GET | `/dashboard/recruiter` | KPI + chart data for the recruiter dashboard |

## Notes & next steps

- Resumes are stored on local disk under `backend/uploads/`; swap in S3/GCS for production.
- Add email notifications, an admin panel, and pagination as the dataset grows — the
  original project spec calls these out as "nice to have later" and the codebase is
  structured (routes/services split) to make that straightforward to bolt on.
- Set a strong, random `JWT_SECRET_KEY` before deploying anywhere public.
