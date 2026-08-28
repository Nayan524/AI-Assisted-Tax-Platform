import os
from typing import Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="MiraFlores Tax Mock API", version="0.1.0")
allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if origin.strip()]
app.add_middleware(CORSMiddleware, allow_origins=allowed_origins, allow_methods=["*"], allow_headers=["*"])

class Task(BaseModel):
    id: str
    title: str
    description: str
    type: Literal["questionnaire", "document", "review"]
    status: Literal["ready", "waiting", "complete"]
    estimate: str | None = None
    dueLabel: str | None = None

class Workspace(BaseModel):
    clientName: str
    taxYear: int
    returnName: str
    deadline: str
    tasks: list[Task]

class LoginRequest(BaseModel):
    tenant_id: str
    email: str
    password: str
    role: Literal["client", "cpa"]

class SessionUser(BaseModel):
    tenant_id: str
    id: str
    name: str
    email: str
    role: Literal["client", "cpa"]
    firm: str | None = None

workspace = Workspace(clientName="Maya", taxYear=2025, returnName="Maya & Daniel Flores", deadline="October 15, 2026", tasks=[
    Task(id="profile", title="Tell us what changed this year", description="A short guided questionnaire helps us prepare the right forms.", type="questionnaire", status="ready", estimate="About 4 min", dueLabel="Start here"),
    Task(id="w2", title="Upload Daniel’s W-2", description="From Northstar Design Group", type="document", status="ready", estimate="1 document", dueLabel="Needed next"),
    Task(id="interest", title="Upload interest statements", description="Forms 1099-INT from your bank accounts", type="document", status="waiting", dueLabel="After questionnaire"),
    Task(id="engagement", title="Review engagement letter", description="Signed by Maya Flores", type="review", status="complete"),
])

@app.get("/api/health")
def health(): return {"status": "ok", "mode": "mock"}

@app.post("/api/auth/login", response_model=SessionUser)
def login(credentials: LoginRequest):
    accounts = {
        "client": SessionUser(tenant_id="miraflores-tax", id="client-maya", name="Maya Flores", email="maya.flores@example.com", role="client", firm="MiraFlores Tax"),
        "cpa": SessionUser(tenant_id="miraflores-tax", id="cpa-jordan", name="Jordan Lee, CPA", email="jordan.lee@miraflorestax.com", role="cpa", firm="MiraFlores Tax"),
    }
    account = accounts[credentials.role]
    if credentials.tenant_id != account.tenant_id or credentials.email.lower() != account.email or credentials.password != "demo123":
        raise HTTPException(status_code=401, detail="Invalid sample credentials")
    return account

@app.post("/api/auth/logout")
def logout(): return {"signed_out": True}

@app.get("/api/client/workspace", response_model=Workspace)
def get_workspace(): return workspace

@app.post("/api/tasks/{task_id}/complete", response_model=Workspace)
def complete_task(task_id: str):
    task = next((item for item in workspace.tasks if item.id == task_id), None)
    if not task: raise HTTPException(status_code=404, detail="Task not found")
    task.status = "complete"
    if task_id == "profile": next(item for item in workspace.tasks if item.id == "interest").status = "ready"
    return workspace
