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


class ComputerSkillCategory(str, enum.Enum):
    PROGRAMMING = "Programming"
    DATABASE = "Database"
    OFFICE = "Office"
    NETWORKING = "Networking"
    OPERATING_SYSTEM = "Operating System"
    DESIGN = "Design"
    SECURITY = "Security"
    OTHER = "Other"


class ComputerSkillProficiency(str, enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    EXPERT = "Expert"


class ComputerSkill(Base):
    __tablename__ = "computer_skills"

    id_computer_skill = Column(
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

    skill_name = Column(
        String(150),
        nullable=False
    )

    category = Column(
        Enum(ComputerSkillCategory),
        nullable=False,
        default=ComputerSkillCategory.OTHER
    )

    proficiency = Column(
        Enum(ComputerSkillProficiency),
        nullable=False,
        default=ComputerSkillProficiency.INTERMEDIATE
    )

    years_experience = Column(
        Integer,
        nullable=False,
        default=0
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