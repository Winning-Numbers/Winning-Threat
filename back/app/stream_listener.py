# Install: pip install sseclient-py requests

import json
import requests
from sseclient import SSEClient

# Your API key
API_KEY = " 076c309793d34b8f990d81a93c9e7c95503392ce2e6900dea21a5eaa39837419 "
STREAM_URL = "https://95.217.75.14:8443/stream"
FLAG_URL = "https://95.217.75.14:8443/api/flag"

# Set up headers with API key
headers = {
    "X-API-Key": API_KEY
}

# Function to flag a transaction
def flag_transaction(trans_num, flag_value):
    """
    Flag a transaction as fraud (1) or legitimate (0)
    
    Args:
        trans_num: Transaction number from the stream
        flag_value: 0 for legitimate, 1 for fraud
    
    Returns:
        Response from the flag endpoint
    """
    payload = {
        "trans_num": trans_num,
        "flag_value": flag_value
    }
    response = requests.post(FLAG_URL, headers=headers, json=payload)
    return response.json()

# Connect to the stream
print("Connecting to stream...")
response = requests.get(STREAM_URL, headers=headers, stream=True)
client = SSEClient(response)

# Process incoming events
for event in client.events():
    if event.data:
        transaction = json.loads(event.data)
        print(f"Received transaction: {transaction.get('trans_num')}")

        # Available fields from the stream:
        # - ssn: Social Security Number
        # - cc_num: Credit Card Number
        # - first: First Name
        # - last: Last Name
        # - gender: Gender
        # - street: Street Address
        # - city: City
        # - state: State
        # - zip: ZIP Code
        # - lat: Latitude
        # - long: Longitude
        # - city_pop: City Population
        # - job: Job Title
        # - dob: Date of Birth
        # - acct_num: Account Number
        # - trans_num: Transaction Number (unique identifier)
        # - trans_date: Transaction Date
        # - trans_time: Transaction Time
        # - unix_time: Unix Timestamp
        # - category: Transaction Category
        # - amt: Transaction Amount
        # - merchant: Merchant Name
        # - merch_lat: Merchant Latitude
        # - merch_long: Merchant Longitude

        # Example: Extract relevant fields
        trans_num = transaction.get('trans_num')
        amount = float(transaction.get('amt', 0))
        category = transaction.get('category')
        merchant = transaction.get('merchant')
        
        print(f"Amount: ${amount}, Category: {category}, Merchant: {merchant}")

        # Your fraud detection logic here
        is_fraud = 0  # Default to legitimate
        
        # Simple example: Flag large transactions as potential fraud
        if amount > 150:
            is_fraud = 1
            print(f"⚠️  Flagging as FRAUD (amount > $150)")
        else:
            print(f"✓ Flagging as LEGITIMATE")

        # Submit the flag
        result = flag_transaction(trans_num, is_fraud)
        
        # Example response:
        # Success: {"success": true, "reason": "Response recorded successfully"}
        # Failure: {"success": false, "reason": "Transaction expired or not found"}
        
        print(f"Flag response: {result}")
        print("-" * 80)
