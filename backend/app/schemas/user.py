from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    username: str = Field(
        ...,
        min_length=3,
        max_length=100
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=255
    )

    role: str = "Staff"

    personnel_id: int | None = None


class UserUpdate(BaseModel):
    username: str | None = Field(
        None,
        min_length=3,
        max_length=100
    )

    password: str | None = Field(
        None,
        min_length=8,
        max_length=255
    )

    role: str | None = None

    personnel_id: int | None = None


class UserResponse(BaseModel):
    id_user: int
    username: str
    role: str
    personnel_id: int | None
    created_at: datetime
    last_login: datetime | None

    model_config = ConfigDict(
        from_attributes=True
    )