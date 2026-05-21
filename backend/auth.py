from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
import datetime
import jwt
import numpy as np
import os
import psycopg2

from utils.face import create_face_embedding, verify_face
from utils.config import SECRET_KEY
from db import get_connection
admin_username = os.getenv("ADMIN_USERNAME")
admin_password = os.getenv("ADMIN_PASSWORD")


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
        return jsonify({
            'message': 'Username and password are required.'
        }), 400

    if not image:
        return jsonify({
            'message': 'Image is required.'
        }), 400

    try:

        os.makedirs("temp", exist_ok=True)

        temp_path = f"temp/{image.filename}"

        image.save(temp_path)

        embedding_bytes = create_face_embedding(
            temp_path
        ).tobytes()

        os.remove(temp_path)

    except Exception as e:

        return jsonify({
            'message': 'Face processing failed.',
            'error': str(e)
        }), 400

    hashed_password = bcrypt.generate_password_hash(
        password
    ).decode('utf-8')

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO users
            (username, password, face_embedding)
            VALUES (%s, %s, %s)
            """,
            (
                username,
                hashed_password,
                embedding_bytes
            )
        )

        conn.commit()

    except psycopg2.IntegrityError:

        conn.rollback()

        conn.close()

        return jsonify({
            "message": "Username already exists."
        }), 400

    conn.close()

    return jsonify({
        'message': 'User created successfully.'
    }), 201


# =========================================
# PASSWORD LOGIN
# =========================================

@auth.route('/login', methods=["POST"])
def login():

    username = request.form.get('username')
    password = request.form.get("password")

    if not username or not password:

        return jsonify({
            'message': 'Username and password are required.'
        }), 400

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, password
        FROM users
        WHERE username = %s
        """,
        (username,)
    )

    user = cursor.fetchone()

    conn.close()

    # Admin Login

    if username == admin_username and password == admin_password:

        token = jwt.encode({

            'user_id': user[0] if user else None,
            'username': username,
            'role': 'admin',

            'exp': datetime.datetime.now(
                datetime.timezone.utc
            ) + datetime.timedelta(hours=1)

        }, SECRET_KEY, algorithm='HS256')

        return jsonify({
            'message': 'Admin login successful',
            'token': token
        }), 200

    # Normal User Login

    if user and bcrypt.check_password_hash(
        user[1],
        password
    ):

        token = jwt.encode({

            'user_id': user[0],
            'username': username,
            'role': 'user',

            'exp': datetime.datetime.now(
                datetime.timezone.utc
            ) + datetime.timedelta(hours=1)

        }, SECRET_KEY, algorithm='HS256')

        return jsonify({
            'message': 'Login successful',
            'token': token
        }), 200

    else:

        return jsonify({
            'message': 'Invalid credentials.'
        }), 401


# =========================================
# FACE LOGIN
# =========================================

@auth.route('/face_login', methods=['POST'])
def face_login():

    image = request.files.get('image')
    username = request.form.get('username')

    if not image or not username:

        return jsonify({
            'message': 'Image and username are required.'
        }), 400

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT face_embedding, id
        FROM users
        WHERE username = %s
        """,
        (username,)
    )

    result = cursor.fetchone()

    conn.close()

    if not result:

        return jsonify({
            'message': 'User not found.'
        }), 404

    try:

        print("STEP 1")

        os.makedirs("temp", exist_ok=True)

        temp_path = "temp/temp_image.jpg"

        image.save(temp_path)

        print("STEP 2")

        stored_embedding = np.frombuffer(
            result[0],
            dtype=np.float64
        )

        print("STEP 3")

        input_embedding = create_face_embedding(
            temp_path
        )

        print("STEP 4")

        is_match, similarity = verify_face(
            input_embedding,
            stored_embedding
        )

        print("STEP 5")

        os.remove(temp_path)

    except Exception as e:

        print("ERROR:", str(e))
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


# =========================================
# LOGOUT
# =========================================

@auth.route('/logout', methods=['POST'])
def logout():

    return jsonify({
        'message': 'Logout successful.'
    }), 200