from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String
)
from sqlalchemy.sql import func

from ..database import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id_refresh_token = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id_user",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    token_hash = Column(
        String(255),
        nullable=False,
        unique=True,
        index=True
    )

    expires_at = Column(
        DateTime(timezone=True),
        nullable=False
    )

    revoked = Column(
        Boolean,
        nullable=False,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )