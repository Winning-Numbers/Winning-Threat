from pathlib import Path
import json
from .src.data import load_data , preprocess_data
from .src.train import split_xy, TrainConfig , create_xgboost_model, split_xy_balance
from .src.evaluate import eval_accuracy , eval_classification_report , eval_confusion_matrix
from .src.predict import predict
from .src.tunning import run_randomized_search_f1

def main():

    here = Path(__file__).resolve().parent          # .../Winning-Threat/ML
    csv_path = (here / "hackathon_train.csv").resolve()

    
    data = load_data(str(csv_path))
    x , y  = preprocess_data(data)
    x_train, x_test, y_train, y_test, scale_pos_weight = split_xy_balance(x , y)
    
    with open("ML/columns.json", "w") as f:
        json.dump(list(x_train.columns), f)

    xgb = create_xgboost_model(x_train , y_train , scale_pos_weight)

    # run_randomized_search_f1(xgb , x_train , y_train)

    th = 0.7  # custom threshold

    # accuracy = eval_accuracy(x_test , y_test , xgb , th)
    # print("Accuracy:", accuracy)

    # print("Classification Report:\n" , eval_classification_report(x_test , y_test , xgb , th))

    # print("Confusion Matrix:" , eval_confusion_matrix(x_test , y_test , xgb , th))

    # # Example transaction data for prediction
    # transaction_data = {
    #     "lat": 37.7749,
    #     "long": -122.4194,
    #     "merch_lat": 37.7849,
    #     "merch_long": -122.4094,
    #     "state": "CA",
    #     "job": "Engineer",
    #     "category": "Electronics",
    #     "city_pop": 883305,
    #     "dob": "1990-01-01",
    #     "trans_date": "2023-01-01",
    #     "trans_time": "12:00:00",
    #     "unix_time": 1672531200
    # }

    # # Make a prediction for the example transaction
    # prediction = predict(transaction_data, xgb)
    # print("Prediction:", "Fraudulent" if prediction == 1 else "Legitimate")

    return xgb

if __name__ == "__main__":
    main()