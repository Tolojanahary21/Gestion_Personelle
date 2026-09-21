from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.sql import func
import enum

from ..database import Base


class UserRole(str, enum.Enum):
    ADMIN = "Admin"
    HR = "RH"
    MANAGER = "Manager"
    STAFF = "Staff"


class User(Base):
    __tablename__ = "users"

    id_user = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(
        String(255),
        nullable=False
    )

    role = Column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.STAFF
    )

    personnel_id = Column(
        Integer,
        ForeignKey("personnel.id_personnel"),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    last_login = Column(
        DateTime(timezone=True),
        nullable=True
    )