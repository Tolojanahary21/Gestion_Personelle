from sqlalchemy.orm import Session

from ..models.decoration import Decoration
from ..schemas.decoration import (
    DecorationCreate,
    DecorationUpdate
)


def get_decorations(db: Session):

    return (
        db.query(Decoration)
        .order_by(Decoration.award_date.desc())
        .all()
    )


def get_decoration(
    db: Session,
    decoration_id: int
):

    return (
        db.query(Decoration)
        .filter(
            Decoration.id_decoration == decoration_id
        )
        .first()
    )


def get_decorations_by_personnel(
    db: Session,
    personnel_id: int
):

    return (
        db.query(Decoration)
        .filter(
            Decoration.personnel_id == personnel_id
        )
        .order_by(Decoration.award_date.desc())
        .all()
    )


def get_decoration_by_reference(
    db: Session,
    reference_number: str
):

    return (
        db.query(Decoration)
        .filter(
            Decoration.reference_number
            == reference_number
        )
        .first()
    )


def create_decoration(
    db: Session,
    decoration: DecorationCreate
):

    db_decoration = Decoration(
        **decoration.model_dump()
    )

    db.add(db_decoration)
    db.commit()
    db.refresh(db_decoration)

    return db_decoration


def update_decoration(
    db: Session,
    decoration_id: int,
    decoration: DecorationUpdate
):

    db_decoration = get_decoration(
        db,
        decoration_id
    )

    if not db_decoration:
        return None

    update_data = decoration.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            db_decoration,
            field,
            value
        )

    db.commit()
    db.refresh(db_decoration)

    return db_decoration


def delete_decoration(
    db: Session,
    decoration_id: int
):

    db_decoration = get_decoration(
        db,
        decoration_id
    )

    if not db_decoration:
        return None

    db.delete(db_decoration)
    db.commit()

    return db_decoration