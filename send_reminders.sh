#!/bin/bash

# Variables
URL="${API_REMINDER_URL}"
ADMIN_API_KEY="${ADMIN_API_KEY}"

# Check if required environment variables are set
if [ -z "$ADMIN_API_KEY" ]; then
    echo "Error: ADMIN_API_KEY environment variable is not set"
    exit 1
fi

if [ -z "$API_REMINDER_URL" ]; then
    echo "Error: API_REMINDER_URL environment variable is not set"
    exit 1
fi

# Make the CURL request with x-api-key header
curl -X POST "$URL" \
  -H "x-api-key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json"