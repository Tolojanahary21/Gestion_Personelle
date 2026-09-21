from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status
)
from sqlalchemy.orm import Session

from ..crud.audit_log import (
    create_audit_log,
    get_audit_log,
    get_audit_logs,
    get_audit_logs_by_entity,
    get_audit_logs_by_user,
)
from ..database import get_db
from ..models.user import User
from ..schemas.audit_log import (
    AuditLogCreate,
    AuditLogResponse,
)


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"]
)


@router.post(
    "",
    response_model=AuditLogResponse,
    status_code=status.HTTP_201_CREATED
)
def create_audit_log_endpoint(
    audit_data: AuditLogCreate,
    db: Session = Depends(get_db)
):
    if audit_data.user_id is not None:

        user = (
            db.query(User)
            .filter(
                User.id_user == audit_data.user_id
            )
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

    return create_audit_log(
        db,
        audit_data.model_dump()
    )


@router.get(
    "",
    response_model=list[AuditLogResponse]
)
def get_all_audit_logs(
    skip: int = Query(
        0,
        ge=0
    ),
    limit: int = Query(
        100,
        ge=1,
        le=500
    ),
    db: Session = Depends(get_db)
):
    return get_audit_logs(
        db,
        skip,
        limit
    )


@router.get(
    "/user/{user_id}",
    response_model=list[AuditLogResponse]
)
def get_user_audit_logs(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(
            User.id_user == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return get_audit_logs_by_user(
        db,
        user_id
    )


@router.get(
    "/entity/{entity}",
    response_model=list[AuditLogResponse]
)
def get_entity_audit_logs(
    entity: str,
    entity_id: int | None = None,
    db: Session = Depends(get_db)
):
    return get_audit_logs_by_entity(
        db,
        entity,
        entity_id
    )


@router.get(
    "/{audit_log_id}",
    response_model=AuditLogResponse
)
def get_one_audit_log(
    audit_log_id: int,
    db: Session = Depends(get_db)
):
    audit_log = get_audit_log(
        db,
        audit_log_id
    )

    if not audit_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found"
        )

    return audit_log