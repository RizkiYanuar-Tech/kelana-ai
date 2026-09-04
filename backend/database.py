from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()

from backend.models import user
from backend.models import trip
from backend.models import conversation
import os
from pathlib import Path

# load variable .env
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)

# ambil URL database
DATABASE_URL = os.getenv('database_url')

# Create connection to database
engine = create_engine(DATABASE_URL)

# Create session database
SessionLocal = sessionmaker(bind=engine, autoflush=False)

# Create Tables
def init_db() -> None:
    """
    Create all SQLAlchemy tables for the configured
    database.
    """
    Base.metadata.create_all(bind=engine)
