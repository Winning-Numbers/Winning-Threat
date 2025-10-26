"""Hyperparameter tuning utilities for XGBoost model."""

from sklearn.model_selection import RandomizedSearchCV
from xgboost import XGBClassifier
import numpy as np


def run_randomized_search_f1(x_train, y_train, n_iter=20, cv=3):
    """
    Perform randomized search for XGBoost hyperparameters optimizing for F1 score.
    
    Parameters
    ----------
    x_train : array-like
        Training features
    y_train : array-like
        Training labels
    n_iter : int
        Number of parameter settings sampled
    cv : int
        Number of cross-validation folds
        
    Returns
    -------
    best_model : XGBClassifier
        Best model found during search
    best_params : dict
        Best hyperparameters
    """
    param_dist = {
        'max_depth': [3, 4, 5, 6, 7, 8],
        'learning_rate': [0.01, 0.05, 0.1, 0.15],
        'n_estimators': [100, 200, 500, 1000, 2000],
        'subsample': [0.6, 0.7, 0.8, 0.9, 1.0],
        'colsample_bytree': [0.6, 0.7, 0.8, 0.9, 1.0],
        'min_child_weight': [1, 3, 5, 7],
        'gamma': [0, 0.1, 0.5, 1, 2],
        'reg_alpha': [0, 0.01, 0.1, 1],
        'reg_lambda': [0.5, 1, 2, 5],
    }
    
    # Calculate scale_pos_weight
    neg, pos = np.bincount(y_train)
    scale_pos_weight = neg / max(pos, 1)
    
    xgb = XGBClassifier(
        objective='binary:logistic',
        eval_metric='aucpr',
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        n_jobs=-1
    )
    
    random_search = RandomizedSearchCV(
        xgb,
        param_distributions=param_dist,
        n_iter=n_iter,
        scoring='f1',
        cv=cv,
        verbose=2,
        random_state=42,
        n_jobs=-1
    )
    
    random_search.fit(x_train, y_train)
    
    print(f"\n🎯 Best F1 Score: {random_search.best_score_:.4f}")
    print(f"📊 Best Parameters: {random_search.best_params_}")
    
    return random_search.best_estimator_, random_search.best_params_


