import enum

from sqlalchemy import (
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


class AttachmentDocumentType(str, enum.Enum):
    IDENTITY = "Identity"
    PASSPORT = "Passport"
    CERTIFICATE = "Certificate"
    DIPLOMA = "Diploma"
    MEDICAL = "Medical"
    MILITARY = "Military"
    DECORATION = "Decoration"
    TRAINING = "Training"
    OTHER = "Other"


class Attachment(Base):
    __tablename__ = "attachments"

    id_attachment = Column(
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

    file_name = Column(
        String(255),
        nullable=False
    )

    file_path = Column(
        String(500),
        nullable=False
    )

    file_type = Column(
        String(100),
        nullable=True
    )

    file_size = Column(
        Integer,
        nullable=True
    )

    document_type = Column(
        Enum(AttachmentDocumentType),
        nullable=False,
        default=AttachmentDocumentType.OTHER
    )

    description = Column(
        Text,
        nullable=True
    )

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
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