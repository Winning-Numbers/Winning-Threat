import json
import pandas as pd
from .data import preprocess_input_data

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
    
    # Make predictions
    predictions = model.predict(x)
    
    # Convert predictions to binary (0 or 1)
    binary_predictions = (predictions > 0.5).astype(int)
    
    # Since we only have one transaction, return the single prediction value
    return int(binary_predictions[0])