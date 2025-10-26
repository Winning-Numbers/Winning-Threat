"""Database configuration and session management."""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment variable
# Format: postgresql://user:password@host:port/database
DATABASE_URL = os.getenv("DATABASE_URL")

# Only initialize database if URL is provided


engine = None


SessionLocal = None
Base = declarative_base()

if DATABASE_URL:


    try:


        engine = create_engine(DATABASE_URL)


        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


        print("✅ Database connection configured")


    except Exception as e:


        print(f"⚠️ Database connection failed: {e}")


        print("📋 App will run without database persistence")


else:


    print("⚠️ DATABASE_URL not set - running without database")


def get_db():
    """Get database session."""
    if SessionLocal is None:


        return None
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    if engine is None:


        print("⚠️ Database not configured - skipping table creation")


        return


    try:


        Base.metadata.create_all(bind=engine)


        print("✅ Database tables created")


    except Exception as e:


        print(f"⚠️ Could not create database tables: {e}")

