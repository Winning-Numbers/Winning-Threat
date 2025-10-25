import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from dataclasses import dataclass
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

@dataclass
class TrainConfig:
    target: str
    test_size: float = 0.2
    random_state: int = 42

def split_xy(x , y, config: TrainConfig = TrainConfig(target = "is_fraud")):
    return train_test_split(x, y, test_size=config.test_size, random_state=config.random_state)


def create_xgboost_model(x , y):
    # Calculate class distribution
    fraud_count = y.sum()
    total_count = len(y)
    legitimate_count = total_count - fraud_count
    
    print(f"📊 Class distribution:")
    print(f"   Total: {total_count}")
    print(f"   Fraud: {fraud_count} ({(fraud_count/total_count)*100:.2f}%)")
    print(f"   Legitimate: {legitimate_count} ({(legitimate_count/total_count)*100:.2f}%)")
    
    # Only use scale_pos_weight if fraud is the minority class
    # If fraud > 50%, it's actually the majority, so we need to balance the OTHER way
    if fraud_count < legitimate_count:
        # Fraud is minority - boost fraud class
        scale_pos_weight = legitimate_count / fraud_count
        print(f"   Boosting minority class (fraud): scale_pos_weight = {scale_pos_weight:.2f}")
    else:
        # Legitimate is minority - boost legitimate class by setting scale_pos_weight < 1
        scale_pos_weight = legitimate_count / fraud_count
        print(f"   Fraud is majority. scale_pos_weight = {scale_pos_weight:.4f}")
    
    model = XGBClassifier(
        n_estimators=300,
        learning_rate=0.1,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(x, y)
    return model


def save_model(model, model_path: str = "ML/model.pkl"):
    """Save trained model to disk.
    
    Parameters
    ----------
    model : Trained model
        The trained XGBoost model to save.
    model_path : str
        Path where the model will be saved.
    """
    Path(model_path).parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")