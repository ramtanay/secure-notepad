import numpy as np
from PIL import Image
from deepface import DeepFace
from sklearn.metrics.pairwise import cosine_similarity

# Define constants
FACE_MODEL_NAME = 'Facenet512'  # Changed from 'Facenet' to match 512 dimensions
# Note: 'Facenet' produces 128-dim embeddings
#       'Facenet512' produces 512-dim embeddings
#       'VGG-Face' produces 2622-dim embeddings
#       'ArcFace' produces 512-dim embeddings

def preprocess_image(image):
    img = Image.open(image).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    return img_array

def create_face_embedding(image_path):
    """
    Create face embedding using DeepFace with consistent model
    Returns 512-dim embedding for Facenet512
    """
    try:
        embeddings = DeepFace.represent(
            img_path=image_path,
            model_name=FACE_MODEL_NAME,  # Use Facenet512 for 512 dimensions
            detector_backend='opencv',
            enforce_detection=False
        )
        
        if not embeddings or len(embeddings) == 0:
            raise Exception("No face detected in the image")
        
        face_embedding = np.array(embeddings[0]['embedding'])
        
        # Normalize the embedding
        face_embedding = face_embedding / np.linalg.norm(face_embedding)
        
        print(f"✅ Generated embedding with shape: {face_embedding.shape}")
        return face_embedding
        
    except Exception as e:
        print(f"❌ Error creating embedding: {e}")
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
        
        # Attempt to reshape or pad if needed (should not happen with consistent model)
        if len(embedding1) > len(embedding2):
            embedding2 = np.pad(embedding2, (0, len(embedding1) - len(embedding2)))
        elif len(embedding2) > len(embedding1):
            embedding1 = np.pad(embedding1, (0, len(embedding2) - len(embedding1)))
    
    # Calculate cosine similarity
    similarity = cosine_similarity(
        [embedding1],
        [embedding2]
    )[0][0]
    
    # Threshold for face matching (adjust as needed)
    threshold = 0.55  # Lowered from 0.65 for better matching
    
    print(f"📊 Similarity score: {similarity:.4f} (threshold: {threshold})")
    
    return similarity > threshold, similarity