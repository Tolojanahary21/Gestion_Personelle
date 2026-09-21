from datetime import date, datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator
)


class AssignmentBase(BaseModel):

    assignment_type: str = Field(
        ...,
        min_length=1
    )

    position: str = Field(
        ...,
        min_length=1,
        max_length=200
    )

    location: str | None = Field(
        None,
        max_length=255
    )

    start_date: date

    end_date: date | None = None

    status: str = Field(
        ...,
        min_length=1
    )

    description: str | None = None

    @model_validator(mode="after")
    def validate_dates(self):

        if (
            self.end_date is not None
            and self.end_date < self.start_date
        ):
            raise ValueError(
                "end_date cannot be before start_date"
            )

        return self


class AssignmentCreate(AssignmentBase):

    personnel_id: int = Field(
        ...,
        gt=0
    )


class AssignmentUpdate(BaseModel):

    personnel_id: int | None = Field(
        None,
        gt=0
    )

    assignment_type: str | None = Field(
        None,
        min_length=1
    )

    position: str | None = Field(
        None,
        min_length=1,
        max_length=200
    )

    location: str | None = Field(
        None,
        max_length=255
    )

    start_date: date | None = None

    end_date: date | None = None

    status: str | None = Field(
        None,
        min_length=1
    )

    description: str | None = None

    @model_validator(mode="after")
    def validate_dates(self):

        if (
            self.start_date is not None
            and self.end_date is not None
            and self.end_date < self.start_date
        ):
            raise ValueError(
                "end_date cannot be before start_date"
            )

        return self


class AssignmentResponse(AssignmentBase):

    id_assignment: int

    personnel_id: int

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )