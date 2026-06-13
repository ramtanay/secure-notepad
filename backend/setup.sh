#!/bin/bash

set -e

echo "=========================================="
echo "Installing dependencies..."
echo "=========================================="

pip install --upgrade pip

pip install -r requirements.txt

# Remove GUI OpenCV only if it exists
pip uninstall -y opencv-python || true

echo "=========================================="
echo "Installed versions"
echo "=========================================="

pip freeze | grep opencv || true
pip freeze | grep numpy || true
pip freeze | grep pandas || true

echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="