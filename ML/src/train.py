import pandas as pd
import numpy as np
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
    model = XGBClassifier(
        n_estimators=300,
        learning_rate=0.1,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(x, y)
    return model