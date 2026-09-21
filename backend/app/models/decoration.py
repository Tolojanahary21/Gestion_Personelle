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


class DecorationType(str, enum.Enum):
    MEDAL = "Medal"
    ORDER = "Order"
    COMMENDATION = "Commendation"
    DISTINCTION = "Distinction"
    OTHER = "Other"


class Decoration(Base):
    __tablename__ = "decorations"

    id_decoration = Column(
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

    decoration_type = Column(
        Enum(DecorationType),
        nullable=False,
        default=DecorationType.OTHER
    )

    award_date = Column(
        Date,
        nullable=False
    )

    awarding_authority = Column(
        String(255),
        nullable=True
    )

    reference_number = Column(
        String(100),
        unique=True,
        nullable=True,
        index=True
    )

    description = Column(
        Text,
        nullable=True
    )

    notes = Column(
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