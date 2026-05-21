import numpy as np
from deepface import DeepFace
from sklearn.metrics.pairwise import cosine_similarity
import os

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Use Facenet (128-dim, same as face_recognition)
FACE_MODEL_NAME = 'Facenet'

def create_face_embedding(image_path):
    """
    Create face embedding using DeepFace with Facenet
    Returns 128-dim embedding
    """
    try:
        embeddings = DeepFace.represent(
            img_path=image_path,
            model_name=FACE_MODEL_NAME,
            detector_backend='opencv',
            enforce_detection=False
        )
        
        if not embeddings or len(embeddings) == 0:
            raise Exception("No face detected in the image")
        
        face_embedding = np.array(embeddings[0]['embedding'])
        face_embedding = face_embedding / np.linalg.norm(face_embedding)
        
        return face_embedding
        
    except Exception as e:
        print(f"Error creating embedding: {e}")
        raise

def verify_face(embedding1, embedding2):
    embedding1 = np.array(embedding1)
    embedding2 = np.array(embedding2)
    
    if embedding1.shape != embedding2.shape:
        print(f"⚠️ Dimension mismatch")
        return False, 0.0
    
    similarity = cosine_similarity([embedding1], [embedding2])[0][0]
    threshold = 0.55
    
    return similarity > threshold, similarity