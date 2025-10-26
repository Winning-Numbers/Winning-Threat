"""Utility to load preprocessed training data from pickle file."""

from pathlib import Path
import joblib


def load_training_data():
    """Load preprocessed training data from pickle file.

    Returns
    -------
    tuple
        (x_train, x_test, y_train, y_test)
    """
    here = Path(__file__).resolve().parent
    data_path = here / "training_data.pkl"

    if not data_path.exists():
        raise FileNotFoundError(
            f"Training data not found at {data_path}. "
            "Run 'python ML/save_training_data.py' first."
        )

    print(f"Loading training data from {data_path}...")
    x_train, x_test, y_train, y_test = joblib.load(data_path)
    print(f"✅ Loaded! x_train: {x_train.shape}, x_test: {x_test.shape}")

    return x_train, x_test, y_train, y_test


if __name__ == "__main__":
    # Test loading
    x_train, x_test, y_train, y_test = load_training_data()
