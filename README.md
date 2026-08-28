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

## Technology stack

### Frontend

- **React** and **TypeScript** for the component-based user interface and typed application logic.
- **Vite** for local development, bundling, and production builds.
- **Custom CSS** for the responsive black, white, and grey design system.
- **Lucide React** for interface icons.
- **PDF.js (`pdfjs-dist`)** for rendering tax documents inside the application.
- **Vitest**, **React Testing Library**, and **jsdom** for frontend test support.

### Backend and deployment

- **Python** and **FastAPI** for the lightweight API and intended backend contract.
- **Pydantic** for API request and response models.
- **Uvicorn** as the ASGI application server.
- **Render** for hosting the Vite static frontend and FastAPI web service.

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

## Wired vs. Simulated

This project is an interactive product prototype, not a production tax-preparation or filing system.

### Wired Up

- Separate client and CPA sign-in experiences with role-specific navigation, screens, route guards, sign-out, and an active-client context that follows a CPA across workflows.
- Client onboarding and progress steps, including prerequisite locking, clear next actions, deadline context, and navigation back to the home screen.
- Client document selection and upload interactions, an uploaded-files library, file removal behavior, and viewing or downloading the included sample PDFs.
- An in-application PDF viewer powered by PDF.js, including source-document navigation and highlighted evidence for selected extracted values.
- A library of synthetic W-2, 1099, K-1, mortgage, health-insurance, brokerage, property-tax, charitable, and estimated-tax documents for demonstrating higher-volume workflows.
- CPA review interactions for opening source documents, tracing extracted values to their evidence, editing values, verifying values, and highlighting lower-confidence fields that need professional attention.
- A CPA dashboard with client search, status and priority filters, mock-data prioritization logic, and direct navigation from a client summary into action.
- Client-specific return-status, review, and messaging experiences after a CPA selects an assigned client.
- Document-linked cases with client-visible messages, CPA-only internal notes, attention indicators, replies, resolution controls, and navigation between a case and its related document or review screen.
- A client help chatbot with working local interactions for common platform-navigation questions.
- Connected navigation among cases, documents, return data, review details, and return status without losing the selected client or workflow context.
- Responsive black, white, and grey interface behavior and browser state needed to demonstrate the workflows end to end.

### Simulated

- Users, credentials, tax firms, tenant membership, CPA-to-client assignments, permissions, client records, return records, cases, deadlines, statuses, priorities, notifications, and tasks use seeded data or browser state.
- Authentication is a demonstration flow only. Credentials are not validated by a production identity provider, and permissions are not enforced by a database-backed authorization system.
- Uploaded files and changes made during review are not sent to durable encrypted storage or persisted in a production database.
- The bundled tax PDFs, names, identifiers, and financial amounts are synthetic samples and must not be used for filing.
- AI extraction, confidence scores, explanations, recommendations, warnings, and suggested corrections use plausible mocked responses. No OCR or external AI service currently processes newly uploaded files.
- Messages, internal notes, attention indicators, notifications, and chatbot responses are local demonstrations rather than real-time communications with email or push delivery.
- Tax calculations, preparation of a final return, e-signatures, payments, electronic filing, and IRS or state integrations are not implemented.
- The FastAPI service exposes a lightweight mock contract and health endpoint, but most frontend workflows currently use an in-browser data adapter. There is no production database, background job processor, persistent audit service, or production document-processing pipeline.

## Design Decisions

- **One product with role-aware experiences:** Clients and CPAs use the same visual system and product shell, while navigation and permitted actions adapt to the signed-in role. This avoids creating disconnected products while keeping professional-only controls away from clients.
- **Client context follows the CPA:** A CPA selects an assigned client from the dashboard, and that active-client context carries into review, return status, and messages. This reduces the risk of reviewing or discussing the wrong taxpayer's information.
- **Action-oriented dashboard:** The CPA landing page emphasizes clients who need attention, with search, status filters, priority filters, and direct paths into work. It is designed around “what should I work on now?” rather than passive reporting.
- **Cases instead of a generic inbox:** Communication is organized around a document or tax issue. Both parties can understand what a conversation concerns, while internal firm notes remain separate from client-visible messages.
- **Clear division of responsibility:** Clients upload documents and respond to requests, but only CPAs edit, review, and verify AI-extracted tax values. The interface does not imply that client confirmation replaces professional review.
- **AI that can be checked and corrected:** AI output includes confidence, supporting evidence, uncertainty, and correction controls. Lower-confidence fields are visually surfaced for CPA attention, and source traceability connects a value to the original document.
- **Context-preserving navigation:** Related cases, documents, extracted values, and return-status screens link to one another while retaining the selected client and workflow context. Back-to-home navigation and prerequisite states help users stay oriented.
- **Progressive disclosure:** Client screens emphasize plain-language next steps, while CPA screens expose professional review detail. Additional evidence and controls appear when needed instead of overwhelming every screen.
- **Restrained visual system:** A black, white, and grey palette, consistent status treatments, compact document rows, and reusable interaction patterns keep dense tax workflows readable without relying on decorative color.
- **Safe prototype data:** Mock records and synthetic PDFs make document volume, prioritization, AI transparency, and collaboration flows reviewable without production credentials, real taxpayer information, or third-party services.

## Render Deployment

The repository includes a `render.yaml` Blueprint that creates both services:

- `miraflores-tax-platform`: Vite frontend hosted as a Render Static Site.
- `miraflores-tax-api`: FastAPI backend hosted as a Render Web Service.

Push the desired branch to GitHub, then in Render select **New > Blueprint**, connect this repository, choose the branch, and deploy the detected Blueprint. The frontend currently uses mocked browser data; the API is deployed as the intended mock contract and exposes its health check at `/api/health`.
