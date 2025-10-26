import pandas as pd
import numpy as np
from dataclasses import dataclass
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
import json

@dataclass
class TrainConfig:
    target: str
    test_size: float = 0.2
    random_state: int = 42

def split_xy(x , y, config: TrainConfig = TrainConfig(target = "is_fraud")):
    return train_test_split(x, y, test_size=config.test_size, random_state=config.random_state)


def create_xgboost_model(x , y , scale_pos_weight):
    model = XGBClassifier(
        max_depth=6,              # începe cu 5–8
        learning_rate=0.05,       # mic + early stopping
        n_estimators=4000,        # mare, dar oprim devreme
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=5,       # ↑ dacă ai mult zgomot
        gamma=0.0,                # 0–5 (mai mare = mai conservator)
        reg_alpha=0.0,            # L1
        reg_lambda=2.0,           # L2
        max_bin=256,              # pentru hist/gpu_hist
        grow_policy="depthwise",  # "lossguide" dacă vrei frunze multe
        objective="binary:logistic",
        eval_metric="aucpr",      # cheie la clase rare
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        n_jobs=-1
    )
    model.fit(x, y)
    return model

def split_xy_balance(x, y, test_size=0.2):
    """Split data stratified and compute scale_pos_weight for XGBoost."""
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=test_size, stratify=y, random_state=42
    )

    # raport negativ/pozitiv
    neg, pos = np.bincount(y_train)
    scale_pos_weight = neg / max(pos, 1)

    return x_train, x_test, y_train, y_test, scale_pos_weight

def predict_with_threshold(model , x , threshold: float = 0.5):
    """
    Turn predicted probabilities into class labels using a custom threshold.
    Works for binary classifiers (proba for class 1 at [:, 1]).
    """
    proba = model.predict_proba(x)[:,1]
    return (proba >= threshold).astype(int)