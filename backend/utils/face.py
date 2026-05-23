import numpy as np
from deepface import DeepFace
from sklearn.metrics.pairwise import cosine_similarity
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

SIMILARITY_THRESHOLD = 0.50


def create_face_embedding(image_path):

    try:

        result = DeepFace.represent(
            img_path=image_path,
            model_name="ArcFace",
            detector_backend="mtcnn",
            enforce_detection=True
        )

        embedding = result[0]["embedding"]

        embedding = np.asarray(embedding, dtype=np.float32)

        # Normalize embedding
        embedding = embedding / np.linalg.norm(embedding)

        return embedding

    except Exception as e:
        print("❌ Face embedding error:", e)
        raise Exception(f"Face processing failed: {str(e)}")


def verify_face(embedding1, embedding2):

    embedding1 = np.asarray(embedding1, dtype=np.float32)
    embedding2 = np.asarray(embedding2, dtype=np.float32)

    similarity = cosine_similarity(
        embedding1.reshape(1, -1),
        embedding2.reshape(1, -1)
    )[0][0]

    similarity = float(similarity)

    print(f"🔥 Similarity Score: {similarity:.4f}")

    return similarity > SIMILARITY_THRESHOLD, similarity