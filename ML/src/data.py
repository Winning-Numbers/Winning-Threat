import pandas as pd
from datetime import date

def load_data(file_path: str) -> pd.DataFrame:
    chunks = []
    for chunk in pd.read_csv(file_path, chunksize=100_000):
        chunks.append(chunk)
    return pd.concat(chunks, ignore_index=True)

def makeDistance(lat1, lon1, lat2, lon2):
    from math import radians, sin, cos, sqrt, atan2
    R = 6371.0  # Earth radius in kilometers

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    distance = R * c
    return distance

def preprocess_data(data: pd.DataFrame) -> pd.DataFrame:
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
        "merchant"
        ])
    
    # Calculate age from date of birth
    x['dob'] = pd.to_datetime(x['dob'])
    today = pd.to_datetime(date.today())
    x['age'] = (today - x['dob']).dt.days // 365
    x = x.drop(columns=['dob'])
    
    #Convert lat and log into distance
    x['distance'] = makeDistance(
        x['lat'], x['long'], x['merch_lat'], x['merch_long']
    )
    x = x.drop(columns=['lat', 'long', 'merch_lat', 'merch_long'])
    
    # One-hot encoding for state columns
    
    x = pd.get_dummies(x, columns=['state', 'merch_state'], drop_first=True)
    
    
    y = data["is_fraud"].astype('int64')

    return x, y