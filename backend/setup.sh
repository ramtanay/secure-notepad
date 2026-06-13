#!/bin/bash

set -e

echo "=========================================="
echo "Installing dependencies..."
echo "=========================================="

pip install --upgrade pip

pip install -r requirements.txt

# Remove GUI OpenCV if DeepFace installed it
pip uninstall -y opencv-python || true

# Force headless OpenCV
pip install --force-reinstall opencv-python-headless==4.10.0.84

echo "=========================================="
echo "Installed OpenCV packages:"
echo "=========================================="

pip freeze | grep opencv || true

echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="