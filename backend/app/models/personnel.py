from sqlalchemy import Boolean, Column, Date, Integer, String,ForeignKey
 
from ..database import Base


class Personnel(Base):
    __tablename__ = "personnel"

    id_personnel = Column(
        Integer,
        primary_key=True,
        index=True
    )

    grade_id = Column(
        Integer,
        ForeignKey(
            "grades.id_grade",
            ondelete="SET NULL"
        ),
        nullable=True,
        index=True
    )

    last_name = Column(
        String(100),
        nullable=False
    )

    first_names = Column(
        String(150),
        nullable=False
    )

    photo = Column(
        String(500),
        nullable=True
    )

    birth_date = Column(
        Date,
        nullable=True
    )

    birth_place = Column(
        String(255),
        nullable=True
    )

    prefecture = Column(
        String(100),
        nullable=True
    )

    sub_prefecture = Column(
        String(100),
        nullable=True
    )

    province = Column(
        String(100),
        nullable=True
    )

    cin_number = Column(
        String(50),
        unique=True,
        nullable=True,
        index=True
    )

    cin_date = Column(
        Date,
        nullable=True
    )

    cin_place = Column(
        String(255),
        nullable=True
    )

    cin_duplicate = Column(
        Boolean,
        nullable=True
    )

    passport_number = Column(
        String(50),
        unique=True,
        nullable=True,
        index=True
    )

    passport_date = Column(
        Date,
        nullable=True
    )

    email = Column(
        String(255),
        unique=True,
        nullable=True,
        index=True
    )

    phone = Column(
        String(30),
        nullable=True
    )

    current_address = Column(
        String(500),
        nullable=True
    )

    emergency_address = Column(
        String(500),
        nullable=True
    )

    emergency_contact = Column(
        String(255),
        nullable=True
    )

    religion = Column(
        String(100),
        nullable=True
    )

    blood_type = Column(
        String(10),
        nullable=True
    )

    height = Column(
        Integer,
        nullable=True
    )

    sport = Column(
        String(150),
        nullable=True
    )

    father_name = Column(
        String(200),
        nullable=True
    )

    mother_name = Column(
        String(200),
        nullable=True
    )

    marital_status = Column(
        String(50),
        nullable=True
    )

    marriage_authorization = Column(
        Boolean,
        nullable=True
    )

    spouse_name = Column(
        String(200),
        nullable=True
    )

    spouse_birth_date = Column(
        Date,
        nullable=True
    )

    spouse_birth_place = Column(
        String(255),
        nullable=True
    )

    spouse_occupation = Column(
        String(200),
        nullable=True
    )

    children_count = Column(
        Integer,
        nullable=False,
        default=0
    )