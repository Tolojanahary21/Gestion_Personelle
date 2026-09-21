from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud.training import (
    create_training,
    delete_training,
    get_personnel,
    get_training,
    get_training_by_certificate_number,
    get_trainings,
    get_trainings_by_personnel,
    update_training,
)
from ..database import get_db
from ..schemas.training import (
    TrainingCreate,
    TrainingResponse,
    TrainingUpdate,
)


router = APIRouter(
    prefix="/trainings",
    tags=["Trainings"]
)


@router.post(
    "/",
    response_model=TrainingResponse,
    status_code=status.HTTP_201_CREATED
)
def create_training_endpoint(
    training: TrainingCreate,
    db: Session = Depends(get_db)
):
    # Check personnel
    personnel = get_personnel(
        db,
        training.personnel_id
    )

    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    # Check certificate number uniqueness
    if training.certificate_number:
        existing_certificate = (
            get_training_by_certificate_number(
                db,
                training.certificate_number
            )
        )

        if existing_certificate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Certificate number already exists"
            )

    return create_training(
        db,
        training
    )


@router.get(
    "/",
    response_model=list[TrainingResponse]
)
def get_trainings_endpoint(
    db: Session = Depends(get_db)
):
    return get_trainings(db)


@router.get(
    "/personnel/{personnel_id}",
    response_model=list[TrainingResponse]
)
def get_trainings_by_personnel_endpoint(
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

    return get_trainings_by_personnel(
        db,
        personnel_id
    )


@router.get(
    "/{training_id}",
    response_model=TrainingResponse
)
def get_training_endpoint(
    training_id: int,
    db: Session = Depends(get_db)
):
    training = get_training(
        db,
        training_id
    )

    if not training:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training not found"
        )

    return training


@router.put(
    "/{training_id}",
    response_model=TrainingResponse
)
def update_training_endpoint(
    training_id: int,
    training: TrainingUpdate,
    db: Session = Depends(get_db)
):
    existing_training = get_training(
        db,
        training_id
    )

    if not existing_training:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training not found"
        )

    # Check certificate number uniqueness
    if training.certificate_number:
        existing_certificate = (
            get_training_by_certificate_number(
                db,
                training.certificate_number
            )
        )

        if (
            existing_certificate
            and existing_certificate.id_training != training_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Certificate number already exists"
            )

    # Validate final dates
    start_date = (
        training.start_date
        if training.start_date is not None
        else existing_training.start_date
    )

    end_date = (
        training.end_date
        if training.end_date is not None
        else existing_training.end_date
    )

    if (
        start_date
        and end_date
        and end_date < start_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot be before start date"
        )

    return update_training(
        db,
        training_id,
        training
    )


@router.delete(
    "/{training_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_training_endpoint(
    training_id: int,
    db: Session = Depends(get_db)
):
    existing_training = get_training(
        db,
        training_id
    )

    if not existing_training:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training not found"
        )

    delete_training(
        db,
        training_id
    )

    return None