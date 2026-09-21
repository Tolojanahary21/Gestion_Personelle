from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud.military_info import (
    create_military_info,
    delete_military_info,
    get_military_info,
    get_military_info_by_matricule,
    get_military_info_by_personnel,
    get_military_infos,
    get_personnel,
    update_military_info,
)
from ..database import get_db
from ..schemas.military_info import (
    MilitaryInfoCreate,
    MilitaryInfoResponse,
    MilitaryInfoUpdate,
)


router = APIRouter(
    prefix="/military-info",
    tags=["Military Information"]
)


# CREATE
@router.post(
    "/",
    response_model=MilitaryInfoResponse,
    status_code=status.HTTP_201_CREATED
)
def create_military_info_endpoint(
    military_info: MilitaryInfoCreate,
    db: Session = Depends(get_db)
):
    # Check personnel
    personnel = get_personnel(
        db,
        military_info.personnel_id
    )

    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    # Check one military record per personnel
    existing_personnel_info = get_military_info_by_personnel(
        db,
        military_info.personnel_id
    )

    if existing_personnel_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Military information already exists for this personnel"
        )

    # Check matricule
    existing_matricule = get_military_info_by_matricule(
        db,
        military_info.matricule
    )

    if existing_matricule:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Matricule already exists"
        )

    # Validate dates
    if (
        military_info.recruitment_date
        and military_info.service_start_date
        and military_info.service_start_date
        < military_info.recruitment_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service start date cannot be before recruitment date"
        )

    return create_military_info(
        db,
        military_info
    )


# READ ALL
@router.get(
    "/",
    response_model=list[MilitaryInfoResponse]
)
def get_military_infos_endpoint(
    db: Session = Depends(get_db)
):
    return get_military_infos(db)


# READ ONE
@router.get(
    "/{military_info_id}",
    response_model=MilitaryInfoResponse
)
def get_military_info_endpoint(
    military_info_id: int,
    db: Session = Depends(get_db)
):
    military_info = get_military_info(
        db,
        military_info_id
    )

    if not military_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Military information not found"
        )

    return military_info


# READ BY PERSONNEL
@router.get(
    "/personnel/{personnel_id}",
    response_model=MilitaryInfoResponse
)
def get_military_info_by_personnel_endpoint(
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

    military_info = get_military_info_by_personnel(
        db,
        personnel_id
    )

    if not military_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Military information not found"
        )

    return military_info


# UPDATE
@router.put(
    "/{military_info_id}",
    response_model=MilitaryInfoResponse
)
def update_military_info_endpoint(
    military_info_id: int,
    military_info: MilitaryInfoUpdate,
    db: Session = Depends(get_db)
):
    existing_info = get_military_info(
        db,
        military_info_id
    )

    if not existing_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Military information not found"
        )

    # Check matricule uniqueness
    if military_info.matricule:
        existing_matricule = get_military_info_by_matricule(
            db,
            military_info.matricule
        )

        if (
            existing_matricule
            and existing_matricule.id_military_info
            != military_info_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Matricule already exists"
            )

    # Validate dates
    recruitment_date = (
        military_info.recruitment_date
        if military_info.recruitment_date is not None
        else existing_info.recruitment_date
    )

    service_start_date = (
        military_info.service_start_date
        if military_info.service_start_date is not None
        else existing_info.service_start_date
    )

    if (
        recruitment_date
        and service_start_date
        and service_start_date < recruitment_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service start date cannot be before recruitment date"
        )

    return update_military_info(
        db,
        military_info_id,
        military_info
    )


# DELETE
@router.delete(
    "/{military_info_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_military_info_endpoint(
    military_info_id: int,
    db: Session = Depends(get_db)
):
    existing_info = get_military_info(
        db,
        military_info_id
    )

    if not existing_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Military information not found"
        )

    delete_military_info(
        db,
        military_info_id
    )

    return None