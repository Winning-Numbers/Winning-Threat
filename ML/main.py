from pathlib import Path
import json
from .src.data import load_data , preprocess_data
from .src.train import split_xy, TrainConfig , create_xgboost_model, save_model
from .src.evaluate import eval_accuracy , eval_classification_report , eval_confusion_matrix
from .src.predict import predict, predict_fraud

def main():

    here = Path(__file__).resolve().parent          # .../Winning-Threat/ML
    csv_path = (here / "hackathon_train.csv").resolve()

    print("Loading data...")
    data = load_data(str(csv_path))
    
    print("Preprocessing data...")
    x , y  = preprocess_data(data)
    x_train, x_test, y_train, y_test = split_xy(x , y)
    
    # Save column names for later use in prediction
    with open("ML/columns.json", "w") as f:
        json.dump(list(x_train.columns), f)
    print(f"Saved column names to ML/columns.json")
    
    print("Training XGBoost model...")
    xgb = create_xgboost_model(x_train , y_train)
    
    # Save the trained model
    save_model(xgb, "ML/model.pkl")
    
    # Evaluate model
    print("\n" + "="*50)
    print("MODEL EVALUATION")
    print("="*50)
    accuracy = eval_accuracy(x_test , y_test , xgb)
    print(f"\n✅ Accuracy: {accuracy:.4f}")
    
    print("\n📊 Classification Report:")
    eval_classification_report(x_test , y_test , xgb)
    
    print("\n🎯 Confusion Matrix:")
    eval_confusion_matrix(x_test , y_test , xgb)
    
    # Check predictions distribution
    y_pred = xgb.predict(x_test)
    fraud_predicted = y_pred.sum()
    print(f"\n📈 Prediction distribution on test set:")
    print(f"   Predicted Fraud: {fraud_predicted} ({(fraud_predicted/len(y_pred))*100:.2f}%)")
    print(f"   Predicted Legitimate: {len(y_pred) - fraud_predicted} ({((len(y_pred)-fraud_predicted)/len(y_pred))*100:.2f}%)")
    print("="*50)

    # Example transaction data for prediction
    transaction_data = {
        "lat": 37.7749,
        "long": -122.4194,
        "merch_lat": 37.7849,
        "merch_long": -122.4094,
        "state": "CA",
        "job": "Engineer",
        "category": "Electronics",
        "city_pop": 883305,
        "dob": "1990-01-01",
        "trans_date": "2023-01-01",
        "trans_time": "12:00:00",
        "unix_time": 1672531200,
        "amt": 100.50
    }

    # Test the new predict_fraud function (loads model from disk)
    print("\n--- Testing prediction with saved model ---")
    prediction = predict_fraud(transaction_data)
    print(f"Prediction: {'Fraudulent' if prediction == 1 else 'Legitimate'}")
    
    return xgb

if __name__ == "__main__":
    main()