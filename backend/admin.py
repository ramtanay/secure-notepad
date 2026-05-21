from flask import Blueprint, jsonify, request
from utils.jwt_helper import token_required
from db import get_connection

admin = Blueprint('admin', __name__)

# =========================================
# HELPER FUNCTION TO CHECK ADMIN ROLE
# =========================================

def is_admin(data):
    """Check if the authenticated user has admin role"""
    return data.get('role') == 'admin'

# =========================================
# ADMIN DASHBOARD
# =========================================

@admin.route('/dashboard', methods=["GET"])
@token_required
def dashboard(data):
    # Check admin permission
    if not is_admin(data):
        return jsonify({
            "error": "Admin access required",
            "message": "You don't have permission to access this resource"
        }), 403
    
    # Get some statistics for the dashboard
    conn = get_connection()
    cursor = conn.cursor()
    
    # Get total users count
    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]
    
    # Get total notes count
    cursor.execute("SELECT COUNT(*) FROM notes")
    total_notes = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        "message": f"Welcome to admin dashboard, {data['username']}",
        "user_id": data['user_id'],
        "role": data['role'],
        "stats": {
            "total_users": total_users,
            "total_notes": total_notes
        }
    })

# =========================================
# SHOW ALL USERS
# =========================================

@admin.route('/users', methods=["GET"])
@token_required
def get_users(data):
    # Check admin permission
    if not is_admin(data):
        return jsonify({
            "error": "Admin access required",
            "message": "You don't have permission to access this resource"
        }), 403
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Get all users with their note counts
    cursor.execute("""
        SELECT u.id, u.username, COUNT(n.id) as note_count
        FROM users u
        LEFT JOIN notes n ON u.id = n.user_id
        GROUP BY u.id, u.username
        ORDER BY u.id
    """)
    
    users_list = cursor.fetchall()
    conn.close()
    
    # Convert to list of dictionaries for better JSON structure
    users_data = []
    for user in users_list:
        users_data.append({
            "id": user[0],
            "username": user[1],
            "note_count": user[2]
        })
    
    return jsonify({
        "users": users_data,
        "total": len(users_data)
    })

# =========================================
# GET SINGLE USER DETAILS
# =========================================

