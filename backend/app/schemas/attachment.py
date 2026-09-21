from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator
)


class AttachmentBase(BaseModel):

    file_name: str = Field(
        ...,
        min_length=1,
        max_length=255
    )

    file_path: str = Field(
        ...,
        min_length=1,
        max_length=500
    )

    file_type: str | None = Field(
        None,
        max_length=100
    )

    file_size: int | None = Field(
        None,
        ge=0
    )

    document_type: str = Field(
        ...,
        min_length=1
    )

    description: str | None = None


class AttachmentCreate(AttachmentBase):

    personnel_id: int = Field(
        ...,
        gt=0
    )


class AttachmentUpdate(BaseModel):

    personnel_id: int | None = Field(
        None,
        gt=0
    )

    file_name: str | None = Field(
        None,
        min_length=1,
        max_length=255
    )

    file_path: str | None = Field(
        None,
        min_length=1,
        max_length=500
    )

    file_type: str | None = Field(
        None,
        max_length=100
    )

    file_size: int | None = Field(
        None,
        ge=0
    )

    document_type: str | None = Field(
        None,
        min_length=1
    )

    description: str | None = None


class AttachmentResponse(AttachmentBase):

    id_attachment: int

    personnel_id: int

    uploaded_at: datetime

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )