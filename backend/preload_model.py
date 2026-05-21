# preload_model.py
import os
import sys

print("=" * 50)
print("Pre-loading Face Recognition Models...")
print("=" * 50)

# Set memory optimization flags
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_FORCE_GPU_ALLOW_GROWTH'] = 'true'
os.environ['TF_GPU_ALLOCATOR'] = 'cuda_malloc_async'

try:
    # First, verify tensorflow is installed correctly
    import tensorflow as tf
    print(f"✅ TensorFlow version: {tf.__version__}")
    print(f"   TensorFlow CPU: {not tf.config.list_physical_devices('GPU')}")
    
    # Configure tensorflow for memory efficiency
    tf.config.threading.set_inter_op_parallelism_threads(2)
    tf.config.threading.set_intra_op_parallelism_threads(2)
    
    from deepface import DeepFace
    
    print("\n📦 Loading FaceNet512 model...")
    DeepFace.build_model(model_name='Facenet512')
    print("✅ FaceNet512 model loaded and cached successfully!")
    
    # Quick test
    print("\n🧪 Testing model...")
    import numpy as np
    from PIL import Image
    
    # Create dummy test image
    dummy_image = Image.new('RGB', (224, 224), color='black')
    temp_path = "/tmp/test_face.jpg"
    dummy_image.save(temp_path)
    
    embedding = DeepFace.represent(
        img_path=temp_path,
        model_name='Facenet512',
        detector_backend='skip',  # Skip detection for dummy image
        enforce_detection=False
    )
    
    os.remove(temp_path)
    print(f"✅ Model test successful! Embedding dimension: {len(embedding[0]['embedding'])}")
    
    print("\n" + "=" * 50)
    print("✅ Model pre-loading completed successfully!")
    print("=" * 50)
    
except Exception as e:
    print(f"\n⚠️ Warning: {e}")
    print("Model will load on first request.")
    # Don't exit with error - allow app to start anyway
    sys.exit(0)