from datetime import date, datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator
)


class DecorationBase(BaseModel):

    name: str = Field(
        ...,
        min_length=1,
        max_length=200
    )

    decoration_type: str = Field(
        ...,
        min_length=1
    )

    award_date: date

    awarding_authority: str | None = Field(
        None,
        max_length=255
    )

    reference_number: str | None = Field(
        None,
        min_length=1,
        max_length=100
    )

    description: str | None = None

    notes: str | None = None

    @model_validator(mode="after")
    def validate_award_date(self):

        if self.award_date > date.today():
            raise ValueError(
                "award_date cannot be in the future"
            )

        return self


class DecorationCreate(DecorationBase):

    personnel_id: int = Field(
        ...,
        gt=0
    )


class DecorationUpdate(BaseModel):

    personnel_id: int | None = Field(
        None,
        gt=0
    )

    name: str | None = Field(
        None,
        min_length=1,
        max_length=200
    )

    decoration_type: str | None = Field(
        None,
        min_length=1
    )

    award_date: date | None = None

    awarding_authority: str | None = Field(
        None,
        max_length=255
    )

    reference_number: str | None = Field(
        None,
        min_length=1,
        max_length=100
    )

    description: str | None = None

    notes: str | None = None

    @model_validator(mode="after")
    def validate_award_date(self):

        if (
            self.award_date is not None
            and self.award_date > date.today()
        ):
            raise ValueError(
                "award_date cannot be in the future"
            )

        return self


class DecorationResponse(DecorationBase):

    id_decoration: int

    personnel_id: int

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )