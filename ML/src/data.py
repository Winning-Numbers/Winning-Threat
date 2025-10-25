import pandas as pd
import numpy as np
from datetime import date

def load_data(file_path: str) -> pd.DataFrame:
    chunks = []
    for chunk in pd.read_csv(
        file_path, 
        sep='|',
        chunksize=50_000,
        engine='c',
        low_memory=False,
        on_bad_lines='warn'
    ):
        chunks.append(chunk)
    return pd.concat(chunks, ignore_index=True)

def makeDistance(lat1, lon1, lat2, lon2):
    """
    Compute great-circle distance(s) between two points using the haversine formula.
    Accepts scalars, numpy arrays or pandas Series and returns a numpy array or scalar (kilometers).

    Parameters
    ----------
    lat1, lon1, lat2, lon2 : scalar or array-like
        Latitude and longitude in decimal degrees.

    Returns
    -------
    float or ndarray
        Distance in kilometers.
    """
    # convert inputs to numpy arrays (works with scalars, lists, pandas Series)
    lat1_a = np.asarray(lat1, dtype=float)
    lon1_a = np.asarray(lon1, dtype=float)
    lat2_a = np.asarray(lat2, dtype=float)
    lon2_a = np.asarray(lon2, dtype=float)

    # convert degrees to radians
    lat1_r = np.radians(lat1_a)
    lon1_r = np.radians(lon1_a)
    lat2_r = np.radians(lat2_a)
    lon2_r = np.radians(lon2_a)

    dlat = lat2_r - lat1_r
    dlon = lon2_r - lon1_r

    a = np.sin(dlat / 2.0) ** 2 + np.cos(lat1_r) * np.cos(lat2_r) * np.sin(dlon / 2.0) ** 2
    # guard against small negative numbers due to floating point
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(np.maximum(0.0, 1.0 - a)))

    R = 6371.0  # Earth radius in kilometers
    dist = R * c
    return dist
def preprocess_input_data(data: pd.DataFrame):
    """Preprocess input data for model inference.

    Parameters
    ----------
    data : pd.DataFrame
        Raw input dataframe containing transaction data without the is_fraud column.

    Returns
    -------
    x : pd.DataFrame
        Preprocessed feature matrix ready for model inference.
    """
    x = data.drop(columns=[
        "is_fraud",
        "transaction_id" , 
        "ssn" , 
        "first" , 
        "last" , 
        "gender" , 
        "cc_num" , 
        "street" , 
        "zip"  , 
        "acct_num" , 
        "trans_num" , 
        "city" ,
        "merchant",
        "state",
        "job",
        "category"
        ], errors='ignore')
    
    # Convert numeric columns from strings to float (for data from API/stream)
    numeric_cols = ['lat', 'long', 'merch_lat', 'merch_long', 'city_pop', 'amt']
    for col in numeric_cols:
        if col in x.columns:
            x[col] = pd.to_numeric(x[col], errors='coerce')
    
    # Calculate age from date of birth
    x['dob'] = pd.to_datetime(x['dob'])
    today = pd.to_datetime(date.today())
    x['age'] = (today - x['dob']).dt.days // 365
    x = x.drop(columns=['dob'])
    
    # Convert lat and log into distance
    x['distance'] = makeDistance(
         x['lat'], x['long'], x['merch_lat'], x['merch_long']
     )
    x = x.drop(columns=['lat', 'long', 'merch_lat', 'merch_long'])
    
    # Log the city population
    x['city_pop'] = np.log1p(x['city_pop']).astype('float32')
    
    # Make hour of the day
    x['trans_date'] = x['trans_date'].astype(str)
    x['trans_time'] = x['trans_time'].astype(str)
    
    x['trans_datetime'] = pd.to_datetime(
        x['trans_date'] + ' ' + x['trans_time'],
        errors='coerce'
    )
    x['hour'] = x['trans_datetime'].dt.hour
    x['day_of_week'] = x['trans_datetime'].dt.dayofweek
    x['is_weekend'] = (x['day_of_week'] >= 5).astype(int)

    x = x.drop(columns=['trans_date' , 'unix_time' , 'trans_time' , 'trans_datetime'])

    return x
