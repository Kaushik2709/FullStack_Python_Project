import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_FILE)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/tag_tree_db",
)

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
