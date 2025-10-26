"""Utility script to preprocess and save training data to pickle file."""

from pathlib import Path
import joblib
from src.data import load_data, preprocess_data
from src.train import split_xy


def main():
    here = Path(__file__).resolve().parent
    csv_path = (here / "hackathon_train.csv").resolve()

    print("Loading data from CSV...")
    data = load_data(str(csv_path))

    print("Preprocessing data...")
    x, y = preprocess_data(data)

    print("Splitting data...")
    x_train, x_test, y_train, y_test = split_xy(x, y)

    # Save preprocessed training data
    output_path = here / "training_data.pkl"
    print(f"Saving training data to {output_path}...")
    joblib.dump((x_train, x_test, y_train, y_test), output_path)

    print(f"✅ Done! Training data saved to {output_path}")
    print(f"   x_train shape: {x_train.shape}")
    print(f"   x_test shape: {x_test.shape}")
    print(f"   y_train shape: {y_train.shape}")
    print(f"   y_test shape: {y_test.shape}")


if __name__ == "__main__":
    main()
