from flask import Blueprint, jsonify
import sqlite3
from utils.jwt_helper import token_required
from utils.config import DATABASE_NAME



admin = Blueprint('admin', __name__)

@admin.route('/dashboard/<string:username>', methods=["GET"])
@token_required
def dashboard(data, username):
    return jsonify({
        "message": f"Welcome to your dashboard, {username}"
    })

@admin.route('/users', methods=["GET"])
@token_required
def users(data):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id, username FROM users")
    
    users_list = cursor.fetchall()
    conn.close()
    
    return jsonify(users_list)

@admin.route('/notes', methods=["GET"])
@token_required
def show_notes(data):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, 'Note' as title, note FROM notes")
    notes_list = cursor.fetchall()
    conn.close()
    
    return jsonify(notes_list)

@admin.route('/delete_note/<int:note_id>', methods=['DELETE'])
@token_required
def delete_note(data, note_id):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM notes WHERE id=?", (note_id,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Note deleted successfully"})

@admin.route('/delete_user/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(data, user_id):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM users WHERE id=?", (user_id,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "User deleted successfully"})