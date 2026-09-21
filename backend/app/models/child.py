import enum

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String
)
from sqlalchemy.sql import func

from ..database import Base


class ChildGender(str, enum.Enum):
    MALE = "Male"
    FEMALE = "Female"


class Child(Base):
    __tablename__ = "childrens"

    id_child = Column(
        Integer,
        primary_key=True,
        index=True
    )

    personnel_id = Column(
        Integer,
        ForeignKey( "personnel.id_personnel",ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    last_name = Column(String(100),  nullable=False
    )

    first_names = Column(
        String(150),
        nullable=False
    )

    birth_date = Column(
        Date,
        nullable=True
    )

    birth_place = Column(
        String(255),
        nullable=True
    )

    gender = Column(
        Enum(ChildGender),
        nullable=True
    )

    school = Column(
        String(255),
        nullable=True
    )

    occupation = Column(
        String(200),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )