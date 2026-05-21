import numpy as np
from PIL import Image
from deepface import DeepFace
from sklearn.metrics.pairwise import cosine_similarity



def preprocess_image(image):
    img = Image.open(image).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    return img_array


def create_face_embedding(image_path):

    embeddings = DeepFace.represent(
    img_path=image_path,
    model_name='Facenet',
    detector_backend='opencv',
    enforce_detection=False
)

    face_embedding = np.array(embeddings[0]['embedding'])

    face_embedding = face_embedding / np.linalg.norm(face_embedding)

    return face_embedding


def verify_face(embedding1, embedding2):

    similarity = cosine_similarity(
        [embedding1],
        [embedding2]
    )[0][0]

    threshold = 0.48

    return similarity > threshold, similarity
