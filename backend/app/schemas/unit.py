from pydantic import BaseModel, ConfigDict, Field

from ..models.unit import UnitType


class UnitBase(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=200
    )

    code: str = Field(
        ...,
        min_length=1,
        max_length=50
    )

    unit_type: UnitType = UnitType.OTHER

    parent_unit_id: int | None = Field(
        None,
        gt=0
    )

    location: str | None = Field(
        None,
        max_length=255
    )

    commander_personnel_id: int | None = Field(
        None,
        gt=0
    )

    description: str | None = None

    active: bool = True


class UnitCreate(UnitBase):
    pass


class UnitUpdate(BaseModel):
    name: str | None = Field(
        None,
        min_length=1,
        max_length=200
    )

    code: str | None = Field(
        None,
        min_length=1,
        max_length=50
    )

    unit_type: UnitType | None = None

    parent_unit_id: int | None = Field(
        None,
        gt=0
    )

    location: str | None = Field(
        None,
        max_length=255
    )

    commander_personnel_id: int | None = Field(
        None,
        gt=0
    )

    description: str | None = None

    active: bool | None = None


class UnitResponse(UnitBase):
    id_unit: int

    created_at: object
    updated_at: object

    model_config = ConfigDict(
        from_attributes=True
    )