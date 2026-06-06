from flask import Flask, jsonify
from auth import auth
from notes import notes
from admin import admin
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

# CORS Configuration
FRONTEND_URL = os.environ.get(
    "FRONTEND_URL",
    "https://secure-notepad-pearl.vercel.app"
)

ALLOWED_ORIGINS = [
    FRONTEND_URL.rstrip("/"),
    "http://localhost:5173",
    "http://localhost:3000",
]

CORS(
    app,
    resources={
        r"/*": {
            "origins": ALLOWED_ORIGINS,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
        }
    },
)

# Register blueprints
app.register_blueprint(auth, url_prefix="/auth")
app.register_blueprint(notes, url_prefix="/note")
app.register_blueprint(admin, url_prefix="/admin")


@app.route("/")
def home():
    return jsonify({
        "message": "Secure Notepad API",
        "status": "running",
        "version": "1.0.0"
    })


@app.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "environment": os.environ.get(
            "FLASK_ENV",
            "production"
        ),
        "port": os.environ.get("PORT", "10000")
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )