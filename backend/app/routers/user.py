from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt

from ..database import get_db
from ..models.user import User
from ..models.personnel import Personnel
from ..schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse
)


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# CREATE
@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    # Check username
    existing_user = db.query(User).filter(
        User.username == user.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    # Check personnel
    if user.personnel_id is not None:
        personnel = db.query(Personnel).filter(
            Personnel.id_personnel == user.personnel_id
        ).first()

        if not personnel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Personnel not found"
            )

    # Hash password
    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    new_user = User(
        username=user.username,
        password=hashed_password,
        role=user.role,
        personnel_id=user.personnel_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# READ ALL
@router.get(
    "/",
    response_model=list[UserResponse]
)
def get_users(
    db: Session = Depends(get_db)
):
    return db.query(User).all()


# READ ONE
@router.get(
    "/{user_id}",
    response_model=UserResponse
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id_user == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


# UPDATE
@router.put(
    "/{user_id}",
    response_model=UserResponse
)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id_user == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    data = user_data.model_dump(
        exclude_unset=True
    )

    # Check username uniqueness
    if "username" in data:
        existing_username = db.query(User).filter(
            User.username == data["username"],
            User.id_user != user_id
        ).first()

        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )

    # Check personnel
    if "personnel_id" in data:
        if data["personnel_id"] is not None:
            personnel = db.query(Personnel).filter(
                Personnel.id_personnel == data["personnel_id"]
            ).first()

            if not personnel:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Personnel not found"
                )

    # Hash new password
    if "password" in data:
        data["password"] = bcrypt.hashpw(
            data["password"].encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

    # Apply changes
    for key, value in data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)

    return user


# DELETE
@router.delete(
    "/{user_id}"
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id_user == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }