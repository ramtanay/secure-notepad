#!/bin/bash
set -e
set -o pipefail

echo "=========================================="
echo "Installing dependencies with pinned versions..."
echo "=========================================="

# Upgrade pip
pip install --upgrade pip

echo "📦 Installing numpy..."
pip install numpy==1.23.5

echo "📦 Installing tensorflow 2.10.0 (lightweight version)..."
pip install tensorflow==2.10.0

echo "📦 Installing opencv..."
pip install opencv-python-headless==4.7.0.72

echo "📦 Installing deepface..."
pip install --no-deps deepface==0.0.75

echo "📦 Installing Flask and web frameworks..."
pip install Flask==2.3.3 Flask-Bcrypt==1.0.1 flask-cors==4.0.0

echo "📦 Installing server and database packages..."
pip install gunicorn==21.2.0 psycopg2-binary==2.9.9 PyJWT==2.8.0

echo "📦 Installing utilities..."
pip install python-dotenv==1.0.0 scikit-learn==1.2.2 scipy==1.10.1 pillow==9.5.0

echo "📦 Pre-loading face recognition model..."
python preload_model.py

echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="