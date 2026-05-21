from flask import Blueprint, request, jsonify
from utils.jwt_helper import token_required
from db import get_connection

notes = Blueprint('notes', __name__)

@notes.route('/add', methods=["POST"])
@token_required
def add_note(data):
    body = request.get_json()
    note = body.get("note", "")
    title = body.get("title", "Untitled")  # Get title from request
    user_id = data["user_id"]

    if not note:
        return jsonify({"message": "Note content is required"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''INSERT INTO notes (note, title, user_id) VALUES (%s, %s, %s)''',
        (note, title, user_id)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Note added successfully.",
        "note": note,
        "title": title
    })

@notes.route('/view_all', methods=["GET"])
@token_required
def view_notes(data):
    conn = get_connection()
    cursor = conn.cursor()
    user_id = data["user_id"]
    cursor.execute(
        "SELECT id, title, note FROM notes WHERE user_id = %s ORDER BY id DESC",
        (user_id,)
    )
    results = cursor.fetchall()
    conn.close()
    
    # Return as list of objects for better structure
    notes_list = [{"id": r[0], "title": r[1], "note": r[2]} for r in results]
    return jsonify(notes_list)

@notes.route('/view/<int:id>', methods=["GET"])
@token_required
def view(data, id):
    conn = get_connection()
    cursor = conn.cursor()
    user_id = data["user_id"]

    cursor.execute(
        "SELECT title, note FROM notes WHERE id = %s AND user_id = %s",
        (id, user_id)
    )
    results = cursor.fetchone()
    conn.close()

    if results:
        return jsonify({"title": results[0], "note": results[1]})
    return jsonify({"message": "Note not found"}), 404

@notes.route('/update/<int:id>', methods=["PUT"])
@token_required
def update_note(data, id):
    body = request.get_json()
    new_note = body.get("note", "")
    new_title = body.get("title", None)
    user_id = data["user_id"]

    conn = get_connection()
    cursor = conn.cursor()

    if new_title:
        # Update both title and note
        cursor.execute(
            "UPDATE notes SET note = %s, title = %s WHERE id = %s AND user_id = %s",
            (new_note, new_title, id, user_id)
        )
    else:
        # Update only note
        cursor.execute(
            "UPDATE notes SET note = %s WHERE id = %s AND user_id = %s",
            (new_note, id, user_id)
        )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Successfully updated note",
        "note": new_note,
        "title": new_title
    })

@notes.route('/delete/<int:id>', methods=["DELETE"])
@token_required
def delete_note(data, id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM notes WHERE id = %s AND user_id = %s",
        (id, data["user_id"])
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Note deleted successfully."})

@notes.route('/search/<string:q>', methods=["GET"])
@token_required
def search_note(data, q):
    conn = get_connection()
    cursor = conn.cursor()
    user_id = data["user_id"]
    query = f"%{q}%"
    cursor.execute(
        "SELECT id, title, note FROM notes WHERE (note LIKE %s OR title LIKE %s) AND user_id = %s",
        (query, query, user_id)
    )
    results = cursor.fetchall()
    conn.close()
    
    notes_list = [{"id": r[0], "title": r[1], "note": r[2]} for r in results]
    return jsonify(notes_list)

@notes.route('/protected', methods=['GET'])
@token_required
def protected(data):
    return jsonify({
        "message": "Access granted to protected route.",
        "user": data['username']
    })