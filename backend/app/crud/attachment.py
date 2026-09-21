from sqlalchemy.orm import Session

from ..models.attachment import Attachment
from ..schemas.attachment import (
    AttachmentCreate,
    AttachmentUpdate
)


def get_attachments(db: Session):

    return (
        db.query(Attachment)
        .order_by(Attachment.created_at.desc())
        .all()
    )


def get_attachment(
    db: Session,
    attachment_id: int
):

    return (
        db.query(Attachment)
        .filter(
            Attachment.id_attachment == attachment_id
        )
        .first()
    )


def get_attachments_by_personnel(
    db: Session,
    personnel_id: int
):

    return (
        db.query(Attachment)
        .filter(
            Attachment.personnel_id == personnel_id
        )
        .order_by(Attachment.created_at.desc())
        .all()
    )


def get_attachment_by_path(
    db: Session,
    file_path: str
):

    return (
        db.query(Attachment)
        .filter(
            Attachment.file_path == file_path
        )
        .first()
    )


def create_attachment(
    db: Session,
    attachment: AttachmentCreate
):

    db_attachment = Attachment(
        **attachment.model_dump()
    )

    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)

    return db_attachment


def update_attachment(
    db: Session,
    attachment_id: int,
    attachment: AttachmentUpdate
):

    db_attachment = get_attachment(
        db,
        attachment_id
    )

    if not db_attachment:
        return None

    update_data = attachment.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            db_attachment,
            field,
            value
        )

    db.commit()
    db.refresh(db_attachment)

    return db_attachment


def delete_attachment(
    db: Session,
    attachment_id: int
):

    db_attachment = get_attachment(
        db,
        attachment_id
    )

    if not db_attachment:
        return None

    db.delete(db_attachment)
    db.commit()

    return db_attachment