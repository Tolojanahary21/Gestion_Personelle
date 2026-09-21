from sqlalchemy.orm import Session

from ..models.computer_skill import ComputerSkill
from ..schemas.computer_skill import (
    ComputerSkillCreate,
    ComputerSkillUpdate
)


def get_computer_skills(db: Session):
    return (
        db.query(ComputerSkill)
        .order_by(ComputerSkill.id_computer_skill)
        .all()
    )


def get_computer_skill(
    db: Session,
    computer_skill_id: int
):
    return (
        db.query(ComputerSkill)
        .filter(
            ComputerSkill.id_computer_skill == computer_skill_id
        )
        .first()
    )


def get_computer_skills_by_personnel(
    db: Session,
    personnel_id: int
):
    return (
        db.query(ComputerSkill)
        .filter(
            ComputerSkill.personnel_id == personnel_id
        )
        .order_by(ComputerSkill.skill_name)
        .all()
    )


def get_computer_skill_by_personnel_and_name(
    db: Session,
    personnel_id: int,
    skill_name: str
):
    return (
        db.query(ComputerSkill)
        .filter(
            ComputerSkill.personnel_id == personnel_id,
            ComputerSkill.skill_name == skill_name
        )
        .first()
    )


def create_computer_skill(
    db: Session,
    computer_skill: ComputerSkillCreate
):
    db_computer_skill = ComputerSkill(
        **computer_skill.model_dump()
    )

    db.add(db_computer_skill)
    db.commit()
    db.refresh(db_computer_skill)

    return db_computer_skill


def update_computer_skill(
    db: Session,
    computer_skill_id: int,
    computer_skill: ComputerSkillUpdate
):
    db_computer_skill = get_computer_skill(
        db,
        computer_skill_id
    )

    if not db_computer_skill:
        return None

    update_data = computer_skill.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            db_computer_skill,
            field,
            value
        )

    db.commit()
    db.refresh(db_computer_skill)

    return db_computer_skill


def delete_computer_skill(
    db: Session,
    computer_skill_id: int
):
    db_computer_skill = get_computer_skill(
        db,
        computer_skill_id
    )

    if not db_computer_skill:
        return None

    db.delete(db_computer_skill)
    db.commit()

    return db_computer_skill