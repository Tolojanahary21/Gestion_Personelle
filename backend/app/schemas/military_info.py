from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from ..models.military_info import ServiceStatus


class MilitaryInfoBase(BaseModel):
    matricule: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    recruitment_date: date | None = None

    recruitment_place: str | None = Field(
        None,
        max_length=255
    )

    service_start_date: date | None = None

    service_status: ServiceStatus = ServiceStatus.ACTIVE

    military_service_type: str | None = Field(
        None,
        max_length=150
    )

    specialty: str | None = Field(
        None,
        max_length=200
    )

    unit: str | None = Field(
        None,
        max_length=200
    )


class MilitaryInfoCreate(MilitaryInfoBase):
    personnel_id: int


class MilitaryInfoUpdate(BaseModel):
    matricule: str | None = Field(
        None,
        min_length=1,
        max_length=100
    )

    recruitment_date: date | None = None

    recruitment_place: str | None = Field(
        None,
        max_length=255
    )

    service_start_date: date | None = None

    service_status: ServiceStatus | None = None

    military_service_type: str | None = Field(
        None,
        max_length=150
    )

    specialty: str | None = Field(
        None,
        max_length=200
    )

    unit: str | None = Field(
        None,
        max_length=200
    )


class MilitaryInfoResponse(MilitaryInfoBase):
    id_military_info: int
    personnel_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )