from sqlalchemy.orm import Session

from ..models.unit import Unit


def get_unit(
    db: Session,
    unit_id: int
):
    return (
        db.query(Unit)
        .filter(Unit.id_unit == unit_id)
        .first()
    )


def get_units(
    db: Session
):
    return (
        db.query(Unit)
        .order_by(Unit.name.asc())
        .all()
    )


def get_unit_by_name(
    db: Session,
    name: str
):
    return (
        db.query(Unit)
        .filter(Unit.name == name)
        .first()
    )


def get_unit_by_code(
    db: Session,
    code: str
):
    return (
        db.query(Unit)
        .filter(Unit.code == code)
        .first()
    )


def get_units_by_parent(
    db: Session,
    parent_unit_id: int
):
    return (
        db.query(Unit)
        .filter(
            Unit.parent_unit_id == parent_unit_id
        )
        .order_by(Unit.name.asc())
        .all()
    )


def create_unit(
    db: Session,
    unit_data: dict
):
    unit = Unit(**unit_data)

    db.add(unit)
    db.commit()
    db.refresh(unit)

    return unit


def update_unit(
    db: Session,
    unit: Unit,
    unit_data: dict
):
    for field, value in unit_data.items():
        setattr(unit, field, value)

    db.commit()
    db.refresh(unit)

    return unit


def delete_unit(
    db: Session,
    unit: Unit
):
    db.delete(unit)
    db.commit()

    return unit