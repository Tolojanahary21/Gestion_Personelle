from fastapi import FastAPI

from .database import create_tables
from .routers.personnel import router as personnel_router
from .routers.user import router as user_router
from .routers.child import router as child_router
from .routers.military_info import router as military_info_router
from .routers.grade import router as grade_router
from .routers.training import router as training_router
from .routers.language import router as language_router
from .routers.computer_skill import router as computer_skill_router
from .routers.assignment import router as assignment_router
from .routers.decoration import router as decoration_router
from .routers.attachment import router as attachment_router
from .routers.unit import router as unit_router
from .routers.audit_log import router as audit_log_router

app = FastAPI(
    title="Personnel Management API",
    version="1.0.0"
)

create_tables()

app.include_router(personnel_router)
app.include_router(user_router)
app.include_router(child_router)
app.include_router(military_info_router)
app.include_router(grade_router)
app.include_router(training_router)
app.include_router(language_router)
app.include_router(computer_skill_router)
app.include_router(assignment_router)
app.include_router(decoration_router)
app.include_router(attachment_router)
app.include_router(unit_router)
app.include_router(audit_log_router)


@app.get("/")
def root():
    return {
        "message": "Personnel Management API is running"
    }