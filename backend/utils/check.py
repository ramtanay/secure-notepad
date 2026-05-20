from backend.utils.face import create_face_embedding, verify_face
from flask import Flask, request, jsonify
import os

check = Flask(__name__)

UPLOAD_FOLDER = "temp"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@check.route('/check_face', methods=['POST'])
def check_face():

    print("CONTENT TYPE:", request.content_type)
    print("FORM:", request.form)
    print("FILES:", request.files)
    print("RAW DATA:", request.data)

    image1 = request.files.get('image1')
    image2 = request.files.get('image2')

    if image1 is None or image2 is None:
        return jsonify({'message': 'Both images are required.'}), 400

    path1 = os.path.join(UPLOAD_FOLDER, image1.filename)
    path2 = os.path.join(UPLOAD_FOLDER, image2.filename)

    image1.save(path1)
    image2.save(path2)

    embedding1 = create_face_embedding(path1)
    embedding2 = create_face_embedding(path2)

    is_match, similarity = verify_face(embedding1, embedding2)

    return jsonify({
    'match': bool(is_match),
    'similarity': float(similarity)
    }), 200


if __name__ == '__main__':
    check.run(debug=True)