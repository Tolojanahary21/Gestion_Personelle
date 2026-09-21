from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class GradeBase(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    code: str = Field(
        ...,
        min_length=1,
        max_length=50
    )

    description: str | None = Field(
        None,
        max_length=255
    )

    level: int = Field(
        ...,
        ge=1
    )


class GradeCreate(GradeBase):
    pass


class GradeUpdate(BaseModel):
    name: str | None = Field(
        None,
        min_length=1,
        max_length=100
    )

    code: str | None = Field(
        None,
        min_length=1,
        max_length=50
    )

    description: str | None = Field(
        None,
        max_length=255
    )

    level: int | None = Field(
        None,
        ge=1
    )


class GradeResponse(GradeBase):
    id_grade: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )