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

    # Get columns.json path relative to this file
    columns_path = Path(__file__).parent.parent / "columns.json"
    with open(columns_path, "r") as f:
        expected_cols = json.load(f)
        
    x = x.reindex(columns=expected_cols, fill_value=0)
    
    # Make predictions
    predictions = model.predict(x)
    
    # Convert predictions to binary (0 or 1)
    binary_predictions = (predictions > th).astype(int)
    
    # Since we only have one transaction, return the single prediction value
    return int(binary_predictions[0])