from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud.assignment import (
    create_assignment,
    delete_assignment,
    get_assignment,
    get_assignments,
    get_assignments_by_personnel,
    update_assignment
)

from ..database import get_db

from ..models.assignment import (
    AssignmentStatus,
    AssignmentType
)

from ..models.personnel import Personnel

from ..schemas.assignment import (
    AssignmentCreate,
    AssignmentResponse,
    AssignmentUpdate
)


router = APIRouter(
    prefix="/assignments",
    tags=["Assignments"]
)


def validate_assignment_type(
    assignment_type: str
):

    try:
        return AssignmentType(assignment_type)

    except ValueError:

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Invalid assignment_type. Allowed values: "
                + ", ".join(
                    item.value
                    for item in AssignmentType
                )
            )
        )


def validate_assignment_status(
    assignment_status: str
):

    try:
        return AssignmentStatus(assignment_status)

    except ValueError:

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Invalid status. Allowed values: "
                + ", ".join(
                    item.value
                    for item in AssignmentStatus
                )
            )
        )


@router.post(
    "/",
    response_model=AssignmentResponse,
    status_code=status.HTTP_201_CREATED
)
def create(
    assignment: AssignmentCreate,
    db: Session = Depends(get_db)
):

    personnel = (
        db.query(Personnel)
        .filter(
            Personnel.id_personnel
            == assignment.personnel_id
        )
        .first()
    )

    if not personnel:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    assignment_type = validate_assignment_type(
        assignment.assignment_type
    )

    assignment_status = validate_assignment_status(
        assignment.status
    )

    assignment_data = assignment.model_copy(
        update={
            "assignment_type": assignment_type,
            "status": assignment_status
        }
    )

    return create_assignment(
        db,
        assignment_data
    )


@router.get(
    "/",
    response_model=list[AssignmentResponse]
)
def read_all(
    db: Session = Depends(get_db)
):

    return get_assignments(db)


@router.get(
    "/{assignment_id}",
    response_model=AssignmentResponse
)
def read_one(
    assignment_id: int,
    db: Session = Depends(get_db)
):

    assignment = get_assignment(
        db,
        assignment_id
    )

    if not assignment:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    return assignment


@router.get(
    "/personnel/{personnel_id}",
    response_model=list[AssignmentResponse]
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

    return get_assignments_by_personnel(
        db,
        personnel_id
    )


@router.put(
    "/{assignment_id}",
    response_model=AssignmentResponse
)
def update(
    assignment_id: int,
    assignment: AssignmentUpdate,
    db: Session = Depends(get_db)
):

    existing_assignment = get_assignment(
        db,
        assignment_id
    )

    if not existing_assignment:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    update_data = assignment.model_dump(
        exclude_unset=True
    )

    personnel_id = update_data.get(
        "personnel_id",
        existing_assignment.personnel_id
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

    if "assignment_type" in update_data:

        update_data["assignment_type"] = (
            validate_assignment_type(
                update_data["assignment_type"]
            )
        )

    if "status" in update_data:

        update_data["status"] = (
            validate_assignment_status(
                update_data["status"]
            )
        )

    final_start_date = update_data.get(
        "start_date",
        existing_assignment.start_date
    )

    final_end_date = update_data.get(
        "end_date",
        existing_assignment.end_date
    )

    if (
        final_end_date is not None
        and final_end_date < final_start_date
    ):

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="end_date cannot be before start_date"
        )

    for field, value in update_data.items():

        setattr(
            existing_assignment,
            field,
            value
        )

    db.commit()
    db.refresh(existing_assignment)

    return existing_assignment


@router.delete(
    "/{assignment_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete(
    assignment_id: int,
    db: Session = Depends(get_db)
):

    assignment = delete_assignment(
        db,
        assignment_id
    )

    if not assignment:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    return None