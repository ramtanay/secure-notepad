from functools import wraps
from flask import request, jsonify
import jwt
from utils.config import SECRET_KEY


def token_required(func):
    @wraps(func)

    def decorated(*args, **kwargs):

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"message" : "No token found."}), 401
        try :
            parts = auth_header.split(" ")
            if len(parts) != 2 or parts[0] != "Bearer":
                return jsonify({
                "message": "Invalid Authorization Header"
                }), 401
            token = parts[1]
            data = jwt.decode(token,SECRET_KEY,algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token Expired."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message":"Token is Invalid"}), 401
        return func(data ,*args,**kwargs)
    return decorated



        