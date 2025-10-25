# ML Model Usage Guide

## Overview
This directory contains a fraud detection ML model based on XGBoost. The model can be trained once and then used for predictions without retraining.

## Files
- `main.py` - Script to train the model and save it to disk
- `model.pkl` - The saved trained model (created after training)
- `columns.json` - Feature column names used by the model
- `src/train.py` - Training logic and model configuration
- `src/predict.py` - Prediction functions
- `src/data.py` - Data loading and preprocessing

## Usage

### 1. Train the Model (One-time setup)

Before using predictions, you need to train and save the model:

```bash
cd ML
python -m main
```

This will:
- Load the training data from `hackathon_train.csv`
- Train an XGBoost model
- Save the model to `ML/model.pkl`
- Save feature columns to `ML/columns.json`
- Display model accuracy
- Test a sample prediction

### 2. Use Predictions in Backend

The backend (`back/app/main.py`) automatically imports and uses the ML model. 

**Simple usage:**

```python
from src.predict import predict_fraud

# Transaction data from your stream
transaction = {
    "lat": 37.7749,
    "long": -122.4194,
    "merch_lat": 37.7849,
    "merch_long": -122.4094,
    "city_pop": 883305,
    "dob": "1990-01-01",
    "trans_date": "2023-01-01",
    "trans_time": "12:00:00",
    "unix_time": 1672531200,
    "amt": 100.50
}

# Get prediction (0 = legitimate, 1 = fraud)
prediction = predict_fraud(transaction)
print("Fraud detected!" if prediction == 1 else "Legitimate transaction")
```

### 3. Model Caching

The model is loaded once and cached in memory for fast predictions. Subsequent calls to `predict_fraud()` reuse the loaded model.

### 4. Retraining

If you need to retrain the model with new data:
1. Update `hackathon_train.csv` with new training data
2. Run `python -m main` again
3. Restart your backend server to load the new model

## Required Features

The model expects these transaction features:
- `lat`, `long` - Customer location
- `merch_lat`, `merch_long` - Merchant location
- `city_pop` - City population
- `dob` - Date of birth
- `trans_date` - Transaction date
- `trans_time` - Transaction time
- `unix_time` - Unix timestamp
- `amt` - Transaction amount

Optional fields (can be present but will be dropped):
- `state`, `job`, `category`, `city`, `merchant`
- `transaction_id`, `ssn`, `first`, `last`, `gender`
- `cc_num`, `street`, `zip`, `acct_num`, `trans_num`

## Error Handling

If the model file doesn't exist, `predict_fraud()` will raise a `FileNotFoundError` with instructions to train the model first.

The backend has a fallback mechanism that uses random predictions if the model cannot be loaded.