def _fit_onehot_categories(data: pd.DataFrame, columns: list) -> dict:
    """Return a dict mapping column -> sorted list of categories including 'Other'.

    This is intended to be called on training data to capture known categories.
    """
    cats = {}
    for col in columns:
        if col not in data.columns:
            cats[col] = ['Other']
            continue
        s = data[col].fillna('Other').astype(str)
        unique = set(s.unique())
        unique.add('Other')
        cats[col] = sorted(unique)
    return cats


def _transform_onehot_with_other(df: pd.DataFrame, col: str, categories: list) -> pd.DataFrame:
    """Transform column `col` into one-hot DataFrame using provided categories.

    Any value not in `categories` is mapped to 'Other'. Ensures all expected
    dummy columns are present (zeros if missing).
    """
    if col not in df.columns:
        # return empty dummies with expected columns (all zeros)
        cols = [f"{col}_{c}" for c in categories]
        return pd.DataFrame(0, index=df.index, columns=cols)

    s = df[col].fillna('Other').astype(str)
    s = s.apply(lambda v: v if v in set(categories) else 'Other')
    dummies = pd.get_dummies(s, prefix=col)
    expected_cols = [f"{col}_{c}" for c in categories]
    for c in expected_cols:
        if c not in dummies.columns:
            dummies[c] = 0
    # reorder to deterministic column order
    return dummies[expected_cols]


def preprocess_data(data: pd.DataFrame, known_categories: dict = None):
    """Preprocess data for model training or inference.

    Parameters
    ----------
    data : pd.DataFrame
        Raw input dataframe containing columns like 'dob', 'lat', 'long', 'merch_lat', 'merch_long',
        'state', 'job', etc.
    known_categories : dict, optional
        If provided, a mapping {col: [categories...]} used for one-hot encoding.
        If None, categories will be inferred from `data` (training mode).

    Returns
    -------
    x : pd.DataFrame
        Preprocessed feature matrix.
    y : pd.Series
        Target series ('is_fraud').
    categories : dict
        The fitted categories mapping for one-hot columns (useful for test data).
    """

    x = data.drop(columns=[
        "is_fraud", 
        "transaction_id" , 
        "ssn" , 
        "first" , 
        "last" , 
        "gender" , 
        "cc_num" , 
        "street" , 
        "zip"  , 
        "acct_num" , 
        "trans_num" , 
        "city" ,
        "merchant",
        "state",
        "job",
        "category"
        ], errors='ignore')
    
    # Calculate age from date of birth
    x['dob'] = pd.to_datetime(x['dob'])
    today = pd.to_datetime(date.today())
    x['age'] = (today - x['dob']).dt.days // 365
    x = x.drop(columns=['dob'])
    
    # #Convert lat and log into distance
    x['distance'] = makeDistance(
         x['lat'], x['long'], x['merch_lat'], x['merch_long']
     )
    x = x.drop(columns=['lat', 'long', 'merch_lat', 'merch_long'])
    
    # # One-hot encoding for categorical columns with 'Other' fallback
    # onehot_cols = ['state' , 'job']
    # if known_categories is None:
    #     categories = _fit_onehot_categories(data, onehot_cols)
    # else:
    #     categories = known_categories

    # for col in onehot_cols:
    #     dummies = _transform_onehot_with_other(x, col, categories.get(col, ['Other']))
    #     # drop original column if present and concat dummies
    #     if col in x.columns:
    #         x = x.drop(columns=[col])
    #     x = pd.concat([x, dummies], axis=1)
    
    # Log the city population
    x['city_pop'] = np.log1p(x['city_pop']).astype('float32')
    
    # Make hour of the day
    x['trans_date'] = x['trans_date'].astype(str)
    x['trans_time'] = x['trans_time'].astype(str)
    
    x['trans_datetime'] = pd.to_datetime(
        x['trans_date'] + ' ' + x['trans_time'],
        errors='coerce'
    )
    x['hour'] = x['trans_datetime'].dt.hour
    x['day_of_week'] = x['trans_datetime'].dt.dayofweek
    x['is_weekend'] = (x['day_of_week'] >= 5).astype(int)

    x = x.drop(columns=['trans_date' , 'unix_time' , 'trans_time' , 'trans_datetime'])

    # IMPORTANT: Labels are inverted in the CSV! 
    # CSV has: 0=fraud, 1=legitimate
    # We need: 1=fraud, 0=legitimate
    y = 1 - data["is_fraud"].astype('int64')

    return x, y