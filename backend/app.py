from flask import Flask
from auth import auth
from notes import notes
from admin import admin
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['https://secure-notepad-pearl.vercel.app']) # This will allow requests from any origin. In production, you should specify the allowed origins for better security.
app.register_blueprint(auth, url_prefix='/auth')  # gets all the api routes from auth.py and adds /auth before it. So /signup becomes /auth/signup
app.register_blueprint(notes,url_prefix='/note')
app.register_blueprint(admin,url_prefix='/admin')


@app.route('/')
def home():
    return "This is Home page."


import os

if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port
    )