#!/bin/bash

EXPECTED_STATUS=200

HTTP_STATUS=$(wget --spider -S "$DOMAIN_AND_PORT/health" 2>&1 | grep "HTTP/" | awk '{print $2}')

if [ "$HTTP_STATUS" -eq "$EXPECTED_STATUS" ]; then
    echo "✅ Health check passed for $DOMAIN_AND_PORT/health (Status: $HTTP_STATUS)"
    exit 0
else
    echo "❌ Health check failed for $DOMAIN_AND_PORT/health (Status: $HTTP_STATUS)"
    exit 1
fi
