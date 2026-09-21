from sqlalchemy.orm import Session

from ..models.assignment import Assignment
from ..schemas.assignment import (
    AssignmentCreate,
    AssignmentUpdate
)


def get_assignments(db: Session):

    return (
        db.query(Assignment)
        .order_by(Assignment.start_date.desc())
        .all()
    )


def get_assignment(
    db: Session,
    assignment_id: int
):

    return (
        db.query(Assignment)
        .filter(
            Assignment.id_assignment == assignment_id
        )
        .first()
    )


def get_assignments_by_personnel(
    db: Session,
    personnel_id: int
):

    return (
        db.query(Assignment)
        .filter(
            Assignment.personnel_id == personnel_id
        )
        .order_by(Assignment.start_date.desc())
        .all()
    )


def create_assignment(
    db: Session,
    assignment: AssignmentCreate
):

    db_assignment = Assignment(
        **assignment.model_dump()
    )

    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)

    return db_assignment


def update_assignment(
    db: Session,
    assignment_id: int,
    assignment: AssignmentUpdate
):

    db_assignment = get_assignment(
        db,
        assignment_id
    )

    if not db_assignment:
        return None

    update_data = assignment.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            db_assignment,
            field,
            value
        )

    db.commit()
    db.refresh(db_assignment)

    return db_assignment


def delete_assignment(
    db: Session,
    assignment_id: int
):

    db_assignment = get_assignment(
        db,
        assignment_id
    )

    if not db_assignment:
        return None

    db.delete(db_assignment)
    db.commit()

    return db_assignment