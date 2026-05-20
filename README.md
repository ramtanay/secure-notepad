<div align="center">

# 🔐 Secure-Notepad

### 🚀 Smart Secure Notepad with AI Face Authentication

<img src="https://img.shields.io/badge/Flask-Backend-black?style=for-the-badge&logo=flask">
<img src="https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react">
<img src="https://img.shields.io/badge/DeepFace-AI-green?style=for-the-badge">
<img src="https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge">
<img src="https://img.shields.io/badge/SQLite-Database-lightgrey?style=for-the-badge&logo=sqlite">

---

### 🧠 AI-Powered Biometric Authentication + Secure Notes Management

</div>

---

# ✨ Features

✅ User Signup & Login  
✅ JWT Authentication  
✅ AI Face Recognition Login  
✅ DeepFace Embeddings  
✅ Webcam Capture Support  
✅ Protected Routes  
✅ Secure Password Hashing  
✅ Personal Notes Dashboard  
✅ Search / Edit / Delete Notes  
✅ React + Flask Full Stack Architecture  
✅ Responsive UI  

---

# 🏗️ Tech Stack

## 🎨 Frontend
- React.js
- Vite
- Axios
- CSS3

## ⚙️ Backend
- Flask
- Flask-CORS
- Flask-Bcrypt
- PyJWT
- SQLite3

## 🤖 AI / ML
- DeepFace
- FaceNet512
- NumPy
- Pillow

---

# 🧠 How Face Authentication Works

```text
User Image
    ↓
DeepFace Embedding Generation
    ↓
Vector Embedding Storage
    ↓
Embedding Comparison
    ↓
Distance Threshold Verification
    ↓
Authenticated Login
```

---

# 📂 Project Structure

```bash
NoteVault-AI/
│
├── backend/
│   ├── app.py
│   ├── auth.py
│   ├── notes.py
│   ├── admin.py
│   ├── database.py
│   └── utils/
│       ├── face.py
│       ├── jwt_helper.py
│       └── config.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚡ Installation

## 🔹 Clone Repository

```bash
git clone https://github.com/ramtanay/secure-notepad.git
cd secure-notepad
```

---

# 🔹 Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

---

# 🔹 Create `.env`

```env
SECRET_KEY=your_secret_key
DATABASE_NAME=database.db
```

---

# 🔹 Run Backend

```bash
python app.py
```

Backend runs on:

```text
http://localhost:5000
```

---

# 🔹 Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🔐 API Endpoints

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register user |
| POST | `/auth/login` | Password login |
| POST | `/auth/face_login` | Face authentication |

---

## Notes

| Method | Endpoint |
|---|---|
| GET | `/note/view_all` |
| POST | `/note/add` |
| PUT | `/note/update/<id>` |
| DELETE | `/note/delete/<id>` |
| GET | `/note/search/<query>` |

---

# 🚀 Future Improvements

- 🌙 Dark Mode
- ☁️ Cloud Deployment
- 📱 Mobile Responsive Design
- 🧠 Liveness Detection
- 🔔 Notifications
- 📂 File Attachments
- 🗑️ Trash Recovery
- 🔍 Semantic Search

---

# 🔥 Learning Highlights

This project helped me learn:

- Full Stack Development
- REST APIs
- JWT Authentication
- AI Face Embeddings
- Webcam Integration
- Protected Routes
- React State Management
- Flask Backend Architecture
- Database Design
- Vector Similarity Concepts

---

# 👨‍💻 Author

### Ramtanay Chakraborty

🎓 B.Tech CSE Student  
🤖 AI / ML Enthusiast  
💻 Full Stack Developer  

---

<div align="center">

## ⭐ If you like this project, give it a star!

</div>
