from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud.decoration import (
    create_decoration,
    delete_decoration,
    get_decoration,
    get_decoration_by_reference,
    get_decorations,
    get_decorations_by_personnel,
    update_decoration
)

from ..database import get_db
from datetime import date
from ..models.decoration import DecorationType
from ..models.personnel import Personnel

from ..schemas.decoration import (
    DecorationCreate,
    DecorationResponse,
    DecorationUpdate
)


router = APIRouter(
    prefix="/decorations",
    tags=["Decorations"]
)


def validate_decoration_type(
    decoration_type: str
):

    try:
        return DecorationType(decoration_type)

    except ValueError:

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Invalid decoration_type. Allowed values: "
                + ", ".join(
                    item.value
                    for item in DecorationType
                )
            )
        )


@router.post(
    "/",
    response_model=DecorationResponse,
    status_code=status.HTTP_201_CREATED
)
def create(
    decoration: DecorationCreate,
    db: Session = Depends(get_db)
):

    personnel = (
        db.query(Personnel)
        .filter(
            Personnel.id_personnel
            == decoration.personnel_id
        )
        .first()
    )

    if not personnel:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    decoration_type = validate_decoration_type(
        decoration.decoration_type
    )

    if decoration.reference_number:

        existing_reference = (
            get_decoration_by_reference(
                db,
                decoration.reference_number
            )
        )

        if existing_reference:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reference number already exists"
            )

    decoration_data = decoration.model_copy(
        update={
            "decoration_type": decoration_type
        }
    )

    return create_decoration(
        db,
        decoration_data
    )


@router.get(
    "/",
    response_model=list[DecorationResponse]
)
def read_all(
    db: Session = Depends(get_db)
):

    return get_decorations(db)


@router.get(
    "/{decoration_id}",
    response_model=DecorationResponse
)
def read_one(
    decoration_id: int,
    db: Session = Depends(get_db)
):

    decoration = get_decoration(
        db,
        decoration_id
    )

    if not decoration:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Decoration not found"
        )

    return decoration


@router.get(
    "/personnel/{personnel_id}",
    response_model=list[DecorationResponse]
)
def read_by_personnel(
    personnel_id: int,
    db: Session = Depends(get_db)
):

    personnel = (
        db.query(Personnel)
        .filter(
            Personnel.id_personnel == personnel_id
        )
        .first()
    )

    if not personnel:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    return get_decorations_by_personnel(
        db,
        personnel_id
    )


@router.put(
    "/{decoration_id}",
    response_model=DecorationResponse
)
def update(
    decoration_id: int,
    decoration: DecorationUpdate,
    db: Session = Depends(get_db)
):

    existing_decoration = get_decoration(
        db,
        decoration_id
    )

    if not existing_decoration:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Decoration not found"
        )

    update_data = decoration.model_dump(
        exclude_unset=True
    )

    personnel_id = update_data.get(
        "personnel_id",
        existing_decoration.personnel_id
    )

    personnel = (
        db.query(Personnel)
        .filter(
            Personnel.id_personnel == personnel_id
        )
        .first()
    )

    if not personnel:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    if "decoration_type" in update_data:

        update_data["decoration_type"] = (
            validate_decoration_type(
                update_data["decoration_type"]
            )
        )

    if "award_date" in update_data:

        if update_data["award_date"] > date.today():

            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="award_date cannot be in the future"
            )

    if "reference_number" in update_data:

        reference_number = update_data["reference_number"]

        if reference_number:

            existing_reference = (
                get_decoration_by_reference(
                    db,
                    reference_number
                )
            )

            if (
                existing_reference
                and existing_reference.id_decoration
                != decoration_id
            ):

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Reference number already exists"
                )

    for field, value in update_data.items():

        setattr(
            existing_decoration,
            field,
            value
        )

    db.commit()
    db.refresh(existing_decoration)

    return existing_decoration


@router.delete(
    "/{decoration_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete(
    decoration_id: int,
    db: Session = Depends(get_db)
):

    decoration = delete_decoration(
        db,
        decoration_id
    )

    if not decoration:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Decoration not found"
        )

    return None