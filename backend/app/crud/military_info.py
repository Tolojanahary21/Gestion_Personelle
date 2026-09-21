from sqlalchemy.orm import Session

from ..models.military_info import MilitaryInfo
from ..models.personnel import Personnel
from ..schemas.military_info import (
    MilitaryInfoCreate,
    MilitaryInfoUpdate
)


def get_military_infos(db: Session):
    return db.query(MilitaryInfo).all()


def get_military_info(
    db: Session,
    military_info_id: int
):
    return (
        db.query(MilitaryInfo)
        .filter(
            MilitaryInfo.id_military_info == military_info_id
        )
        .first()
    )


def get_military_info_by_personnel(
    db: Session,
    personnel_id: int
):
    return (
        db.query(MilitaryInfo)
        .filter(
            MilitaryInfo.personnel_id == personnel_id
        )
        .first()
    )


def get_military_info_by_matricule(
    db: Session,
    matricule: str
):
    return (
        db.query(MilitaryInfo)
        .filter(
            MilitaryInfo.matricule == matricule
        )
        .first()
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


def create_military_info(
    db: Session,
    military_info: MilitaryInfoCreate
):
    db_military_info = MilitaryInfo(
        **military_info.model_dump()
    )

    db.add(db_military_info)
    db.commit()
    db.refresh(db_military_info)

    return db_military_info


def update_military_info(
    db: Session,
    military_info_id: int,
    military_info: MilitaryInfoUpdate
):
    db_military_info = get_military_info(
        db,
        military_info_id
    )

    if not db_military_info:
        return None

    update_data = military_info.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            db_military_info,
            field,
            value
        )

    db.commit()
    db.refresh(db_military_info)

    return db_military_info


def delete_military_info(
    db: Session,
    military_info_id: int
):
    db_military_info = get_military_info(
        db,
        military_info_id
    )

    if not db_military_info:
        return None

    db.delete(db_military_info)
    db.commit()

    return db_military_info