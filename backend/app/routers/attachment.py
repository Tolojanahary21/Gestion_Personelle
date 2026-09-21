from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud.attachment import (
    create_attachment,
    delete_attachment,
    get_attachment,
    get_attachment_by_path,
    get_attachments,
    get_attachments_by_personnel,
    update_attachment
)

from ..database import get_db

from ..models.attachment import AttachmentDocumentType
from ..models.personnel import Personnel

from ..schemas.attachment import (
    AttachmentCreate,
    AttachmentResponse,
    AttachmentUpdate
)


router = APIRouter(
    prefix="/attachments",
    tags=["Attachments"]
)


def validate_document_type(
    document_type: str
):

    try:
        return AttachmentDocumentType(document_type)

    except ValueError:

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Invalid document_type. Allowed values: "
                + ", ".join(
                    item.value
                    for item in AttachmentDocumentType
                )
            )
        )


@router.post(
    "/",
    response_model=AttachmentResponse,
    status_code=status.HTTP_201_CREATED
)
def create(
    attachment: AttachmentCreate,
    db: Session = Depends(get_db)
):

    personnel = (
        db.query(Personnel)
        .filter(
            Personnel.id_personnel
            == attachment.personnel_id
        )
        .first()
    )

    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    document_type = validate_document_type(
        attachment.document_type
    )

    existing_path = get_attachment_by_path(
        db,
        attachment.file_path
    )

    if existing_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File path already exists"
        )

    attachment_data = attachment.model_copy(
        update={
            "document_type": document_type
        }
    )

    return create_attachment(
        db,
        attachment_data
    )


@router.get(
    "/",
    response_model=list[AttachmentResponse]
)
def read_all(
    db: Session = Depends(get_db)
):

    return get_attachments(db)


@router.get(
    "/{attachment_id}",
    response_model=AttachmentResponse
)
def read_one(
    attachment_id: int,
    db: Session = Depends(get_db)
):

    attachment = get_attachment(
        db,
        attachment_id
    )

    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )

    return attachment


@router.get(
    "/personnel/{personnel_id}",
    response_model=list[AttachmentResponse]
)
def read_by_personnel(
    personnel_id: int,
    db: Session = Depends(get_db)
):

    personnel = (
        db.query(Personnel)
        .filter(
            Personnel.id_personnel == personnel_id
        )
        .first()
    )

    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    return get_attachments_by_personnel(
        db,
        personnel_id
    )


@router.put(
    "/{attachment_id}",
    response_model=AttachmentResponse
)
def update(
    attachment_id: int,
    attachment: AttachmentUpdate,
    db: Session = Depends(get_db)
):

    existing_attachment = get_attachment(
        db,
        attachment_id
    )

    if not existing_attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )

    update_data = attachment.model_dump(
        exclude_unset=True
    )

    personnel_id = update_data.get(
        "personnel_id",
        existing_attachment.personnel_id
    )

    personnel = (
        db.query(Personnel)
        .filter(
            Personnel.id_personnel == personnel_id
        )
        .first()
    )

    if not personnel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personnel not found"
        )

    if "document_type" in update_data:
        update_data["document_type"] = (
            validate_document_type(
                update_data["document_type"]
            )
        )

    if "file_path" in update_data:

        existing_path = get_attachment_by_path(
            db,
            update_data["file_path"]
        )

        if (
            existing_path
            and existing_path.id_attachment
            != attachment_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File path already exists"
            )

    for field, value in update_data.items():
        setattr(
            existing_attachment,
            field,
            value
        )

    db.commit()
    db.refresh(existing_attachment)

    return existing_attachment


@router.delete(
    "/{attachment_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete(
    attachment_id: int,
    db: Session = Depends(get_db)
):

    attachment = delete_attachment(
        db,
        attachment_id
    )

    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )

    return None