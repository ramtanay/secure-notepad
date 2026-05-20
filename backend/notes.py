from flask import Blueprint,request,jsonify
from utils.jwt_helper import token_required
from db import get_connection

notes = Blueprint('notes',__name__)

@notes.route('/add',methods=["POST"])
@token_required
def add_note(data):
    body = request.get_json()
    note = body["note"]
    user_id = data["user_id"]

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO notes (note,user_id) VALUES (%s, %s)''',(note,user_id))

    conn.commit()
    conn.close()

    return jsonify({
        "message":"Note added successfully.",
        "note":note
    })



@notes.route('/view_all',methods=["GET"])
@token_required
def view_notes(data):
    conn = get_connection()
    cursor = conn.cursor()
    user_id = data["user_id"]
    cursor.execute("SELECT id, note FROM notes WHERE user_id = %s",(user_id,))
    results = cursor.fetchall()
    conn.close()

    return jsonify(results)


@notes.route('/view/<int:id>',methods=["GET"])
@token_required
def view(data, id):
    conn = get_connection()
    cursor = conn.cursor()
    user_id = data["user_id"]

    cursor.execute("SELECT note FROM notes WHERE id = %s AND user_id = %s",(id,user_id))
    results = cursor.fetchone()
    conn.close()

    return jsonify(results)



@notes.route('/update/<int:id>',methods=["PUT"])
@token_required
def update_note(data, id):
    body = request.get_json()
    new_note = body["note"]
    user_id = data["user_id"]

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE notes SET note = %s WHERE id = %s AND user_id = %s",(new_note,id,user_id))

    conn.commit()
    conn.close()

    return jsonify({
        "message":"Successfully updated note",
        "New_note": new_note
    })





@notes.route('/delete/<int:id>',methods=["DELETE"])
@token_required
def delete_note(data, id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM notes WHERE id = %s AND user_id = %s",(id,data["user_id"]))

    conn.commit()
    conn.close()

    return jsonify({
        "message":"Note deleted successfully."
    })


@notes.route('/search/<string:q>',methods=["GET"])
@token_required
def search_note(data, q):
    conn = get_connection()
    cursor = conn.cursor()
    user_id = data["user_id"]
    query = f"%{q}%"
    cursor.execute("SELECT note FROM notes WHERE note LIKE %s AND user_id = %s",(query,user_id))

    results = cursor.fetchall()
    conn.close()
    
    return jsonify(results)



@notes.route('/protected',methods=['GET'])
@token_required
def protected(data):
    return jsonify({
        "message" : "Access granted to protected route.",
        "user": data['username']})
    





