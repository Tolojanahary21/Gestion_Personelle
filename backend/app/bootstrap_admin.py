import os

import bcrypt

from .database import SessionLocal
from .models.user import User, UserRole


def bootstrap_admin_from_environment() -> None:
    """Create the configured first admin account when it does not exist."""
    username = os.getenv("ADMIN_BOOTSTRAP_USERNAME", "").strip()
    password = os.getenv("ADMIN_BOOTSTRAP_PASSWORD", "")
    if not username and not password:
        return
    if not username or not password:
        raise RuntimeError("Both ADMIN_BOOTSTRAP_USERNAME and ADMIN_BOOTSTRAP_PASSWORD must be configured.")
    if len(username) < 3 or len(password) < 8:
        raise RuntimeError("The bootstrap admin username must be at least 3 characters and its password at least 8 characters.")

    with SessionLocal() as db:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            if existing.role != UserRole.ADMIN:
                raise RuntimeError("The configured bootstrap username already exists without the Admin role.")
            return

        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        db.add(User(username=username, password=password_hash, role=UserRole.ADMIN, personnel_id=None))
        db.commit()
