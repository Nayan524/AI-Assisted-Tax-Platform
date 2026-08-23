# AI-Assisted Tax Platform

Challenge 03, **Where to Start**, gives a first-time tax client one clear next action, a short setup checklist, progress and deadline context, and a transition into the normal workspace.

## Run locally

```powershell
cd frontend
npm install
npm run dev
```

In another terminal, the mock API can be started with:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Real vs simulated

The onboarding interactions, progress updates, responsive layout, completed and blocked states, and post-onboarding experience are wired in the frontend. Client records, task completion, uploads, authentication, notifications, and tax preparation activity are simulated. The FastAPI routes define the intended mock contract; the frontend currently uses an in-browser adapter with the same data shape so the prototype can be reviewed without starting the backend.
