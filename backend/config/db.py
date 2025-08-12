from flask_sqlalchemy import SQLAlchemy
import os
from pathlib import Path

db = SQLAlchemy()

raw = (os.getenv("DATABASE_URL") or "").strip()

if not raw:
    # Resolve project root: this file is in backend/config/, so go up one to backend/
    PROJECT_ROOT = Path(__file__).resolve().parent.parent
    DB_DIR = PROJECT_ROOT / "data"
    DB_DIR.mkdir(parents=True, exist_ok=True)  # ensure backend/data/ exists

    # Use a predictable path: backend/data/local.db
    sqlite_path = DB_DIR / "local.db"
    DATABASE_URL = f"sqlite:///{sqlite_path}"
else:
    # Normalize Postgres URL for SQLAlchemy + require SSL on Render
    if raw.startswith("postgres://"):
        raw = raw.replace("postgres://", "postgresql+psycopg2://", 1)
    elif raw.startswith("postgresql://") and "postgresql+psycopg" not in raw:
        raw = raw.replace("postgresql://", "postgresql+psycopg2://", 1)
    if "sslmode=" not in raw:
        raw += ("&" if "?" in raw else "?") + "sslmode=require"
    DATABASE_URL = raw
