from datetime import date, datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator
)


class ComputerSkillBase(BaseModel):

    skill_name: str = Field(
        ...,
        min_length=1,
        max_length=150
    )

    category: str = Field(
        ...,
        min_length=1
    )

    proficiency: str = Field(
        ...,
        min_length=1
    )

    years_experience: int = Field(
        default=0,
        ge=0
    )

    certification: str | None = Field(
        None,
        max_length=255
    )

    certification_date: date | None = None

    notes: str | None = None

    @model_validator(mode="after")
    def validate_certification(self):

        if self.certification_date is not None:
            if self.certification is None or not self.certification.strip():
                raise ValueError(
                    "Certification is required when certification_date is provided"
                )

        if self.certification_date is not None:
            if self.certification_date > date.today():
                raise ValueError(
                    "Certification date cannot be in the future"
                )

        return self


class ComputerSkillCreate(ComputerSkillBase):

    personnel_id: int = Field(
        ...,
        gt=0
    )


class ComputerSkillUpdate(BaseModel):

    personnel_id: int | None = Field(
        None,
        gt=0
    )

    skill_name: str | None = Field(
        None,
        min_length=1,
        max_length=150
    )

    category: str | None = Field(
        None,
        min_length=1
    )

    proficiency: str | None = Field(
        None,
        min_length=1
    )

    years_experience: int | None = Field(
        None,
        ge=0
    )

    certification: str | None = Field(
        None,
        max_length=255
    )

    certification_date: date | None = None

    notes: str | None = None

    @model_validator(mode="after")
    def validate_certification(self):

        if self.certification_date is not None:
            if self.certification is None or not self.certification.strip():
                raise ValueError(
                    "Certification is required when certification_date is provided"
                )

            if self.certification_date > date.today():
                raise ValueError(
                    "Certification date cannot be in the future"
                )

        return self


class ComputerSkillResponse(ComputerSkillBase):

    id_computer_skill: int

    personnel_id: int

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )