from sqlalchemy.orm import Session

from ..models.grade import Grade
from ..schemas.grade import GradeCreate, GradeUpdate


def get_grades(db: Session):
    return db.query(Grade).order_by(Grade.level).all()


def get_grade(db: Session, grade_id: int):
    return db.query(Grade).filter(
        Grade.id_grade == grade_id
    ).first()


def get_grade_by_name(db: Session, name: str):
    return db.query(Grade).filter(
        Grade.name == name
    ).first()


def get_grade_by_code(db: Session, code: str):
    return db.query(Grade).filter(
        Grade.code == code
    ).first()


def create_grade(db: Session, grade: GradeCreate):
    db_grade = Grade(
        **grade.model_dump()
    )

    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)

    return db_grade


def update_grade(
    db: Session,
    grade_id: int,
    grade: GradeUpdate
):
    db_grade = get_grade(db, grade_id)

    if not db_grade:
        return None

    update_data = grade.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(db_grade, field, value)

    db.commit()
    db.refresh(db_grade)

    return db_grade


def delete_grade(db: Session, grade_id: int):
    db_grade = get_grade(db, grade_id)

    if not db_grade:
        return None

    db.delete(db_grade)
    db.commit()

    return db_grade