# How to Retrain the Model

## In WSL or Linux terminal:

```bash
cd /mnt/d/HackEestec/Winning-Threat/ML
python train_model.py
```

## If that doesn't work, check your Python:

```bash
# Check if pandas is installed
python -c "import pandas; print('Pandas OK')"

# If not, install requirements
pip install -r requirements.txt

# Then train
python train_model.py
```

## The training script will:
1. Load and preprocess data
2. Train with class balancing (scale_pos_weight)
3. Show you class distribution
4. Show evaluation metrics
5. Save model to model.pkl

## After training:
1. Restart your backend server
2. The new model will be loaded automatically
3. You should see fraud predictions now!

