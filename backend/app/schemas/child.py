from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from ..models.child import ChildGender


class ChildBase(BaseModel):
    last_name: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    first_names: str = Field(
        ...,
        min_length=1,
        max_length=150
    )

    birth_date: date | None = None

    birth_place: str | None = Field(
        None,
        max_length=255
    )

    gender: ChildGender | None = None

    school: str | None = Field(
        None,
        max_length=255
    )

    occupation: str | None = Field(
        None,
        max_length=200
    )


class ChildCreate(ChildBase):
    personnel_id: int


class ChildUpdate(BaseModel):
    last_name: str | None = Field(
        None,
        min_length=1,
        max_length=100
    )

    first_names: str | None = Field(
        None,
        min_length=1,
        max_length=150
    )

    birth_date: date | None = None

    birth_place: str | None = Field(
        None,
        max_length=255
    )

    gender: ChildGender | None = None

    school: str | None = Field(
        None,
        max_length=255
    )

    occupation: str | None = Field(
        None,
        max_length=200
    )


class ChildResponse(ChildBase):
    id_child: int
    personnel_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )