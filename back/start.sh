#!/bin/bash

# Check if model exists
if [ ! -f "ML/model.pkl" ]; then
    echo "⚠️ WARNING: Model file ML/model.pkl not found!"
    echo "Using fallback prediction (always predicting fraud)"
    echo "📋 To fix: Upload trained model to Railway or use cloud storage"
else
    echo "✅ Model found at ML/model.pkl"
fi

echo "🚀 Starting Fraud Detection API server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000

