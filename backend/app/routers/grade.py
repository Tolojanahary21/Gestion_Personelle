from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud.grade import (
    create_grade,
    delete_grade,
    get_grade,
    get_grade_by_code,
    get_grade_by_name,
    get_grades,
    update_grade,
)
from ..database import get_db
from ..schemas.grade import (
    GradeCreate,
    GradeResponse,
    GradeUpdate,
)


router = APIRouter(
    prefix="/grades",
    tags=["Grades"]
)


@router.post(
    "/",
    response_model=GradeResponse,
    status_code=status.HTTP_201_CREATED
)
def create_grade_endpoint(
    grade: GradeCreate,
    db: Session = Depends(get_db)
):
    existing_name = get_grade_by_name(
        db,
        grade.name
    )

    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Grade name already exists"
        )

    existing_code = get_grade_by_code(
        db,
        grade.code
    )

    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Grade code already exists"
        )

    return create_grade(db, grade)


@router.get(
    "/",
    response_model=list[GradeResponse]
)
def get_grades_endpoint(
    db: Session = Depends(get_db)
):
    return get_grades(db)


@router.get(
    "/{grade_id}",
    response_model=GradeResponse
)
def get_grade_endpoint(
    grade_id: int,
    db: Session = Depends(get_db)
):
    grade = get_grade(db, grade_id)

    if not grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )

    return grade


@router.put(
    "/{grade_id}",
    response_model=GradeResponse
)
def update_grade_endpoint(
    grade_id: int,
    grade: GradeUpdate,
    db: Session = Depends(get_db)
):
    existing_grade = get_grade(
        db,
        grade_id
    )

    if not existing_grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )

    if grade.name:
        existing_name = get_grade_by_name(
            db,
            grade.name
        )

        if (
            existing_name
            and existing_name.id_grade != grade_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Grade name already exists"
            )

    if grade.code:
        existing_code = get_grade_by_code(
            db,
            grade.code
        )

        if (
            existing_code
            and existing_code.id_grade != grade_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Grade code already exists"
            )

    return update_grade(
        db,
        grade_id,
        grade
    )


@router.delete(
    "/{grade_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_grade_endpoint(
    grade_id: int,
    db: Session = Depends(get_db)
):
    existing_grade = get_grade(
        db,
        grade_id
    )

    if not existing_grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )

    delete_grade(
        db,
        grade_id
    )

    return None