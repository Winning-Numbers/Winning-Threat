import json
import pandas as pd
import joblib
from pathlib import Path
from .data import preprocess_input_data

# Global variable to cache the loaded model
_cached_model = None


def load_model(model_path: str = "ML/model.pkl"):
    """Load trained model from disk.
    
    Parameters
    ----------
    model_path : str
        Path to the saved model file.
    
    Returns
    -------
    model
        The loaded trained model.
    """
    global _cached_model
    
    if _cached_model is None:
        model_file = Path(model_path)
        if not model_file.exists():
            raise FileNotFoundError(
                f"Model file not found at {model_path}. "
                "Please train the model first by running ML/main.py"
            )
        _cached_model = joblib.load(model_path)
        print(f"Model loaded from {model_path}")
    
    return _cached_model


def predict(transaction_data: dict, model , th: float = 0.5) -> int:
    """Make prediction for a single transaction using the provided model.

    Parameters
    ----------
    transaction_data : dict
        Dictionary containing the transaction data.
    model : Trained model
        A trained machine learning model with a predict method.

    Returns
    -------
    int
        0 for legitimate transaction, 1 for fraudulent transaction.
    """
    # Convert dictionary to DataFrame
    data = pd.DataFrame([transaction_data])
    
    # Preprocess the data
    x = preprocess_input_data(data)

    # Get expected columns - try from file, fallback to model's feature names
    columns_path = Path(__file__).parent.parent / "columns.json"
    try:
        with open(columns_path, "r") as f:
            expected_cols = json.load(f)
    except FileNotFoundError:
        # Get feature names from model if columns.json doesn't exist
        if hasattr(model, 'feature_names_in_'):
            expected_cols = list(model.feature_names_in_)
        elif hasattr(model, 'get_booster'):
            # XGBoost model
            expected_cols = model.get_booster().feature_names
        else:
            # Use current columns as-is
            expected_cols = list(x.columns)
        
        # Save for next time
        try:
            columns_path.parent.mkdir(parents=True, exist_ok=True)
            with open(columns_path, "w") as f:
                json.dump(expected_cols, f)
        except:
            pass  # If we can't write, just continue
        
    x = x.reindex(columns=expected_cols, fill_value=0)
    
    # Make predictions
    predictions = model.predict(x)
    
    # Convert predictions to binary (0 or 1)
    binary_predictions = (predictions > th).astype(int)
    
    # Since we only have one transaction, return the single prediction value
    return int(binary_predictions[0])