from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from ..models.training import TrainingType


class TrainingBase(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=200
    )

    training_type: TrainingType = TrainingType.PROFESSIONAL

    institution: str | None = Field(
        None,
        max_length=255
    )

    start_date: date | None = None

    end_date: date | None = None

    certificate: str | None = Field(
        None,
        max_length=255
    )

    certificate_number: str | None = Field(
        None,
        max_length=100
    )

    description: str | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if (
            self.start_date
            and self.end_date
            and self.end_date < self.start_date
        ):
            raise ValueError(
                "End date cannot be before start date"
            )

        return self


class TrainingCreate(TrainingBase):
    personnel_id: int


class TrainingUpdate(BaseModel):
    name: str | None = Field(
        None,
        min_length=1,
        max_length=200
    )

    training_type: TrainingType | None = None

    institution: str | None = Field(
        None,
        max_length=255
    )

    start_date: date | None = None

    end_date: date | None = None

    certificate: str | None = Field(
        None,
        max_length=255
    )

    certificate_number: str | None = Field(
        None,
        max_length=100
    )

    description: str | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if (
            self.start_date
            and self.end_date
            and self.end_date < self.start_date
        ):
            raise ValueError(
                "End date cannot be before start date"
            )

        return self


class TrainingResponse(TrainingBase):
    id_training: int
    personnel_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )