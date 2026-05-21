# preload_model.py
import os
import sys

print("=" * 50)
print("Pre-loading Face Recognition Models...")
print("=" * 50)

try:
    from deepface import DeepFace
    import tensorflow as tf
    
    # Suppress TensorFlow warnings
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    tf.get_logger().setLevel('ERROR')
    
    print("\n📦 Loading FaceNet512 model...")
    # This will download and cache the model during build
    DeepFace.build_model(model_name='Facenet512')
    print("✅ FaceNet512 model loaded and cached successfully!")
    
    # Test with a dummy image to ensure everything is working
    print("\n🧪 Testing model with a sample...")
    import numpy as np
    from PIL import Image
    
    # Create a dummy image (doesn't need to have a face)
    dummy_image = np.zeros((224, 224, 3), dtype=np.uint8)
    temp_path = "/tmp/test_face.jpg"
    Image.fromarray(dummy_image).save(temp_path)
    
    # Test embedding generation
    embedding = DeepFace.represent(
        img_path=temp_path,
        model_name='Facenet512',
        detector_backend='opencv',
        enforce_detection=False
    )
    
    os.remove(temp_path)
    print("✅ Model test successful!")
    print(f"   Embedding dimension: {len(embedding[0]['embedding'])}")
    
    print("\n" + "=" * 50)
    print("✅ Model pre-loading completed successfully!")
    print("=" * 50)
    
except Exception as e:
    print(f"\n❌ Error pre-loading model: {e}")
    print("The app will still work, but first request may be slow.")
    sys.exit(1)