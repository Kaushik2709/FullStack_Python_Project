import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_FILE)

raw_database_url = os.getenv(
    "DATABASE_URL",
)

# Render and many managed Postgres providers expose URLs as postgresql:// or postgres://.
# Normalize to psycopg (v3) so requirements.txt does not need psycopg2.
if raw_database_url.startswith("postgres://"):
    raw_database_url = raw_database_url.replace("postgres://", "postgresql://", 1)

if raw_database_url.startswith("postgresql://"):
    raw_database_url = raw_database_url.replace("postgresql://", "postgresql+psycopg://", 1)

if "render.com" in raw_database_url and "sslmode=" not in raw_database_url:
    separator = "&" if "?" in raw_database_url else "?"
    raw_database_url = f"{raw_database_url}{separator}sslmode=require"

DATABASE_URL = raw_database_url

# Fail fast when Postgres is unavailable to avoid silent, long startup stalls.
engine_kwargs = {}
if DATABASE_URL.startswith("postgresql"):
    engine_kwargs["connect_args"] = {"connect_timeout": 5}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
