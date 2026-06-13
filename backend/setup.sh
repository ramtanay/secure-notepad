#!/bin/bash

set -e

echo "=========================================="
echo "Installing dependencies..."
echo "=========================================="

pip install --upgrade pip

pip install -r requirements.txt

echo "=========================================="
echo "Verifying OpenCV..."
echo "=========================================="

python -c "import cv2; print('OpenCV:', cv2.__version__)"

echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="