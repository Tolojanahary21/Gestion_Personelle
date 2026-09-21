from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud.language import (
    create_language,
    delete_language,
    get_language,
    get_language_by_personnel_and_name,
    get_languages,
    get_languages_by_personnel,
    get_personnel,
    update_language,
)
from ..database import get_db
from ..schemas.language import (
    LanguageCreate,
    LanguageResponse,
    LanguageUpdate,
)


router = APIRouter(
    prefix="/languages",
    tags=["Languages"]
)


@router.post(
    "/",
    response_model=LanguageResponse,
    status_code=status.HTTP_201_CREATED
)
def create_language_endpoint(
    language: LanguageCreate,
    db: Session = Depends(get_db)
):
    # Check personnel
    personnel = get_personnel(
        db,
        language.personnel_id
    )

    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    # Prevent duplicate language for the same personnel
    existing_language = (
        get_language_by_personnel_and_name(
            db,
            language.personnel_id,
            language.name
        )
    )

    if existing_language:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This language already exists for this personnel"
        )

    # Certification date cannot be in the future
    from datetime import date

    if (
        language.certification_date
        and language.certification_date > date.today()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Certification date cannot be in the future"
        )

    return create_language(
        db,
        language
    )


@router.get(
    "/",
    response_model=list[LanguageResponse]
)
def get_languages_endpoint(
    db: Session = Depends(get_db)
):
    return get_languages(db)


@router.get(
    "/personnel/{personnel_id}",
    response_model=list[LanguageResponse]
)
def get_languages_by_personnel_endpoint(
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

    return get_languages_by_personnel(
        db,
        personnel_id
    )


@router.get(
    "/{language_id}",
    response_model=LanguageResponse
)
def get_language_endpoint(
    language_id: int,
    db: Session = Depends(get_db)
):
    language = get_language(
        db,
        language_id
    )

    if not language:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Language not found"
        )

    return language


@router.put(
    "/{language_id}",
    response_model=LanguageResponse
)
def update_language_endpoint(
    language_id: int,
    language: LanguageUpdate,
    db: Session = Depends(get_db)
):
    from datetime import date

    existing_language = get_language(
        db,
        language_id
    )

    if not existing_language:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Language not found"
        )

    # Check duplicate language
    if language.name:
        duplicate_language = (
            get_language_by_personnel_and_name(
                db,
                existing_language.personnel_id,
                language.name
            )
        )

        if (
            duplicate_language
            and duplicate_language.id_language != language_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This language already exists for this personnel"
            )

    # Check certification date
    if (
        language.certification_date
        and language.certification_date > date.today()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Certification date cannot be in the future"
        )

    # Validate final certification data
    certification = (
        language.certification
        if language.certification is not None
        else existing_language.certification
    )

    certification_date = (
        language.certification_date
        if language.certification_date is not None
        else existing_language.certification_date
    )

    if certification_date and not certification:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Certification is required when certification date is provided"
        )

    return update_language(
        db,
        language_id,
        language
    )


@router.delete(
    "/{language_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_language_endpoint(
    language_id: int,
    db: Session = Depends(get_db)
):
    existing_language = get_language(
        db,
        language_id
    )

    if not existing_language:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Language not found"
        )

    delete_language(
        db,
        language_id
    )

    return None