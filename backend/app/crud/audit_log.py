from sqlalchemy.orm import Session

from ..models.audit_log import AuditLog


def get_audit_log(
    db: Session,
    audit_log_id: int
):
    return (
        db.query(AuditLog)
        .filter(
            AuditLog.id_audit_log == audit_log_id
        )
        .first()
    )


def get_audit_logs(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return (
        db.query(AuditLog)
        .order_by(
            AuditLog.created_at.desc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_audit_logs_by_user(
    db: Session,
    user_id: int
):
    return (
        db.query(AuditLog)
        .filter(
            AuditLog.user_id == user_id
        )
        .order_by(
            AuditLog.created_at.desc()
        )
        .all()
    )


def get_audit_logs_by_entity(
    db: Session,
    entity: str,
    entity_id: int | None = None
):
    query = (
        db.query(AuditLog)
        .filter(
            AuditLog.entity == entity
        )
    )

    if entity_id is not None:
        query = query.filter(
            AuditLog.entity_id == entity_id
        )

    return (
        query
        .order_by(
            AuditLog.created_at.desc()
        )
        .all()
    )


def create_audit_log(
    db: Session,
    audit_data: dict
):
    audit_log = AuditLog(
        **audit_data
    )

    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    return audit_log