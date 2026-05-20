from flask import Blueprint, jsonify

from utils.jwt_helper import token_required
from db import get_connection


admin = Blueprint('admin', __name__)


# =========================================
# ADMIN DASHBOARD
# =========================================

@admin.route('/dashboard/<string:username>', methods=["GET"])
@token_required
def dashboard(data, username):

    return jsonify({
        "message": f"Welcome to your dashboard, {username}"
    })


# =========================================
# SHOW ALL USERS
# =========================================

@admin.route('/users', methods=["GET"])
@token_required
def users(data):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, username
        FROM users
    """)

    users_list = cursor.fetchall()

    conn.close()

    return jsonify(users_list)


# =========================================
# SHOW ALL NOTES
# =========================================

@admin.route('/notes', methods=["GET"])
@token_required
def show_notes(data):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""

        SELECT notes.id,
               users.username,
               notes.note

        FROM notes

        JOIN users
        ON notes.user_id = users.id

    """)

    notes_list = cursor.fetchall()

    conn.close()

    return jsonify(notes_list)


# =========================================
# DELETE NOTE
# =========================================

@admin.route('/delete_note/<int:note_id>', methods=['DELETE'])
@token_required
def delete_note(data, note_id):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM notes
        WHERE id = %s
        """,
        (note_id,)
    )

    conn.commit()

    conn.close()

    return jsonify({
        "message": "Note deleted successfully"
    })


# =========================================
# DELETE USER
# =========================================

@admin.route('/delete_user/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(data, user_id):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM users
        WHERE id = %s
        """,
        (user_id,)
    )

    conn.commit()

    conn.close()

    return jsonify({
        "message": "User deleted successfully"
    })