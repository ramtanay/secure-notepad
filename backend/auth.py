from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
import datetime
import jwt
import numpy as np
import os
import psycopg2

from utils.face import create_face_embedding, verify_face
from utils.config import SECRET_KEY, ADMIN_USERNAME, ADMIN_PASSWORD
from db import get_connection

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.path.join(BASE_DIR, "temp")
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}


os.makedirs(TEMP_DIR, exist_ok=True)



auth = Blueprint('auth', __name__)
bcrypt = Bcrypt()


# =========================================
# SIGNUP
# =========================================

@auth.route('/signup', methods=['POST'])
def signup():
    username = request.form.get('username')
    password = request.form.get('password')
    image = request.files.get('image')

    if not username or not password:
        return jsonify({'message': 'Username and password are required.'}), 400

    if not image:
        return jsonify({'message': 'Image is required.'}), 400

    temp_path = None
    
    filename = image.filename.lower()

    if not filename.endswith(tuple(ALLOWED_EXTENSIONS)):
        return jsonify({
            "message": "Invalid image format."
        }), 400
    
    try:
        # Save temp image
        os.makedirs(TEMP_DIR, exist_ok=True)
        temp_path = os.path.join(TEMP_DIR, f"{username}_{image.filename}")
        image.save(temp_path)
        
        # Create face embedding
        embedding = create_face_embedding(temp_path)
        embedding_bytes = embedding.astype(np.float32).tobytes()
        
        # Hash password
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        
        # Save to database
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO users (username, password, face_embedding) VALUES (%s, %s, %s)",
            (username, hashed_password, embedding_bytes)
        )
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'User created successfully.'}), 201
        
    except psycopg2.IntegrityError:
        return jsonify({"message": "Username already exists."}), 400
        
    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({'message': 'Face processing failed.', 'error': str(e)}), 400
        
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            print(f"🗑 Deleted temp file: {temp_path}")


# =========================================
# PASSWORD LOGIN
# =========================================

@auth.route('/login', methods=["POST"])
def login():
    username = request.form.get('username')
    password = request.form.get("password")

    if not username or not password:
        return jsonify({'message': 'Username and password are required.'}), 400

    # Admin login
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        token = jwt.encode({
            'user_id': 0,
            'username': username,
            'role': 'admin',
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
        }, SECRET_KEY, algorithm='HS256')
        return jsonify({'message': 'Admin login successful', 'token': token}), 200

    # User login
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, password FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    conn.close()

    if user and bcrypt.check_password_hash(user[1], password):
        token = jwt.encode({
            'user_id': user[0],
            'username': username,
            'role': 'user',
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
        }, SECRET_KEY, algorithm='HS256')
        return jsonify({'message': 'Login successful', 'token': token}), 200
    else:
        return jsonify({'message': 'Invalid credentials.'}), 401


# =========================================
# FACE LOGIN
# =========================================

@auth.route('/face_login', methods=['POST'])
def face_login():
    image = request.files.get('image')
    username = request.form.get('username')

    if not image or not username:
        return jsonify({'message': 'Image and username are required.'}), 400

    temp_path = None

    filename = image.filename.lower()

    if not filename.endswith(tuple(ALLOWED_EXTENSIONS)):
        return jsonify({
            "message": "Invalid image format."
        }), 400
    
    try:
        # Get stored embedding from database
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT face_embedding, id FROM users WHERE username = %s",
            (username,)
        )
        result = cursor.fetchone()
        conn.close()

        if not result:
            return jsonify({'message': 'User not found.'}), 404

        # Save temp image
        os.makedirs(TEMP_DIR, exist_ok=True)
        temp_path = os.path.join(TEMP_DIR, f"face_login_{username}.jpg")
        image.save(temp_path)
        
        # Get stored embedding
        stored_embedding = np.frombuffer(result[0], dtype=np.float32)
        
        # Create embedding from new image
        input_embedding = create_face_embedding(temp_path)
        
        # Verify face match
        is_match, similarity = verify_face(input_embedding, stored_embedding)
        
        if not is_match:
            return jsonify({
                'message': 'Face verification failed.',
                'similarity': float(similarity)
            }), 401

        # Create token
        token = jwt.encode({
            "user_id": result[1],
            "username": username,
            "role": "user",
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
        }, SECRET_KEY, algorithm='HS256')

        return jsonify({
            'message': 'Face login successful.',
            'similarity': float(similarity),
            'token': token
        }), 200
        
    except Exception as e:
        print(f"Face login error: {e}")
        return jsonify({'message': 'Face processing failed.', 'error': str(e)}), 400
        
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            print(f"🗑 Deleted temp file: {temp_path}")


# =========================================
# LOGOUT
# =========================================

@auth.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logout successful.'}), 200