"""Database models for fraud detection system."""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from .database import Base


class Transaction(Base):
    """Transaction model for storing transaction data and predictions."""
    
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    trans_num = Column(String, unique=True, index=True, nullable=False)
    
    # Transaction details
    amt = Column(Float)
    city_pop = Column(Float)
    merchant = Column(String)
    category = Column(String)
    
    # Location data
    lat = Column(Float)
    long = Column(Float)
    merch_lat = Column(Float)
    merch_long = Column(Float)
    
    # Customer info
    first = Column(String)
    last = Column(String)
    gender = Column(String)
    dob = Column(String)
    job = Column(String)
    
    # Transaction metadata
    trans_date = Column(String)
    trans_time = Column(String)
    unix_time = Column(Integer)
    
    # ML prediction
    prediction = Column(Integer, index=True)  # 0 = legitimate, 1 = fraud
    is_fraud_actual = Column(Integer, nullable=True)  # Actual label if known
    
    # Raw transaction data (JSON)
    raw_data = Column(JSON)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Transaction {self.trans_num} - Prediction: {self.prediction}>"

