from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class PersonnelBase(BaseModel):
    grade_id: int | None = Field(None,gt=0)
    last_name: str = Field(..., min_length=1, max_length=100)
    first_names: str = Field(..., min_length=1, max_length=150)

    photo: str | None = Field(None, max_length=500)

    birth_date: date | None = None
    birth_place: str | None = Field(None, max_length=255)

    prefecture: str | None = Field(None, max_length=100)
    sub_prefecture: str | None = Field(None, max_length=100)
    province: str | None = Field(None, max_length=100)

    cin_number: str | None = Field(None, max_length=50)
    cin_date: date | None = None
    cin_place: str | None = Field(None, max_length=255)
    cin_duplicate: bool | None = None

    passport_number: str | None = Field(None, max_length=50)
    passport_date: date | None = None

    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=30)

    current_address: str | None = Field(None, max_length=500)
    emergency_address: str | None = Field(None, max_length=500)
    emergency_contact: str | None = Field(None, max_length=255)

    religion: str | None = Field(None, max_length=100)
    blood_type: str | None = Field(None, max_length=10)
    height: int | None = Field(None, gt=0)
    sport: str | None = Field(None, max_length=150)

    father_name: str | None = Field(None, max_length=200)
    mother_name: str | None = Field(None, max_length=200)

    marital_status: str | None = Field(None, max_length=50)
    marriage_authorization: bool | None = None

    spouse_name: str | None = Field(None, max_length=200)
    spouse_birth_date: date | None = None
    spouse_birth_place: str | None = Field(None, max_length=255)
    spouse_occupation: str | None = Field(None, max_length=200)

    children_count: int = Field(default=0, ge=0)


class PersonnelCreate(PersonnelBase):
    pass


class PersonnelUpdate(BaseModel):
    grade_id: int | None = Field(None,gt=0)
    last_name: str | None = Field(None, min_length=1, max_length=100)
    first_names: str | None = Field(None, min_length=1, max_length=150)

    photo: str | None = Field(None, max_length=500)

    birth_date: date | None = None
    birth_place: str | None = Field(None, max_length=255)

    prefecture: str | None = Field(None, max_length=100)
    sub_prefecture: str | None = Field(None, max_length=100)
    province: str | None = Field(None, max_length=100)

    cin_number: str | None = Field(None, max_length=50)
    cin_date: date | None = None
    cin_place: str | None = Field(None, max_length=255)
    cin_duplicate: bool | None = None

    passport_number: str | None = Field(None, max_length=50)
    passport_date: date | None = None

    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=30)

    current_address: str | None = Field(None, max_length=500)
    emergency_address: str | None = Field(None, max_length=500)
    emergency_contact: str | None = Field(None, max_length=255)

    religion: str | None = Field(None, max_length=100)
    blood_type: str | None = Field(None, max_length=10)
    height: int | None = Field(None, gt=0)
    sport: str | None = Field(None, max_length=150)

    father_name: str | None = Field(None, max_length=200)
    mother_name: str | None = Field(None, max_length=200)

    marital_status: str | None = Field(None, max_length=50)
    marriage_authorization: bool | None = None

    spouse_name: str | None = Field(None, max_length=200)
    spouse_birth_date: date | None = None
    spouse_birth_place: str | None = Field(None, max_length=255)
    spouse_occupation: str | None = Field(None, max_length=200)

    children_count: int | None = Field(None, ge=0)


class PersonnelResponse(PersonnelBase):
    id_personnel: int

    model_config = ConfigDict(from_attributes=True)