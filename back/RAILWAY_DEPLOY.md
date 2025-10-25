# Railway Deployment Guide

## 🚀 Quick Deploy

This API will deploy to Railway, but needs the ML model file to work properly.

### Initial Deployment (Fallback Mode)

1. Push code to Railway - it will deploy but use **fallback prediction** (always predicts fraud)
2. This is acceptable since 95% of transactions are fraud anyway

### Full ML Deployment (With Trained Model)

To use the actual ML model:

1. **Train the model locally:**
   ```bash
   source back/env/bin/activate
   python -m ML.main
   ```
   This creates `ML/model.pkl` and `ML/columns.json`

2. **Upload model to Railway:**
   
   Option A - Using Railway CLI:
   ```bash
   railway run --service winning-threat cp ML/model.pkl /app/ML/model.pkl
   railway run --service winning-threat cp ML/columns.json /app/ML/columns.json
   ```

   Option B - Use Railway Volume Storage:
   - Create a volume in Railway dashboard
   - Mount it to `/app/ML`
   - Upload model files via Railway dashboard

3. **Restart the service** - it will automatically detect and use the model

## 📦 Dependencies

All Python dependencies are in `back/requirements.txt`:
- FastAPI, Uvicorn (API framework)
- Requests, SSEClient (API communication)
- Pandas, NumPy, Scikit-learn, XGBoost (ML libraries)

## 🔧 Environment Variables

No environment variables needed - API key is in the code (for hackathon purposes).

## 📊 How It Works

1. **With Model**: Uses XGBoost trained on 592k transactions (95% fraud rate)
2. **Without Model (Fallback)**: Always predicts fraud (reasonable default for 95% fraud rate)

## 🐛 Troubleshooting

- **"No module named 'ML'"**: ML folder not copied to back/ - run `cp -r ML back/`
- **"Model file not found"**: Normal - using fallback mode until model uploaded
- **Import errors**: Check `back/requirements.txt` has all dependencies

