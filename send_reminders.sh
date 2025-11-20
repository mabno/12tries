#!/bin/bash

# Variables
URL="https://api.example.com/endpoint"  # Replace with your API URL
ADMIN_API_KEY="${ADMIN_API_KEY}"                    # Get API key from environment variable

# Check if API_KEY environment variable is set
if [ -z "$ADMIN_API_KEY" ]; then
    echo "Error: API_KEY environment variable is not set"
    echo "Please set it using: export API_KEY='your-api-key-here'"
    exit 1
fi

# Make the CURL request with x-api-key header
curl -X POST "$URL" \
  -H "x-api-key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json"