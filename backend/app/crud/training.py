from sqlalchemy.orm import Session

from ..models.personnel import Personnel
from ..models.training import Training
from ..schemas.training import TrainingCreate, TrainingUpdate


def get_trainings(db: Session):
    return db.query(Training).order_by(
        Training.start_date.desc()
    ).all()


def get_training(db: Session, training_id: int):
    return db.query(Training).filter(
        Training.id_training == training_id
    ).first()


def get_trainings_by_personnel(
    db: Session,
    personnel_id: int
):
    return db.query(Training).filter(
        Training.personnel_id == personnel_id
    ).order_by(
        Training.start_date.desc()
    ).all()


def get_training_by_certificate_number(
    db: Session,
    certificate_number: str
):
    return db.query(Training).filter(
        Training.certificate_number == certificate_number
    ).first()


def get_personnel(
    db: Session,
    personnel_id: int
):
    return db.query(Personnel).filter(
        Personnel.id_personnel == personnel_id
    ).first()


def create_training(
    db: Session,
    training: TrainingCreate
):
    db_training = Training(
        **training.model_dump()
    )

    db.add(db_training)
    db.commit()
    db.refresh(db_training)

    return db_training


def update_training(
    db: Session,
    training_id: int,
    training: TrainingUpdate
):
    db_training = get_training(
        db,
        training_id
    )

    if not db_training:
        return None

    update_data = training.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            db_training,
            field,
            value
        )

    db.commit()
    db.refresh(db_training)

    return db_training


def delete_training(
    db: Session,
    training_id: int
):
    db_training = get_training(
        db,
        training_id
    )

    if not db_training:
        return None

    db.delete(db_training)
    db.commit()

    return db_training