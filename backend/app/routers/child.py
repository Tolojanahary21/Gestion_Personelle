from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud.child import (
    create_child,
    delete_child,
    get_child,
    get_children,
    get_children_by_personnel,
    get_personnel,
    update_child,
)
from ..database import get_db
from ..schemas.child import (
    ChildCreate,
    ChildResponse,
    ChildUpdate,
)


router = APIRouter(
    prefix="/children",
    tags=["Children"]
)


# CREATE
@router.post(
    "/",
    response_model=ChildResponse,
    status_code=status.HTTP_201_CREATED
)
def create_child_endpoint(
    child: ChildCreate,
    db: Session = Depends(get_db)
):
    personnel = get_personnel(
        db,
        child.personnel_id
    )

    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    return create_child(
        db,
        child
    )


# READ ALL
@router.get(
    "/",
    response_model=list[ChildResponse]
)
def get_children_endpoint(
    db: Session = Depends(get_db)
):
    return get_children(db)


# READ CHILDREN BY PERSONNEL
@router.get(
    "/personnel/{personnel_id}",
    response_model=list[ChildResponse]
)
def get_children_by_personnel_endpoint(
    personnel_id: int,
    db: Session = Depends(get_db)
):
    personnel = get_personnel(
        db,
        personnel_id
    )

    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    return get_children_by_personnel(
        db,
        personnel_id
    )


# READ ONE
@router.get(
    "/{child_id}",
    response_model=ChildResponse
)
def get_child_endpoint(
    child_id: int,
    db: Session = Depends(get_db)
):
    child = get_child(
        db,
        child_id
    )

    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )

    return child


# UPDATE
@router.put(
    "/{child_id}",
    response_model=ChildResponse
)
def update_child_endpoint(
    child_id: int,
    child: ChildUpdate,
    db: Session = Depends(get_db)
):
    existing_child = get_child(
        db,
        child_id
    )

    if not existing_child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )

    return update_child(
        db,
        child_id,
        child
    )


# DELETE
@router.delete(
    "/{child_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_child_endpoint(
    child_id: int,
    db: Session = Depends(get_db)
):
    existing_child = get_child(
        db,
        child_id
    )

    if not existing_child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )

    delete_child(
        db,
        child_id
    )

    return None