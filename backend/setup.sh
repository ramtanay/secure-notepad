#!/bin/bash

set -e

echo "=========================================="
echo "Installing dependencies..."
echo "=========================================="

# Upgrade pip
pip install --upgrade pip

# Install all requirements
pip install -r requirements.txt

echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="