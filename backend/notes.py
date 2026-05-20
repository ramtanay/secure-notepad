from flask import Blueprint,request,jsonify
import sqlite3
from utils.jwt_helper import token_required
import os
from utils.config import DATABASE_NAME

notes = Blueprint('notes',__name__)

@notes.route('/add',methods=["POST"])
@token_required
def add_note(data):
    body = request.get_json()
    note = body["note"]
    user_id = data["user_id"]

    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO notes (note,user_id) VALUES (?, ?)''',(note,user_id))

    conn.commit()
    conn.close()

    return jsonify({
        "message":"Note added successfully.",
        "note":note
    })



@notes.route('/view_all',methods=["GET"])
@token_required
def view_notes(data):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    user_id = data["user_id"]
    cursor.execute("SELECT id, note FROM notes WHERE user_id = ?",(user_id,))
    results = cursor.fetchall()
    conn.close()

    return jsonify(results)


@notes.route('/view/<int:id>',methods=["GET"])
@token_required
def view(data, id):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    user_id = data["user_id"]

    cursor.execute("SELECT note FROM notes WHERE id = ? AND user_id = ?",(id,user_id))
    results = cursor.fetchone()
    conn.close()

    return jsonify(results)



@notes.route('/update/<int:id>',methods=["PUT"])
@token_required
def update_note(data, id):
    body = request.get_json()
    new_note = body["note"]
    user_id = data["user_id"]

    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute("UPDATE notes SET note = ? WHERE id = ? AND user_id = ?",(new_note,id,user_id))

    conn.commit()
    conn.close()

    return jsonify({
        "message":"Successfully updated note",
        "New_note": new_note
    })





@notes.route('/delete/<int:id>',methods=["DELETE"])
@token_required
def delete_note(data, id):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM notes WHERE id = ? AND user_id = ?",(id,data["user_id"]))

    conn.commit()
    conn.close()

    return jsonify({
        "message":"Note deleted successfully."
    })


@notes.route('/search/<string:q>',methods=["GET"])
@token_required
def search_note(data, q):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    user_id = data["user_id"]
    query = f"%{q}%"
    cursor.execute("SELECT note FROM notes WHERE note LIKE ? AND user_id = ?",(query,user_id))

    results = cursor.fetchall()
    conn.close()
    
    return jsonify(results)



@notes.route('/protected',methods=['GET'])
@token_required
def protected(data):
    return jsonify({
        "message" : "Access granted to protected route.",
        "user": data['username']})
    





