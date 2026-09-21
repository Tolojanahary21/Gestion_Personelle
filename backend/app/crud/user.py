from sqlalchemy.orm import Session

from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate


def get_users(db: Session):
    return db.query(User).all()


def get_user(
    db: Session,
    user_id: int
):
    return (
        db.query(User)
        .filter(User.id_user == user_id)
        .first()
    )


def get_user_by_username(
    db: Session,
    username: str
):
    return (
        db.query(User)
        .filter(User.username == username)
        .first()
    )


def create_user(
    db: Session,
    user: UserCreate,
    hashed_password: str
):
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


def update_user(
    db: Session,
    user_id: int,
    user_data: UserUpdate,
    hashed_password: str | None = None
):
    user = get_user(
        db,
        user_id
    )

    if not user:
        return None

    data = user_data.model_dump(
        exclude_unset=True
    )

    if hashed_password is not None:
        user.password = hashed_password

    data.pop("password", None)

    for key, value in data.items():
        setattr(
            user,
            key,
            value
        )

    db.commit()
    db.refresh(user)

    return user


def delete_user(
    db: Session,
    user_id: int
):
    user = get_user(
        db,
        user_id
    )

    if not user:
        return None

    db.delete(user)
    db.commit()

    return user