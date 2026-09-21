import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text
)
from sqlalchemy.sql import func

from ..database import Base


class UnitType(str, enum.Enum):
    HEADQUARTERS = "Headquarters"
    DIVISION = "Division"
    BRIGADE = "Brigade"
    REGIMENT = "Regiment"
    BATTALION = "Battalion"
    COMPANY = "Company"
    PLATOON = "Platoon"
    SQUADRON = "Squadron"
    DEPARTMENT = "Department"
    OFFICE = "Office"
    OTHER = "Other"


class Unit(Base):
    __tablename__ = "units"

    id_unit = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(200),
        nullable=False,
        unique=True,
        index=True
    )

    code = Column(
        String(50),
        nullable=False,
        unique=True,
        index=True
    )

    unit_type = Column(
        Enum(UnitType),
        nullable=False,
        default=UnitType.OTHER
    )

    parent_unit_id = Column(
        Integer,
        ForeignKey(
            "units.id_unit",
            ondelete="SET NULL"
        ),
        nullable=True,
        index=True
    )

    location = Column(
        String(255),
        nullable=True
    )

    commander_personnel_id = Column(
        Integer,
        ForeignKey(
            "personnel.id_personnel",
            ondelete="SET NULL"
        ),
        nullable=True,
        index=True
    )

    description = Column(
        Text,
        nullable=True
    )

    active = Column(
        Boolean,
        nullable=False,
        default=True
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