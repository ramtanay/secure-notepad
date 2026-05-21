import numpy as np
from PIL import Image
from deepface import DeepFace
from sklearn.metrics.pairwise import cosine_similarity
import os

# Suppress TensorFlow warnings in production
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# IMPORTANT: Use 'Facenet' (128-dim) instead of 'Facenet512' for free tier
# 'Facenet' uses ~200MB less RAM and is faster
FACE_MODEL_NAME = 'SFace'  # Changed from 'Facenet512'

def preprocess_image(image):
    img = Image.open(image).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    return img_array

def create_face_embedding(image_path):
    """
    Create face embedding using DeepFace with consistent model
    Returns 128-dim embedding for Facenet (lighter than Facenet512)
    """
    try:
        embeddings = DeepFace.represent(
            img_path=image_path,
            model_name=FACE_MODEL_NAME,
            detector_backend='opencv',  # Changed from 'retinaface' (lighter)
            enforce_detection=False
        )
        
        if not embeddings or len(embeddings) == 0:
            raise Exception("No face detected in the image")
        
        face_embedding = np.array(embeddings[0]['embedding'])
        
        # Normalize the embedding
        face_embedding = face_embedding / np.linalg.norm(face_embedding)
        
        return face_embedding
        
    except Exception as e:
        print(f"Error creating embedding: {e}")
        raise

def verify_face(embedding1, embedding2):
    """
    Verify if two face embeddings match
    """
    # Ensure both embeddings are numpy arrays
    embedding1 = np.array(embedding1)
    embedding2 = np.array(embedding2)
    
    # Check dimensions
    if embedding1.shape != embedding2.shape:
        print(f"⚠️ Dimension mismatch: embedding1={embedding1.shape}, embedding2={embedding2.shape}")
        return False, 0.0
    
    # Calculate cosine similarity
    similarity = cosine_similarity(
        [embedding1],
        [embedding2]
    )[0][0]
    
    # Threshold for face matching (adjust as needed)
    threshold = 0.55
    
    return similarity > threshold, similarity