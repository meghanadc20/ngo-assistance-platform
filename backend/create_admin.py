import os

from dotenv import load_dotenv

from Database.connection import SessionLocal
from models.admin import Admin
from security.password import hash_password


load_dotenv()


ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")


if not ADMIN_EMAIL or not ADMIN_PASSWORD:
    raise ValueError(
        "ADMIN_EMAIL or ADMIN_PASSWORD is not set in .env"
    )


if len(ADMIN_PASSWORD) < 8 or len(ADMIN_PASSWORD) > 72:
    raise ValueError(
        "ADMIN_PASSWORD must be between 8 and 72 characters"
    )


db = SessionLocal()

try:
    existing_admin = (
        db.query(Admin)
        .filter(Admin.email == ADMIN_EMAIL)
        .first()
    )

    if existing_admin:
        print("Admin already exists.")
    else:
        admin = Admin(
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD)
        )

        db.add(admin)
        db.commit()

        print("Admin created successfully.")

finally:
    db.close()