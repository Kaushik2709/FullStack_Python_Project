import os
from pathlib import Path
from typing import List
import logging

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import TreeRecord
from .schemas import TreeCreate, TreeResponse, TreeUpdate

ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_FILE)

logger = logging.getLogger(__name__)

app = FastAPI(title="Nested Tag Tree API")

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def initialize_database() -> None:
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema check completed.")
    except Exception:
        logger.exception("Database initialization failed. Check DATABASE_URL and Postgres availability.")
        raise


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/trees", response_model=List[TreeResponse])
def list_trees(db: Session = Depends(get_db)):
    return db.query(TreeRecord).order_by(TreeRecord.id.asc()).all()


@app.post("/api/trees", response_model=TreeResponse, status_code=201)
def create_tree(payload: TreeCreate, db: Session = Depends(get_db)):
    record = TreeRecord(tree=payload.tree.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@app.put("/api/trees/{tree_id}", response_model=TreeResponse)
def update_tree(tree_id: int, payload: TreeUpdate, db: Session = Depends(get_db)):
    record = db.query(TreeRecord).filter(TreeRecord.id == tree_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Tree record not found")

    record.tree = payload.tree.model_dump()
    db.commit()
    db.refresh(record)
    return record
