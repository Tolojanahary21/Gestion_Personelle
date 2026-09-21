from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud.unit import (
    create_unit,
    delete_unit,
    get_unit,
    get_unit_by_code,
    get_unit_by_name,
    get_units,
    get_units_by_parent,
    update_unit,
)
from ..database import get_db
from ..models.personnel import Personnel
from ..models.unit import Unit
from ..schemas.unit import (
    UnitCreate,
    UnitResponse,
    UnitUpdate,
)


router = APIRouter(
    prefix="/units",
    tags=["Units"]
)


def check_parent_unit(
    db: Session,
    parent_unit_id: int | None
):
    if parent_unit_id is None:
        return None

    parent = get_unit(
        db,
        parent_unit_id
    )

    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent unit not found"
        )

    return parent


def check_commander(
    db: Session,
    commander_personnel_id: int | None
):
    if commander_personnel_id is None:
        return None

    commander = (
        db.query(Personnel)
        .filter(
            Personnel.id_personnel
            == commander_personnel_id
        )
        .first()
    )

    if not commander:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commander personnel not found"
        )

    return commander


def creates_cycle(
    db: Session,
    unit_id: int,
    parent_unit_id: int
):
    current_id = parent_unit_id
    visited = set()

    while current_id is not None:

        if current_id == unit_id:
            return True

        if current_id in visited:
            return True

        visited.add(current_id)

        current_unit = get_unit(
            db,
            current_id
        )

        if not current_unit:
            return False

        current_id = current_unit.parent_unit_id

    return False


@router.post(
    "",
    response_model=UnitResponse,
    status_code=status.HTTP_201_CREATED
)
def create_unit_endpoint(
    unit_data: UnitCreate,
    db: Session = Depends(get_db)
):
    existing_name = get_unit_by_name(
        db,
        unit_data.name
    )

    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unit name already exists"
        )

    existing_code = get_unit_by_code(
        db,
        unit_data.code
    )

    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unit code already exists"
        )

    check_parent_unit(
        db,
        unit_data.parent_unit_id
    )

    check_commander(
        db,
        unit_data.commander_personnel_id
    )

    return create_unit(
        db,
        unit_data.model_dump()
    )


@router.get(
    "",
    response_model=list[UnitResponse]
)
def get_all_units(
    db: Session = Depends(get_db)
):
    return get_units(db)


@router.get(
    "/parent/{parent_unit_id}",
    response_model=list[UnitResponse]
)
def get_child_units(
    parent_unit_id: int,
    db: Session = Depends(get_db)
):
    parent = get_unit(
        db,
        parent_unit_id
    )

    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent unit not found"
        )

    return get_units_by_parent(
        db,
        parent_unit_id
    )


@router.get(
    "/{unit_id}",
    response_model=UnitResponse
)
def get_one_unit(
    unit_id: int,
    db: Session = Depends(get_db)
):
    unit = get_unit(
        db,
        unit_id
    )

    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )

    return unit


@router.put(
    "/{unit_id}",
    response_model=UnitResponse
)
def update_unit_endpoint(
    unit_id: int,
    unit_data: UnitUpdate,
    db: Session = Depends(get_db)
):
    unit = get_unit(
        db,
        unit_id
    )

    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )

    data = unit_data.model_dump(
        exclude_unset=True
    )

    if "name" in data:
        existing_name = get_unit_by_name(
            db,
            data["name"]
        )

        if (
            existing_name
            and existing_name.id_unit != unit_id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Unit name already exists"
            )

    if "code" in data:
        existing_code = get_unit_by_code(
            db,
            data["code"]
        )

        if (
            existing_code
            and existing_code.id_unit != unit_id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Unit code already exists"
            )

    if "parent_unit_id" in data:

        parent_unit_id = data["parent_unit_id"]

        if parent_unit_id == unit_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A unit cannot be its own parent"
            )

        if parent_unit_id is not None:

            check_parent_unit(
                db,
                parent_unit_id
            )

            if creates_cycle(
                db,
                unit_id,
                parent_unit_id
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This parent unit would create a circular hierarchy"
                )

    if "commander_personnel_id" in data:
        check_commander(
            db,
            data["commander_personnel_id"]
        )

    return update_unit(
        db,
        unit,
        data
    )


@router.delete(
    "/{unit_id}",
    response_model=UnitResponse
)
def delete_unit_endpoint(
    unit_id: int,
    db: Session = Depends(get_db)
):
    unit = get_unit(
        db,
        unit_id
    )

    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )

    return delete_unit(
        db,
        unit
    )