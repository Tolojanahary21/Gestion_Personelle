from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud.computer_skill import (
    create_computer_skill,
    delete_computer_skill,
    get_computer_skill,
    get_computer_skills,
    get_computer_skills_by_personnel,
    get_computer_skill_by_personnel_and_name,
    update_computer_skill
)

from ..database import get_db

from ..models.computer_skill import (
    ComputerSkillCategory,
    ComputerSkillProficiency
)

from ..models.personnel import Personnel

from ..schemas.computer_skill import (
    ComputerSkillCreate,
    ComputerSkillResponse,
    ComputerSkillUpdate
)


router = APIRouter(
    prefix="/computer-skills",
    tags=["Computer Skills"]
)


def validate_category(category: str):
    try:
        return ComputerSkillCategory(category)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Invalid category. Allowed values: "
                + ", ".join(
                    item.value
                    for item in ComputerSkillCategory
                )
            )
        )


def validate_proficiency(proficiency: str):
    try:
        return ComputerSkillProficiency(proficiency)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Invalid proficiency. Allowed values: "
                + ", ".join(
                    item.value
                    for item in ComputerSkillProficiency
                )
            )
        )


@router.post(
    "/",
    response_model=ComputerSkillResponse,
    status_code=status.HTTP_201_CREATED
)
def create(
    computer_skill: ComputerSkillCreate,
    db: Session = Depends(get_db)
):

    personnel = (
        db.query(Personnel)
        .filter(
            Personnel.id_personnel
            == computer_skill.personnel_id
        )
        .first()
    )

    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    category = validate_category(
        computer_skill.category
    )

    proficiency = validate_proficiency(
        computer_skill.proficiency
    )

    existing_skill = get_computer_skill_by_personnel_and_name(
        db,
        computer_skill.personnel_id,
        computer_skill.skill_name
    )

    if existing_skill:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This computer skill already exists "
                "for this personnel"
            )
        )

    computer_skill_data = computer_skill.model_copy(
        update={
            "category": category,
            "proficiency": proficiency
        }
    )

    return create_computer_skill(
        db,
        computer_skill_data
    )


@router.get(
    "/",
    response_model=list[ComputerSkillResponse]
)
def read_all(
    db: Session = Depends(get_db)
):

    return get_computer_skills(db)


@router.get(
    "/{computer_skill_id}",
    response_model=ComputerSkillResponse
)
def read_one(
    computer_skill_id: int,
    db: Session = Depends(get_db)
):

    computer_skill = get_computer_skill(
        db,
        computer_skill_id
    )

    if not computer_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Computer skill not found"
        )

    return computer_skill


@router.get(
    "/personnel/{personnel_id}",
    response_model=list[ComputerSkillResponse]
)
def read_by_personnel(
    personnel_id: int,
    db: Session = Depends(get_db)
):

    personnel = (
        db.query(Personnel)
        .filter(
            Personnel.id_personnel == personnel_id
        )
        .first()
    )

    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    return get_computer_skills_by_personnel(
        db,
        personnel_id
    )

@router.put(
    "/{computer_skill_id}",
    response_model=ComputerSkillResponse
)
def update(
    computer_skill_id: int,
    computer_skill: ComputerSkillUpdate,
    db: Session = Depends(get_db)
):

    existing_skill = get_computer_skill(
        db,
        computer_skill_id
    )

    if not existing_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Computer skill not found"
        )

    update_data = computer_skill.model_dump(
        exclude_unset=True
    )

    personnel_id = update_data.get(
        "personnel_id",
        existing_skill.personnel_id
    )

    personnel = (
        db.query(Personnel)
        .filter(
            Personnel.id_personnel == personnel_id
        )
        .first()
    )

    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    if "category" in update_data:
        update_data["category"] = validate_category(
            update_data["category"]
        )

    if "proficiency" in update_data:
        update_data["proficiency"] = validate_proficiency(
            update_data["proficiency"]
        )

    skill_name = update_data.get(
        "skill_name",
        existing_skill.skill_name
    )

    duplicate = (
        db.query(type(existing_skill))
        .filter(
            type(existing_skill).personnel_id == personnel_id,
            type(existing_skill).skill_name == skill_name,
            type(existing_skill).id_computer_skill
            != computer_skill_id
        )
        .first()
    )

    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This computer skill already exists "
                "for this personnel"
            )
        )

    for field, value in update_data.items():
        setattr(
            existing_skill,
            field,
            value
        )

    db.commit()
    db.refresh(existing_skill)

    return existing_skill
@router.delete(
    "/{computer_skill_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete(
    computer_skill_id: int,
    db: Session = Depends(get_db)
):

    computer_skill = delete_computer_skill(
        db,
        computer_skill_id
    )

    if not computer_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Computer skill not found"
        )

    return None