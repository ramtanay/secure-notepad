# preload_model.py
import os
import sys

print("=" * 50)
print("Pre-loading Face Recognition Models...")
print("=" * 50)

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

try:
    import tensorflow as tf
    print(f"✅ TensorFlow version: {tf.__version__}")
    
    from deepface import DeepFace
    
    print("\n📦 Loading FaceNet model...")
    DeepFace.build_model(model_name='Facenet')
    print("✅ FaceNet model loaded successfully!")
    
    print("\n" + "=" * 50)
    print("✅ Model pre-loading completed!")
    print("=" * 50)
    
except Exception as e:
    print(f"\n⚠️ Warning: Could not pre-load model: {e}")
    sys.exit(0)