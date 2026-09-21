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


class TrainingType(str, enum.Enum):
    MILITARY = "Military"
    TECHNICAL = "Technical"
    PROFESSIONAL = "Professional"
    ACADEMIC = "Academic"
    OTHER = "Other"


class Training(Base):
    __tablename__ = "trainings"

    id_training = Column(
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

    name = Column(
        String(200),
        nullable=False
    )

    training_type = Column(
        Enum(TrainingType),
        nullable=False,
        default=TrainingType.PROFESSIONAL
    )

    institution = Column(
        String(255),
        nullable=True
    )

    start_date = Column(
        Date,
        nullable=True
    )

    end_date = Column(
        Date,
        nullable=True
    )

    certificate = Column(
        String(255),
        nullable=True
    )

    certificate_number = Column(
        String(100),
        unique=True,
        nullable=True,
        index=True
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