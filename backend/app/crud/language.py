from sqlalchemy.orm import Session

from ..models.language import Language
from ..models.personnel import Personnel
from ..schemas.language import (
    LanguageCreate,
    LanguageUpdate
)


def get_languages(db: Session):
    return db.query(Language).order_by(
        Language.name
    ).all()


def get_language(
    db: Session,
    language_id: int
):
    return db.query(Language).filter(
        Language.id_language == language_id
    ).first()


def get_languages_by_personnel(
    db: Session,
    personnel_id: int
):
    return db.query(Language).filter(
        Language.personnel_id == personnel_id
    ).order_by(
        Language.name
    ).all()


def get_language_by_personnel_and_name(
    db: Session,
    personnel_id: int,
    name: str
):
    return db.query(Language).filter(
        Language.personnel_id == personnel_id,
        Language.name == name
    ).first()


def get_personnel(
    db: Session,
    personnel_id: int
):
    return db.query(Personnel).filter(
        Personnel.id_personnel == personnel_id
    ).first()


def create_language(
    db: Session,
    language: LanguageCreate
):
    db_language = Language(
        **language.model_dump()
    )

    db.add(db_language)
    db.commit()
    db.refresh(db_language)

    return db_language


def update_language(
    db: Session,
    language_id: int,
    language: LanguageUpdate
):
    db_language = get_language(
        db,
        language_id
    )

    if not db_language:
        return None

    update_data = language.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            db_language,
            field,
            value
        )

    db.commit()
    db.refresh(db_language)

    return db_language


def delete_language(
    db: Session,
    language_id: int
):
    db_language = get_language(
        db,
        language_id
    )

    if not db_language:
        return None

    db.delete(db_language)
    db.commit()

    return db_language