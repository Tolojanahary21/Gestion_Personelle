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


class LanguageProficiency(str, enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    FLUENT = "Fluent"
    NATIVE = "Native"


class LanguageLevel(str, enum.Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"
    NATIVE = "Native"


class Language(Base):
    __tablename__ = "languages"

    id_language = Column(
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
        String(100),
        nullable=False
    )

    proficiency = Column(
        Enum(LanguageProficiency),
        nullable=False,
        default=LanguageProficiency.INTERMEDIATE
    )

    level = Column(
        Enum(LanguageLevel),
        nullable=True
    )

    certification = Column(
        String(255),
        nullable=True
    )

    certification_date = Column(
        Date,
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