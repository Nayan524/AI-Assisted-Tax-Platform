# AI-Assisted Tax Platform

## Purpose

The AI-Assisted Tax Platform is a shared workspace for taxpayers and tax professionals to complete a tax return without relying on disconnected email threads, spreadsheets, document folders, and manual follow-up lists. It keeps documents, extracted tax values, review work, return progress, and client questions connected to the same return.

The platform helps:

- **Individual taxpayers and business owners** understand what they need to do next, upload documents securely, respond to document-specific questions, and follow the progress of their return without needing tax-process expertise.
- **CPAs and tax preparers** prioritize their assigned returns, review AI-extracted values against original source documents, correct or verify those values, and communicate with clients in context.
- **Reviewers and firm staff** understand ownership, blockers, outstanding requests, and the source evidence behind tax data while working within one consistent product.

The project exists to reduce the most common sources of delay and error in tax preparation: unclear next steps, fragmented communication, missing documents, manual data entry, lost context, and AI output that cannot be easily explained or corrected. AI assists with extraction, confidence signals, warnings, and suggested corrections, but professional verification remains with the CPA. The prototype emphasizes transparency, traceability, role-appropriate access, and keeping users oriented as they move between related documents, cases, tasks, and return data.

Challenge 03, **Where to Start**, gives a first-time tax client one clear next action, a short setup checklist, progress and deadline context, and a transition into the normal workspace.

Challenge 08, **Clickable vs. Editable**, adds a shared interaction language across document and return-data screens. It distinguishes editable, AI-extracted, verified, approval-required, and locked values, with working edit, approval, source-navigation, and explanation interactions.

Challenge 05, **Role-Aware Experiences**, adds mocked sign-in, isolated client and CPA sessions, role-specific dashboards and navigation, guarded routes, and sign-out. Authentication is intentionally simulated; a production implementation must enforce authorization server-side.

Challenge 06, **Return Status & Progress**, adds a shared five-stage return lifecycle. Clients receive plain-language progress and action ownership, while CPAs see assigned owners, internal blockers, operational detail, and a direct path to resolve review work.

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
