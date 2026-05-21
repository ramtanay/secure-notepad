from flask import Flask, jsonify
from auth import auth
from notes import notes
from admin import admin
from flask_cors import CORS
import os
import sys
import threading

app = Flask(__name__)

# Pre-load face recognition model on startup in background
def preload_face_model():
    """Pre-load the face recognition model to avoid first-request delay"""
    try:
        print("=" * 50)
        print("Initializing Face Recognition Model (background)...")
        from deepface import DeepFace
        DeepFace.build_model(model_name='Facenet512')
        print("✅ Face recognition model loaded successfully!")
        print("=" * 50)
    except Exception as e:
        print(f"⚠️ Warning: Could not pre-load model: {e}")
        print("Model will load on first request.")

# Start pre-loading in background thread (doesn't block startup)
thread = threading.Thread(target=preload_face_model)
thread.daemon = True
thread.start()

# CORS Configuration
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://secure-notepad-pearl.vercel.app")
ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:5173",  # Local development
    "http://localhost:3000",   # Alternative local port
]

# Remove trailing slash from frontend URL if present
ALLOWED_ORIGINS = [origin.rstrip('/') for origin in ALLOWED_ORIGINS]

CORS(app, resources={
    r"/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Register blueprints
app.register_blueprint(auth, url_prefix='/auth')
app.register_blueprint(notes, url_prefix='/note')
app.register_blueprint(admin, url_prefix='/admin')

@app.route('/')
def home():
    return jsonify({
        "message": "Secure Notepad API",
        "status": "running",
        "version": "1.0.0"
    })

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "environment": os.environ.get("FLASK_ENV", "production"),
        "port": os.environ.get("PORT", "10000")
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    # CRITICAL FIX: Render expects PORT to default to 10000
    port = int(os.environ.get("PORT", 10000))
    
    # Always use debug=False in production
    # Set FLASK_ENV=development only for local development
    debug = os.environ.get("FLASK_ENV", "production") == "development"
    
    app.run(
        host="0.0.0.0",  # Must bind to 0.0.0.0 for Render
        port=port,
        debug=debug
    )