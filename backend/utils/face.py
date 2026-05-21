import face_recognition
import numpy as np
import cv2
import os

# Suppress warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

def create_face_embedding(image_path):
    """
    Create face embedding using face_recognition library
    Returns 128-dim embedding (compatible with Dlib/Facenet)
    """
    try:
        # Load image
        image = face_recognition.load_image_file(image_path)
        
        # Get face encodings (128-dim vectors)
        embeddings = face_recognition.face_encodings(image)
        
        if not embeddings or len(embeddings) == 0:
            raise Exception("No face detected in the image")
        
        # Use the first face detected
        face_embedding = np.array(embeddings[0])
        
        # Normalize the embedding
        face_embedding = face_embedding / np.linalg.norm(face_embedding)
        
        print(f"✅ Face detected - Embedding dimension: {len(face_embedding)}")
        return face_embedding
        
    except Exception as e:
        print(f"Error creating embedding: {e}")
        raise

def verify_face(embedding1, embedding2):
    """
    Verify if two face embeddings match using Euclidean distance
    face_recognition uses Euclidean distance with threshold 0.6
    """
    embedding1 = np.array(embedding1)
    embedding2 = np.array(embedding2)
    
    # Check dimensions
    if embedding1.shape != embedding2.shape:
        print(f"⚠️ Dimension mismatch: {embedding1.shape} vs {embedding2.shape}")
        return False, 0.0
    
    # Calculate Euclidean distance (lower = more similar)
    distance = np.linalg.norm(embedding1 - embedding2)
    
    # Convert distance to similarity score (0-1 range)
    similarity = max(0, 1 - distance / 2)
    
    # Standard threshold for face_recognition (0.6 is default)
    # Lower threshold = stricter matching
    threshold = 0.6
    
    is_match = distance < threshold
    
    print(f"📊 Distance: {distance:.4f}, Similarity: {similarity:.4f}, Match: {is_match}")
    
    return is_match, similarity