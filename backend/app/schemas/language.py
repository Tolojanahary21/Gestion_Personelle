from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from ..models.language import (
    LanguageLevel,
    LanguageProficiency
)


class LanguageBase(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    proficiency: LanguageProficiency = (
        LanguageProficiency.INTERMEDIATE
    )

    level: LanguageLevel | None = None

    certification: str | None = Field(
        None,
        max_length=255
    )

    certification_date: date | None = None

    notes: str | None = None


class LanguageCreate(LanguageBase):
    personnel_id: int

    @model_validator(mode="after")
    def validate_certification(self):
        if (
            self.certification_date
            and not self.certification
        ):
            raise ValueError(
                "Certification is required when certification date is provided"
            )

        return self


class LanguageUpdate(BaseModel):
    name: str | None = Field(
        None,
        min_length=1,
        max_length=100
    )

    proficiency: LanguageProficiency | None = None

    level: LanguageLevel | None = None

    certification: str | None = Field(
        None,
        max_length=255
    )

    certification_date: date | None = None

    notes: str | None = None

    @model_validator(mode="after")
    def validate_certification(self):
        if (
            self.certification_date
            and not self.certification
        ):
            raise ValueError(
                "Certification is required when certification date is provided"
            )

        return self


class LanguageResponse(LanguageBase):
    id_language: int
    personnel_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )