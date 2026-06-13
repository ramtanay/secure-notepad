import numpy as np
import os
import traceback



os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

SIMILARITY_THRESHOLD = 0.50


def create_face_embedding(image_path):
    try:
        # Lazy import to reduce startup memory usage
        from deepface import DeepFace

        result = DeepFace.represent(
            img_path=image_path,
            model_name="ArcFace",
            detector_backend="mtcnn",
            enforce_detection=True
        )

        embedding = np.asarray(
            result[0]["embedding"],
            dtype=np.float32
        )

        embedding = embedding / np.linalg.norm(embedding)

        return embedding

    except Exception as e:
        print("❌ Face embedding error:", e)
        traceback.print_exc()
        raise Exception(f"Face processing failed: {str(e)}")


def verify_face(embedding1, embedding2):
    embedding1 = np.asarray(embedding1, dtype=np.float32)
    embedding2 = np.asarray(embedding2, dtype=np.float32)

    similarity = cosine_similarity_np(
        embedding1,
        embedding2
    )

    similarity = float(similarity)

    print(f"🔥 Similarity Score: {similarity:.4f}")

    return similarity > SIMILARITY_THRESHOLD, similarity



def cosine_similarity_np(a, b):
    a = np.asarray(a, dtype=np.float32).flatten()
    b = np.asarray(b, dtype=np.float32).flatten()

    denominator = np.linalg.norm(a) * np.linalg.norm(b)

    if denominator == 0:
        return 0.0

    return np.dot(a, b) / denominator