import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Falling back to local SQLite for testing since Neon password failed
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
print(f"DEBUG: Using local database: {SQLALCHEMY_DATABASE_URL}")
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Compatibility functions for profile_updater
import models

def log_query(query_text: str):
    db = SessionLocal()
    try:
        new_query = models.UserQuery(query_text=query_text)
        db.add(new_query)
        db.commit()
    finally:
        db.close()

def update_interest(interest_name: str, category: str, confidence: int, embedding: list):
    db = SessionLocal()
    try:
        new_interest = models.UserInterest(
            interest_name=interest_name,
            category=category,
            confidence=confidence,
            embedding=embedding
        )
        db.add(new_interest)
        db.commit()
    finally:
        db.close()
