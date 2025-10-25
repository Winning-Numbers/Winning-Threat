# Fraud Detection Setup Instructions

## What Was Changed

### 1. ML Model Persistence
- **Modified `ML/src/train.py`**: Added `save_model()` function to save trained models to disk using joblib
- **Modified `ML/src/predict.py`**: Added `predict_fraud()` function that loads the saved model and makes predictions
- **Modified `ML/main.py`**: Updated to save the model after training and test the new prediction function

### 2. Backend Integration
- **Modified `back/app/main.py`**: 
  - Imports the ML prediction function from the ML module
  - Replaced random predictions with actual ML predictions
  - Added error handling with fallback to random predictions if model unavailable

## How to Use

### Step 1: Train the Model (One-time)
```bash
cd ML
python -m main
```

This creates:
- `ML/model.pkl` - The trained model file
- `ML/columns.json` - Feature column names

### Step 2: Start the Backend
```bash
cd back
# Activate your virtual environment if needed
# source env/bin/activate  # or env\Scripts\activate on Windows
uvicorn app.main:app --reload
```

The backend will automatically:
- Load the ML model at startup
- Use it to predict fraud for incoming transactions
- Call `predict_fraud(transaction)` for each transaction received

### Step 3: That's It!
The system now:
- ✅ Loads the model once (cached in memory)
- ✅ Makes fast predictions without retraining
- ✅ Automatically classifies transactions as fraud or legitimate

## Key Function

In your backend code, transactions are now classified using:

```python
from src.predict import predict_fraud

prediction = predict_fraud(transaction_data)
# Returns: 0 for legitimate, 1 for fraud
```

## Retraining

To retrain with new data:
1. Update `ML/hackathon_train.csv`
2. Run `python -m main` again
3. Restart the backend to load the new model

## Files Structure
```
ML/
├── main.py              # Training script
├── model.pkl            # Saved model (created after training)
├── columns.json         # Feature columns
└── src/
    ├── train.py         # Training logic + save_model()
    ├── predict.py       # predict_fraud() function
    └── data.py          # Data preprocessing

back/
└── app/
    └── main.py          # Backend with ML integration
```

## Transaction Format

The model expects these fields in the transaction dictionary:
- `lat`, `long` - Customer coordinates
- `merch_lat`, `merch_long` - Merchant coordinates  
- `city_pop` - City population
- `dob` - Date of birth
- `trans_date`, `trans_time` - Transaction timestamp
- `unix_time` - Unix timestamp
- `amt` - Transaction amount

Other fields (like `trans_num`, `state`, etc.) are ignored during prediction.


