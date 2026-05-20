from flask import Blueprint, request, jsonify
import sqlite3
from flask_bcrypt import Bcrypt
import datetime
import jwt
from utils.face import create_face_embedding,verify_face
import numpy as np
from utils.config import DATABASE_NAME, SECRET_KEY



auth = Blueprint('auth',__name__)

bcrypt = Bcrypt()

@auth.route('/signup', methods=['POST'])
def signup():

    username = request.form.get('username')
    password = request.form.get('password')

    image = request.files.get('image')
    if not username or not password:
        return jsonify({'message': 'Username and password are required.'}), 400
    if not image:
        return jsonify({'message': 'Image is required.'}), 400
    try:

        import os

        # create temp folder
        os.makedirs("temp", exist_ok=True)

        # save uploaded image temporarily
        temp_path = f"temp/{image.filename}"

        image.save(temp_path)

        # create embedding
        embedding_bytes = create_face_embedding(
            temp_path
        ).tobytes()

        # remove temp image
        os.remove(temp_path)

    except Exception as e:

        return jsonify({
            'message': 'Face processing failed.',
            'error': str(e)
        }), 400
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (username, password, face_embedding) VALUES (?, ?, ?)",
            (username, hashed_password, embedding_bytes)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({
            "message": "Username already exists."
        }), 400
    conn.close()
    return jsonify({'message': 'User created successfully.'}),201


@auth.route('/login',methods=["POST"])
def login():

    username = request.form.get('username')
    password = request.form.get("password")

    if not username or not password:
        return jsonify({'message': 'Username and password are required.'}), 400
    
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id, password FROM users WHERE username = ?",(username,))
    user = cursor.fetchone()
    conn.close()
    
    if username == "admin" and password == "admin123":

        token = jwt.encode({
            'user_id':user[0] if user else None,
            'username': username,
            'role': 'admin',
            'exp': datetime.datetime.now(datetime.timezone.utc)
                    + datetime.timedelta(hours=1)
        }, SECRET_KEY, algorithm='HS256')

        return jsonify({
            'message':'Admin login successful',
            'token': token
        }), 200

    if user and bcrypt.check_password_hash(user[1], password):
        token = jwt.encode({
            'user_id': user[0] if user else None,
            'username': username,
            'role': 'user',
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
        }, SECRET_KEY, algorithm='HS256')
        return jsonify({'token': token})
    else:
        return jsonify({'message': 'Invalid credentials.'}), 401
    

@auth.route('/face_login', methods=['POST'])
def face_login():
    image = request.files.get('image')
    username = request.form.get('username')

    if not image or not username:
        return jsonify({
            'message': 'Image and username are required.'
        }), 400

    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT face_embedding, id FROM users WHERE username = ?",
        (username,)
    )

    result = cursor.fetchone()

    conn.close()

    if not result:
        return jsonify({
            'message': 'User not found.'
        }), 404

    try:

        import os

        # create temp folder if not exists
        os.makedirs("temp", exist_ok=True)

        # save uploaded image temporarily
        temp_path = f"temp/{image.filename}"

        image.save(temp_path)

        # convert stored bytes back to numpy array
        stored_embedding = np.frombuffer(
            result[0],
            dtype=np.float64
        )

        # create embedding from uploaded image
        input_embedding = create_face_embedding(
            temp_path
        )

        # compare embeddings
        is_match, similarity = verify_face(
            input_embedding,
            stored_embedding
        )

        # remove temp image
        os.remove(temp_path)

    except Exception as e:

        return jsonify({
            'message': 'Face processing failed.',
            'error': str(e)
        }), 400

    if not is_match:

        return jsonify({
            'message': 'Face verification failed.',
            'similarity': float(similarity)
        }), 401

    token = jwt.encode({

        "user_id": result[1],
        "username": username,
        "role": "user",

        "exp": datetime.datetime.now(
            datetime.timezone.utc
        ) + datetime.timedelta(hours=1)

    }, SECRET_KEY, algorithm='HS256')

    return jsonify({
        'message': 'Face login successful.',
        'similarity': float(similarity),
        'token': token
    }), 200

@auth.route('/logout',methods=['POST'])
def logout():
    return jsonify({'message': 'Logout successful.'}), 200