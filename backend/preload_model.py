# preload_model.py
import os
import sys

print("=" * 50)
print("Pre-loading Face Recognition Models...")
print("=" * 50)

# Suppress warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['OMP_NUM_THREADS'] = '1'

try:
    import tensorflow as tf
    print(f"✅ TensorFlow version: {tf.__version__}")
    
    # Import tf-keras to satisfy the requirement
    import tf_keras
    print("✅ tf-keras loaded successfully")
    
    from deepface import DeepFace
    
    # Use Facenet (lighter than Facenet512)
    print("\n📦 Loading FaceNet model...")
    DeepFace.build_model(model_name='Facenet')
    print("✅ FaceNet model loaded successfully!")
    
    print("\n" + "=" * 50)
    print("✅ Model pre-loading completed!")
    print("=" * 50)
    
except Exception as e:
    print(f"\n⚠️ Warning: {e}")
    sys.exit(0)