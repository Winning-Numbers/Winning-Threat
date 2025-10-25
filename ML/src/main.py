from src.data import load_data
from src.train import split_xy, create_rf_model, TrainConfig, RfModelConfig

def main():
    data = load_data("data.csv")


if __name__ == "__main__":
    main()