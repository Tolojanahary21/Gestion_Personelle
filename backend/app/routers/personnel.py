from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..crud.personnel import (
    create_personnel,
    delete_personnel,
    get_personnel,
    get_personnel_by_cin,
    get_personnel_by_email,
    get_personnel_by_passport,
    get_personnel_list,
    update_personnel,
    get_grade,
)
from ..database import get_db
from ..schemas.personnel import (
    PersonnelCreate,
    PersonnelResponse,
    PersonnelUpdate,
)


router = APIRouter(
    prefix="/personnel",
    tags=["Personnel"]
)


@router.post(
    "/",
    response_model=PersonnelResponse,
    status_code=status.HTTP_201_CREATED
)
def create_personnel_endpoint(
    personnel: PersonnelCreate,
    db: Session = Depends(get_db)
):
    if personnel.email:
        existing_email = get_personnel_by_email(
            db,
            str(personnel.email)
        )

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )

    if personnel.cin_number:
        existing_cin = get_personnel_by_cin(
            db,
            personnel.cin_number
        )

        if existing_cin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CIN number already exists"
            )

    if personnel.passport_number:
        existing_passport = get_personnel_by_passport(
            db,
            personnel.passport_number
        )

        if existing_passport:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passport number already exists"
            )
    if personnel.grade_id is not None:
        grade = get_grade(
        db,
        personnel.grade_id
    )

    if not grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )

    return create_personnel(
        db,
        personnel
    )


@router.get(
    "/",
    response_model=list[PersonnelResponse]
)
def get_personnel_list_endpoint(
    db: Session = Depends(get_db)
):
    return get_personnel_list(db)


@router.get(
    "/{personnel_id}",
    response_model=PersonnelResponse
)
def get_personnel_endpoint(
    personnel_id: int,
    db: Session = Depends(get_db)
):
    personnel = get_personnel(
        db,
        personnel_id
    )

    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    return personnel


@router.put(
    "/{personnel_id}",
    response_model=PersonnelResponse
)
def update_personnel_endpoint(
    personnel_id: int,
    personnel: PersonnelUpdate,
    db: Session = Depends(get_db)
):
    existing_personnel = get_personnel(
        db,
        personnel_id
    )

    if not existing_personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    if personnel.email:
        email_owner = get_personnel_by_email(
            db,
            str(personnel.email)
        )

        if (
            email_owner
            and email_owner.id_personnel != personnel_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )

    if personnel.cin_number:
        cin_owner = get_personnel_by_cin(
            db,
            personnel.cin_number
        )

        if (
            cin_owner
            and cin_owner.id_personnel != personnel_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CIN number already exists"
            )

    if personnel.passport_number:
        passport_owner = get_personnel_by_passport(
            db,
            personnel.passport_number
        )

        if (
            passport_owner
            and passport_owner.id_personnel != personnel_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passport number already exists"
            )
    if personnel.grade_id is not None:
        grade = get_grade(
        db,
        personnel.grade_id
    )

    if not grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )

    return update_personnel(
        db,
        personnel_id,
        personnel
    )


@router.delete(
    "/{personnel_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_personnel_endpoint(
    personnel_id: int,
    db: Session = Depends(get_db)
):
    existing_personnel = get_personnel(
        db,
        personnel_id
    )

    if not existing_personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    delete_personnel(
        db,
        personnel_id
    )

    return None