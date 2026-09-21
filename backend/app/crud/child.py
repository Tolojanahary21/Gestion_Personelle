from sqlalchemy.orm import Session

from ..models.child import Child
from ..models.personnel import Personnel
from ..schemas.child import ChildCreate, ChildUpdate


def get_children(db: Session):
    return db.query(Child).all()


def get_child(
    db: Session,
    child_id: int
):
    return (
        db.query(Child)
        .filter(Child.id_child == child_id)
        .first()
    )


def get_children_by_personnel(
    db: Session,
    personnel_id: int
):
    return (
        db.query(Child)
        .filter(Child.personnel_id == personnel_id)
        .all()
    )


def get_personnel(
    db: Session,
    personnel_id: int
):
    return (
        db.query(Personnel)
        .filter(
            Personnel.id_personnel == personnel_id
        )
        .first()
    )


def create_child(
    db: Session,
    child: ChildCreate
):
    personnel = get_personnel(
        db,
        child.personnel_id
    )

    if not personnel:
        return None

    db_child = Child(
        **child.model_dump()
    )

    db.add(db_child)

    personnel.children_count = (
        personnel.children_count + 1
    )

    db.commit()
    db.refresh(db_child)

    return db_child


def update_child(
    db: Session,
    child_id: int,
    child: ChildUpdate
):
    db_child = get_child(
        db,
        child_id
    )

    if not db_child:
        return None

    update_data = child.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            db_child,
            field,
            value
        )

    db.commit()
    db.refresh(db_child)

    return db_child


def delete_child(
    db: Session,
    child_id: int
):
    db_child = get_child(
        db,
        child_id
    )

    if not db_child:
        return None

    personnel = get_personnel(
        db,
        db_child.personnel_id
    )

    if personnel and personnel.children_count > 0:
        personnel.children_count -= 1

    db.delete(db_child)
    db.commit()

    return db_child