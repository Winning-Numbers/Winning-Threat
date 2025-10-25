import pandas as pd
import numpy as np
from dataclasses import dataclass
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

@dataclass
class TrainConfig:
    target: str
    test_size: float = 0.2
    random_state: int = 42

def split_xy(data: pd.DataFrame, config: TrainConfig):
    X = data.drop(columns=[config.target])
    y = data[config.target]
    return train_test_split(X, y, test_size=config.test_size, random_state=config.random_state)

@dataclass
class RfModelConfig:
    n_estimators: int = 100
    max_depth: int = None
    random_state: int = 42

def create_rf_model(x , y, config: RfModelConfig):
    model = RandomForestClassifier(
        n_estimators=config.n_estimators,
        max_depth=config.max_depth,
        random_state=config.random_state
    )
    model.fit(x, y)
    return model