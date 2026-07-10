# Complaint Civic Issue Reporting System

A full-stack web application that enables citizens to report civic issues and allows authorities to manage and resolve them efficiently.

## Why this project

Many cities and municipalities lack an easy, centralized way for citizens to report civic issues (potholes, broken streetlights, waste collection problems). This project provides a user-friendly reporting interface for citizens and a management dashboard for authorities to triage, assign, and resolve issues — improving response times and transparency.


## Features

- Citizen reporting with title, description, category, and photo upload
- Optional geolocation and map view for reports
- Report status tracking (New, In Progress, Resolved, Closed)
- Authority dashboard to view, filter, assign, and update reports
- Commenting and updates on reports
- Email / SMS notification placeholders for updates
- Admin features: user/role management, reporting metrics
- File storage support (local or cloud: S3)


## Tech stack (assumptions)

Primary languages: TypeScript, Python

Common frameworks you might see in this repo (replace as appropriate):
- Frontend: React, Next.js, or plain React + Vite (TypeScript)
- Backend: Node.js + Express/Nest (TypeScript) or Python + FastAPI/Django
- Database: PostgreSQL (recommended) or SQLite for local testing
- Storage: Local filesystem or S3-compatible storage
- Auth: JWT-based authentication

ASSUMPTION notes: I couldn't detect exact frameworks automatically; replace the example commands in "Quickstart" and other framework-specific commands with the ones from your repo.


## Architecture (high-level)

- Frontend: SPA (React/Next) that allows citizens to file reports and view statuses
- Backend: REST API (TypeScript or Python) that handles auth, report CRUD, file uploads, notifications
- Database: Relational DB (Postgres) for persistence
- Storage: Local or S3 for images
- Integrations: Map provider (Google Maps / Mapbox), Email (SMTP), SMS (Twilio)

Example ASCII diagram:

Frontend (React) <---> Backend API (FastAPI / Express) <---> Database (Postgres)
                                      |
                                      +---> Object Storage (S3 / local)
                                      +---> Email/SMS services


## Quickstart (developer)

Prerequisites:
- Node.js 16+ and npm or yarn
- Python 3.8+ (if backend uses Python)
- PostgreSQL (or SQLite for quick local dev)
- Docker & Docker Compose (optional, recommended)

Clone the repo:

```bash
git clone https://github.com/Yugbhensadadiya/Complaint-Civic-Issue-Reporting-System-main.git
cd Complaint-Civic-Issue-Reporting-System-main
```

Install frontend dependencies (if there's a frontend folder):

```bash
cd frontend
npm install
npm run dev
```

Install backend dependencies:

```bash

# backend is Python (Django):
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```


## Running the app

Development (example):

- Frontend: http://localhost:3000 (or port from frontend package.json)
- Backend: http://localhost:8000 (or port from backend env)

Start frontend:

```bash
cd frontend
npm run dev
```

Start backend (Django example):

```bash
cd backend
source .venv/bin/activate

```

Production build (example):

```bash
# Frontend
cd frontend
npm run build
# Serve static files using your preferred static server

# Backend
npm run build && npm start   # Node
# or run with a production ASGI server (uvicorn/gunicorn for Python)
```


## Database migrations & seeding

If using Django:

```bash
python manage.py migrate
python manage.py loaddata initial_data.json  # if you have a fixture
```

If using Prisma or TypeORM for TypeScript, use their migration commands — replace these placeholders with the commands your repo uses.


## API (example)

Authentication: JWT bearer tokens (replace with session-based if applicable).

Example endpoints:

- POST /api/auth/register — register a user
- POST /api/auth/login — login, returns JWT
- GET /api/reports — list reports (query params: status, category)
- POST /api/reports — create a report (form-data for image upload)
- GET /api/reports/:id — get report details
- PATCH /api/reports/:id — update report (status, assign to authority)
- POST /api/reports/:id/comments — add a comment

Sample cURL (create report):

```bash
curl -X POST "http://localhost:8000/api/reports" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "title=Broken streetlight" \
  -F "description=The streetlight near 5th Ave is not working" \
  -F "latitude=12.34567" \
  -F "longitude=76.54321" \
  -F "photo=@/path/to/photo.jpg"
```

Sample response (201 Created):

```json
{
  "id": 123,
  "title": "Broken streetlight",
  "status": "new",
  "created_at": "2026-07-10T12:00:00Z",
  "location": {"lat": 12.34567, "lng": 76.54321}
}
```

## Contributing

- Open an issue describing the bug or feature
- Fork => create a branch feature/your-feature or fix/issue-123 => create a Pull Request
- Follow code style: Prettier + ESLint for JS/TS, black/isort for Python
- Tests should be added for new features and fixed bugs
- Use conventional commits or your project's commit guidelines


## Troubleshooting & Common Issues

- DB connection errors: check DATABASE_URL, ensure DB is running and migrations applied
- File upload errors: check permissions on storage and valid S3 keys
- CORS errors: ensure backend’s CORS config allows the frontend origin


## Project structure (example)

```
/README.md
/frontend/         # React/Next frontend
/backend/          # API server (TypeScript or Python)
/docs/             # Docs and design assets
/scripts/          # helper scripts
/tests/            # unit & integration tests
```

## Authors & Maintainers

- Yugbhensadadiya, Jay Sohaliya — main author


## Acknowledgements

- Thanks to open-source libraries and tools used in this project

---

Short repo description (3–4 lines) for GitHub:

> Complaint Civic Issue Reporting System — a full-stack web application for citizens to report civic issues (potholes, streetlights, waste) with photo uploads, geolocation, and a management dashboard for authorities to triage and resolve reports. Built with TypeScript and Python (replace with exact frameworks used).
