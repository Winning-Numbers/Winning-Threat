from pathlib import Path
import json
from .src.data import load_data , preprocess_data
from .src.train import split_xy, TrainConfig , create_xgboost_model
from .src.evaluate import eval_accuracy , eval_classification_report , eval_confusion_matrix
from .src.predict import predict

def main():

    here = Path(__file__).resolve().parent          # .../Winning-Threat/ML
    csv_path = (here / "data" / "new_raw.csv").resolve()

    
    data = load_data(str(csv_path))
    x , y  = preprocess_data(data)
    x_train, x_test, y_train, y_test = split_xy(x , y)
    
    with open("ML/columns.json", "w") as f:
        json.dump(list(x_train.columns), f)
    
    xgb = create_xgboost_model(x_train , y_train)
    
    #accuracy = eval_accuracy(x_test , y_test , xgb)
    # print("Accuracy:", accuracy)

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
        "unix_time": 1672531200
    }

    # Make a prediction for the example transaction
    prediction = predict(transaction_data, xgb)
    print("Prediction:", "Fraudulent" if prediction == 1 else "Legitimate")

if __name__ == "__main__":
    main()