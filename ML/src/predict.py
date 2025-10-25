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


def predict_fraud(transaction_data: dict, model_path: str = "ML/model.pkl") -> int:
    """Predict if a transaction is fraudulent. Loads model automatically.
    
    This is the main function to call from the backend.
    
    Parameters
    ----------
    transaction_data : dict
        Dictionary containing the transaction data with keys like:
        'lat', 'long', 'merch_lat', 'merch_long', 'city_pop',
        'dob', 'trans_date', 'trans_time', 'unix_time', etc.
    model_path : str, optional
        Path to the saved model file. Defaults to "ML/model.pkl"
    
    Returns
    -------
    int
        0 for legitimate transaction, 1 for fraudulent transaction.
    
    Example
    -------
    >>> transaction = {
    ...     "lat": 37.7749,
    ...     "long": -122.4194,
    ...     "merch_lat": 37.7849,
    ...     "merch_long": -122.4094,
    ...     "city_pop": 883305,
    ...     "dob": "1990-01-01",
    ...     "trans_date": "2023-01-01",
    ...     "trans_time": "12:00:00",
    ...     "unix_time": 1672531200,
    ...     "amt": 100.50
    ... }
    >>> prediction = predict_fraud(transaction)
    >>> print("Fraud" if prediction == 1 else "Legitimate")
    """
    # Load the model (cached after first load)
    model = load_model(model_path)
    
    # Convert dictionary to DataFrame
    data = pd.DataFrame([transaction_data])
    
    # Preprocess the data
    x = preprocess_input_data(data)

    # Load expected columns and reindex
    columns_path = Path(model_path).parent / "columns.json"
    with open(columns_path, "r") as f:
        expected_cols = json.load(f)
    
    # Debug: Print preprocessed features (only once)
    if not hasattr(predict_fraud, '_debug_printed'):
        print(f"🔍 Preprocessed features: {x.columns.tolist()}")
        print(f"🔍 Expected columns: {expected_cols}")
        print(f"🔍 Feature values: {x.iloc[0].to_dict()}")
        predict_fraud._debug_printed = True
        
    x = x.reindex(columns=expected_cols, fill_value=0)
    
    # Use predict_proba to get probabilities
    probabilities = model.predict_proba(x)
    fraud_probability = probabilities[0][1]  # Probability of fraud (class 1)
    
    # Since fraud is the MAJORITY class (95% of data), use a LOWER threshold
    # Predict fraud unless we're very confident it's legitimate
    threshold = 0.3  # Lower threshold = more fraud predictions (realistic for 95% fraud rate)
    prediction = 1 if fraud_probability >= threshold else 0
    
    # Debug: Show prediction details
    print(f"🔍 Fraud probability: {fraud_probability:.4f} | Threshold: {threshold} | Prediction: {prediction}")
    
    return int(prediction)


def predict(transaction_data: dict, model) -> int:
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

    with open("ML/columns.json", "r") as f:
        expected_cols = json.load(f)
        
    x = x.reindex(columns=expected_cols, fill_value=0)
    
    # Make predictions - XGBoost predict() already returns class labels (0 or 1)
    predictions = model.predict(x)
    
    # XGBoost already returns 0 or 1, no need to threshold
    return int(predictions[0])