@admin.route('/users/<int:user_id>', methods=["GET"])
@token_required
def get_user(data, user_id):
    # Check admin permission
    if not is_admin(data):
        return jsonify({
            "error": "Admin access required",
            "message": "You don't have permission to access this resource"
        }), 403
    
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT u.id, u.username, COUNT(n.id) as note_count
        FROM users u
        LEFT JOIN notes n ON u.id = n.user_id
        WHERE u.id = %s
        GROUP BY u.id, u.username
    """, (user_id,))
    
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return jsonify({
            "error": "User not found",
            "message": f"User with ID {user_id} does not exist"
        }), 404
    
    return jsonify({
        "id": user[0],
        "username": user[1],
        "note_count": user[2]
    })

# =========================================
# SHOW ALL NOTES
# =========================================

@admin.route('/notes', methods=["GET"])
@token_required
def show_notes(data):
    # Check admin permission
    if not is_admin(data):
        return jsonify({
            "error": "Admin access required",
            "message": "You don't have permission to access this resource"
        }), 403
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    offset = (page - 1) * per_page
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Get total count
    cursor.execute("SELECT COUNT(*) FROM notes")
    total_notes = cursor.fetchone()[0]
    
    # Get paginated notes
    cursor.execute("""
        SELECT notes.id,
               users.id as user_id,
               users.username,
               notes.note,
               notes.created_at
        FROM notes
        JOIN users ON notes.user_id = users.id
        ORDER BY notes.id DESC
        LIMIT %s OFFSET %s
    """, (per_page, offset))
    
    notes_list = cursor.fetchall()
    conn.close()
    
    # Convert to list of dictionaries
    notes_data = []
    for note in notes_list:
        notes_data.append({
            "id": note[0],
            "user_id": note[1],
            "username": note[2],
            "note": note[3],
            "created_at": note[4] if len(note) > 4 else None
        })
    
    return jsonify({
        "notes": notes_data,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total_notes,
            "pages": (total_notes + per_page - 1) // per_page
        }
    })

# =========================================
# GET NOTES FOR A SPECIFIC USER
# =========================================

@admin.route('/users/<int:user_id>/notes', methods=["GET"])
@token_required
def get_user_notes(data, user_id):
    # Check admin permission
    if not is_admin(data):
        return jsonify({
            "error": "Admin access required",
            "message": "You don't have permission to access this resource"
        }), 403
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT username FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return jsonify({
            "error": "User not found",
            "message": f"User with ID {user_id} does not exist"
        }), 404
    
    # Get user's notes
    cursor.execute("""
        SELECT id, note, created_at
        FROM notes
        WHERE user_id = %s
        ORDER BY id DESC
    """, (user_id,))
    
    notes_list = cursor.fetchall()
    conn.close()
    
    notes_data = []
    for note in notes_list:
        notes_data.append({
            "id": note[0],
            "note": note[1],
            "created_at": note[2] if len(note) > 2 else None
        })
    
    return jsonify({
        "user_id": user_id,
        "username": user[0],
        "notes": notes_data,
        "total_notes": len(notes_data)
    })

# =========================================
# DELETE NOTE (with additional validation)
# =========================================

@admin.route('/delete_note/<int:note_id>', methods=['DELETE'])
@token_required
def delete_note(data, note_id):
    # Check admin permission
    if not is_admin(data):
        return jsonify({
            "error": "Admin access required",
            "message": "You don't have permission to access this resource"
        }), 403
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # First check if note exists and get its details
    cursor.execute("""
        SELECT notes.id, users.username 
        FROM notes 
        JOIN users ON notes.user_id = users.id 
        WHERE notes.id = %s
    """, (note_id,))
    
    note = cursor.fetchone()
    
    if not note:
        conn.close()
        return jsonify({
            "error": "Note not found",
            "message": f"Note with ID {note_id} does not exist"
        }), 404
    
    # Delete the note
    cursor.execute("DELETE FROM notes WHERE id = %s", (note_id,))
    conn.commit()
    conn.close()
    
    return jsonify({
        "message": "Note deleted successfully",
        "deleted_note": {
            "id": note_id,
            "username": note[1]
        }
    })

# =========================================
# DELETE USER (with cascade deletion of notes)
# =========================================

@admin.route('/delete_user/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(data, user_id):
    # Check admin permission
    if not is_admin(data):
        return jsonify({
            "error": "Admin access required",
            "message": "You don't have permission to access this resource"
        }), 403
    
    # Prevent admin from deleting themselves
    if user_id == data['user_id']:
        return jsonify({
            "error": "Cannot delete self",
            "message": "Admin cannot delete their own account"
        }), 400
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if user exists and get their details
    cursor.execute("SELECT id, username FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return jsonify({
            "error": "User not found",
            "message": f"User with ID {user_id} does not exist"
        }), 404
    
    # Get count of user's notes before deletion
    cursor.execute("SELECT COUNT(*) FROM notes WHERE user_id = %s", (user_id,))
    notes_count = cursor.fetchone()[0]
    
    # Delete user (notes will be deleted automatically if foreign key has CASCADE)
    # If not, delete notes first
    cursor.execute("DELETE FROM notes WHERE user_id = %s", (user_id,))
    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        "message": "User deleted successfully",
        "deleted_user": {
            "id": user[0],
            "username": user[1],
            "notes_deleted": notes_count
        }
    })

# =========================================
# GET SYSTEM STATISTICS
# =========================================

@admin.route('/stats', methods=["GET"])
@token_required
def get_stats(data):
    # Check admin permission
    if not is_admin(data):
        return jsonify({
            "error": "Admin access required",
            "message": "You don't have permission to access this resource"
        }), 403
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Get various statistics
    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM notes")
    total_notes = cursor.fetchone()[0]
    
    cursor.execute("""
        SELECT u.username, COUNT(n.id) as note_count
        FROM users u
        LEFT JOIN notes n ON u.id = n.user_id
        GROUP BY u.id, u.username
        ORDER BY note_count DESC
        LIMIT 5
    """)
    top_users = cursor.fetchall()
    
    conn.close()
    
    top_users_data = []
    for user in top_users:
        top_users_data.append({
            "username": user[0],
            "note_count": user[1]
        })
    
    return jsonify({
        "statistics": {
            "total_users": total_users,
            "total_notes": total_notes,
            "average_notes_per_user": round(total_notes / total_users, 2) if total_users > 0 else 0
        },
        "top_users": top_users_data
    })