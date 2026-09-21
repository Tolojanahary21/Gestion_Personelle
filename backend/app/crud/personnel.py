from sqlalchemy.orm import Session

from ..models.grade import Grade
from ..models.personnel import Personnel
from ..schemas.personnel import PersonnelCreate, PersonnelUpdate


def get_personnel_list(db: Session):
    return db.query(Personnel).all()


def get_personnel(
    db: Session,
    personnel_id: int
):
    return (
        db.query(Personnel)
        .filter(Personnel.id_personnel == personnel_id)
        .first()
    )


def get_personnel_by_email(
    db: Session,
    email: str
):
    return (
        db.query(Personnel)
        .filter(Personnel.email == email)
        .first()
    )


def get_personnel_by_cin(
    db: Session,
    cin_number: str
):
    return (
        db.query(Personnel)
        .filter(Personnel.cin_number == cin_number)
        .first()
    )


def get_personnel_by_passport(
    db: Session,
    passport_number: str
):
    return (
        db.query(Personnel)
        .filter(
            Personnel.passport_number == passport_number
        )
        .first()
    )


def create_personnel(
    db: Session,
    personnel: PersonnelCreate
):
    db_personnel = Personnel(
        **personnel.model_dump()
    )

    db.add(db_personnel)
    db.commit()
    db.refresh(db_personnel)

    return db_personnel


def update_personnel(
    db: Session,
    personnel_id: int,
    personnel: PersonnelUpdate
):
    db_personnel = get_personnel(
        db,
        personnel_id
    )

    if not db_personnel:
        return None

    update_data = personnel.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            db_personnel,
            field,
            value
        )

    db.commit()
    db.refresh(db_personnel)

    return db_personnel


def delete_personnel(
    db: Session,
    personnel_id: int
):
    db_personnel = get_personnel(
        db,
        personnel_id
    )

    if not db_personnel:
        return None

    db.delete(db_personnel)
    db.commit()

    return db_personnel
def get_grade(db: Session, grade_id: int):
    return db.query(Grade).filter(
        Grade.id_grade == grade_id
    ).first()