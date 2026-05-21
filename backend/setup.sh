#!/bin/bash
echo "=========================================="
echo "Installing dependencies (CPU-only mode)..."
echo "=========================================="

# Upgrade pip
pip install --upgrade pip

# Install tensorflow-cpu WITHOUT dependencies first
pip install tensorflow-cpu==2.13.0 --no-deps

# Install tensorflow-cpu dependencies manually
pip install \
    absl-py==1.4.0 \
    astunparse==1.6.3 \
    flatbuffers==23.5.26 \
    gast==0.4.0 \
    google-pasta==0.2.0 \
    grpcio==1.59.0 \
    h5py==3.10.0 \
    keras==2.13.1 \
    libclang==16.0.6 \
    ml-dtypes==0.2.0 \
    opt-einsum==3.3.0 \
    packaging==23.2 \
    protobuf==4.24.4 \
    termcolor==2.3.0 \
    typing-extensions==4.8.0 \
    wrapt==1.15.0

# Install opencv
pip install opencv-python-headless==4.7.0.72

# Install other dependencies
pip install \
    Flask==2.3.3 \
    Flask-Bcrypt==1.0.1 \
    flask-cors==4.0.0 \
    gunicorn==21.2.0 \
    psycopg2-binary==2.9.9 \
    PyJWT==2.8.0 \
    python-dotenv==1.0.0 \
    numpy==1.23.5 \
    scikit-learn==1.2.2 \
    scipy==1.10.1 \
    pillow==9.5.0

# Install deepface last (it will use existing tensorflow-cpu)
pip install deepface==0.0.75

# Preload model
python preload_model.py

echo "=========================================="
echo "Setup complete! (CPU-only mode)"
echo "=========================================="