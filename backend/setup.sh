#!/bin/bash

set -e

echo "=========================================="
echo "Installing dependencies..."
echo "=========================================="

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

echo "=========================================="
echo "Installing DeepFace (without dependencies)..."
echo "=========================================="

pip install deepface==0.0.95 --no-deps

echo "=========================================="
echo "Installed OpenCV packages:"
echo "=========================================="

pip freeze | grep opencv || true

echo "=========================================="
echo "Installed DeepFace package:"
echo "=========================================="

pip freeze | grep deepface || true

echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="