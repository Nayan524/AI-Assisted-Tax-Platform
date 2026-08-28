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

## What is genuinely wired up vs. simulated

This project is an interactive product prototype, not a production tax-preparation or filing system.

### Genuinely wired up

- Role-specific client and CPA navigation, screens, route guards, sign-in, sign-out, and an active-client context for CPA workflows.
- Client document selection and upload interactions, an uploaded-files library, document removal behavior, and in-app viewing of the included sample PDFs.
- CPA review interactions for opening source documents, tracing extracted values to their evidence, editing or verifying values, and highlighting fields that need attention because of lower AI confidence.
- Document-linked cases with client-visible messages, CPA-only internal notes, attention indicators, responses, resolution controls, and navigation between a case and its related document or review screen.
- Client progress steps, prerequisite locking, return-status navigation, dashboard search and filtering, and priority-based sorting against the mock dataset.
- Responsive interface behavior and local session state needed to demonstrate the workflows end to end.

### Simulated behind the scenes

- Users, firms, tenant membership, CPA-to-client assignments, permissions, return records, cases, notifications, deadlines, statuses, priorities, and AI results are seeded or stored in browser state.
- Authentication is a demonstration flow only. Credentials are not validated by a production identity provider, and permissions are not enforced by a database-backed authorization layer.
- Uploaded files are available for the current browser session; they are not sent to durable or encrypted object storage.
- The bundled W-2, 1099, K-1, mortgage, health-insurance, brokerage, property-tax, charitable, and estimated-tax PDFs are synthetic samples and must not be used for filing.
- AI extraction, confidence scores, explanations, recommendations, and corrections use plausible mocked responses. No document OCR or external AI service currently processes uploaded files.
- The FastAPI service exposes a lightweight mock contract and health endpoint, but the frontend primarily uses its in-browser data adapter. There is no production database, background processing, audit service, email delivery, e-signature, tax calculation engine, e-filing integration, or payment processing.

### Decisions worth explaining

- The prototype keeps clients and CPAs in one cohesive product shell while changing navigation and available actions by role. CPA work is scoped to the client selected from the dashboard.
- Communication is organized around document-linked cases instead of a generic inbox so both parties can see what the question concerns and where action is needed.
- Clients upload documents and respond to cases; CPAs remain responsible for reviewing and verifying extracted tax values.
- AI assistance is presented with evidence, confidence, uncertainty, and correction controls. It supports professional judgment rather than silently replacing it.
- Mock data was chosen deliberately so the assignment's interaction and information-design challenges can be reviewed without requiring production credentials, sensitive taxpayer data, or third-party services.

## Deploy on Render

The repository includes a `render.yaml` Blueprint that creates both services:

- `miraflores-tax-platform`: Vite frontend hosted as a Render Static Site.
- `miraflores-tax-api`: FastAPI backend hosted as a Render Web Service.

Push the desired branch to GitHub, then in Render select **New > Blueprint**, connect this repository, choose the branch, and deploy the detected Blueprint. The frontend currently uses mocked browser data; the API is deployed as the intended mock contract and exposes its health check at `/api/health`.
