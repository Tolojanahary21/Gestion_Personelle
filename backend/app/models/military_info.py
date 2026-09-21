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


class ServiceStatus(str, enum.Enum):
    ACTIVE = "Active"
    RETIRED = "Retired"
    SUSPENDED = "Suspended"


class MilitaryInfo(Base):
    __tablename__ = "military_infos"

    id_military_info = Column(
        Integer,
        primary_key=True,
        index=True
    )

    personnel_id = Column(
        Integer,
        ForeignKey(
            "personnel.id_personnel",
            ondelete="CASCADE"
        ),
        nullable=False,
        unique=True,
        index=True
    )

    matricule = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    recruitment_date = Column(
        Date,
        nullable=True
    )

    recruitment_place = Column(
        String(255),
        nullable=True
    )

    service_start_date = Column(
        Date,
        nullable=True
    )

    service_status = Column(
        Enum(ServiceStatus),
        nullable=False,
        default=ServiceStatus.ACTIVE
    )

    military_service_type = Column(
        String(150),
        nullable=True
    )

    specialty = Column(
        String(200),
        nullable=True
    )

    unit = Column(
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