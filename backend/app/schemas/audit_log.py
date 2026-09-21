from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field
)

from ..models.audit_log import AuditAction


class AuditLogBase(BaseModel):
    user_id: int | None = Field(
        None,
        gt=0
    )

    action: AuditAction

    entity: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    entity_id: int | None = Field(
        None,
        gt=0
    )

    description: str | None = None

    old_value: str | None = None

    new_value: str | None = None

    ip_address: str | None = Field(
        None,
        max_length=45
    )

    user_agent: str | None = Field(
        None,
        max_length=500
    )


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogResponse(AuditLogBase):
    id_audit_log: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )