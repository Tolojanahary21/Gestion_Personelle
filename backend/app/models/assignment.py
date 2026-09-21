import enum

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text
)
from sqlalchemy.sql import func

from ..database import Base


class AssignmentType(str, enum.Enum):
    PERMANENT = "Permanent"
    TEMPORARY = "Temporary"
    MISSION = "Mission"
    TRAINING = "Training"
    SECONDMENT = "Secondment"
    OTHER = "Other"


class AssignmentStatus(str, enum.Enum):
    PLANNED = "Planned"
    ACTIVE = "Active"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class Assignment(Base):
    __tablename__ = "assignments"

    id_assignment = Column(
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
        index=True
    )

    assignment_type = Column(
        Enum(AssignmentType),
        nullable=False,
        default=AssignmentType.PERMANENT
    )

    position = Column(
        String(200),
        nullable=False
    )

    location = Column(
        String(255),
        nullable=True
    )

    start_date = Column(
        Date,
        nullable=False
    )

    end_date = Column(
        Date,
        nullable=True
    )

    status = Column(
        Enum(AssignmentStatus),
        nullable=False,
        default=AssignmentStatus.PLANNED
    )

    description = Column(
        Text,
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