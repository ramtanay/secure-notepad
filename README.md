# 🔐 Secure Notepad

<div align="center">

## 🛡️ AI-Powered Secure Notes Application

### ✨ Built with React • Flask • PostgreSQL • DeepFace ✨

<br/>

<img src="https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/Backend-Flask-000000?style=for-the-badge&logo=flask&logoColor=white" />
<img src="https://img.shields.io/badge/Database-PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Authentication-JWT-success?style=for-the-badge" />
<img src="https://img.shields.io/badge/AI-DeepFace-orange?style=for-the-badge" />
<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />

<br/>
<br/>

🚀 A modern full-stack secure notes platform featuring
🔐 JWT Authentication + 🤖 AI Face Recognition Login

<br/>

⭐ Secure • Smart • Responsive • AI-Powered ⭐

</div>

---

# 🌟 Overview

Secure Notepad is a modern full-stack web application that allows users to securely create and manage notes with advanced authentication features including optional AI-powered facial recognition login.

This project combines:

* ⚛️ Modern React Frontend
* 🐍 Flask Backend API
* 🐘 PostgreSQL Database
* 🤖 DeepFace Facial Recognition
* 🔐 JWT Authentication

to build a secure and intelligent note management system.

---

# ✨ Key Features

<div align="center">

| 🔐 Security      | 🤖 AI Features    | 📝 Notes        | 👨‍💻 Admin         |
| ---------------- | ----------------- | --------------- | ------------------- |
| JWT Auth         | Face Recognition  | Create Notes    | User Management     |
| Bcrypt Hashing   | Webcam Capture    | Edit Notes      | Analytics Dashboard |
| Protected Routes | Face Embeddings   | Delete Notes    | System Stats        |
| Role Access      | Cosine Similarity | Search & Filter | Delete Users        |

</div>

---

# 🔐 Authentication & Security

✅ JWT Authentication
✅ Password Hashing with Bcrypt
✅ Role-Based Access Control
✅ Protected API Routes
✅ Secure Session Management
✅ Temporary File Cleanup
✅ Image Validation

---

# 🤖 AI Face Recognition System

Secure Notepad uses **DeepFace** and **Cosine Similarity Matching** for biometric authentication.

### 🔄 Authentication Workflow

```text id="2m1hxp"
📷 User uploads/captures face image
                ↓
🧠 DeepFace generates facial embedding
                ↓
🗄️ Embedding stored securely in PostgreSQL
                ↓
📷 During login, new embedding is generated
                ↓
📊 Cosine similarity comparison performed
                ↓
✅ User authenticated if threshold matches
```

---

# 📝 Notes Management

✨ Create Notes
✨ Edit Existing Notes
✨ Delete Notes
✨ Search Notes
✨ Filter Notes
✨ Dynamic Note Titles
✨ Responsive Notes Grid

---

# 👨‍💻 Advanced Admin Dashboard

✅ View All Users
✅ View All Notes
✅ Delete Users & Notes
✅ Analytics Dashboard
✅ User Statistics
✅ Search & Filtering
✅ Security Metrics

---

# 🎨 Frontend Features

✅ Modern React UI
✅ Fully Responsive Design
✅ Toast Notification System
✅ Webcam Integration
✅ Dynamic Forms
✅ Loading States
✅ Error Handling
✅ Smooth User Experience

---

# ⚙️ Backend Features

✅ Flask REST API
✅ PostgreSQL Integration
✅ JWT Middleware
✅ Face Embedding Storage
✅ Secure File Handling
✅ Environment Variables Support
✅ Admin Authorization System

---

# 🛠️ Tech Stack

<div align="center">

| Category     | Technologies                        |
| ------------ | ----------------------------------- |
| 🎨 Frontend  | React.js, Vite, Axios, CSS          |
| ⚙️ Backend   | Flask, JWT, Flask-Bcrypt            |
| 🤖 AI/ML     | DeepFace, TensorFlow, ArcFace, MTCNN |
| 🗄️ Database | PostgreSQL                          |
| 🔐 Security  | JWT Authentication, Bcrypt          |

</div>

---

# 📸 Application Preview

## 🔑 Authentication Pages

* Login Page
* Signup Page
* Face Login with Webcam Support

## 📝 Notes Dashboard

* Create & Manage Notes
* Search & Filter Notes
* Edit/Delete Functionality

## 👨‍💻 Admin Dashboard

* User Management
* Notes Management
* Analytics & Statistics

---

# 🚀 Installation Guide

## 📥 Clone Repository

```bash id="vwjlwm"
git clone https://github.com/YOUR_USERNAME/secure-notepad.git
cd secure-notepad
```

---

# ⚙️ Backend Setup

```bash id="kojlwm"
cd backend
pip install -r requirements.txt
python app.py
```

---

# 🎨 Frontend Setup

```bash id="mnjlwm"
cd frontend
npm install
npm run dev
```

---

# 🌐 Frontend Environment Variables

Create a `.env` file inside the frontend folder:

```env id="vjlwm"
# Production
# VITE_API_URL=https://your-backend-url.onrender.com

# Local Development
VITE_API_URL=http://localhost:5000
```

---

# 🔑 Backend Environment Variables

Create a `.env` file inside the backend folder:

```env id="jlwm1"
DATABASE_URL=your_database_url

SECRET_KEY=your_secret_key

ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
```

---

# 📂 Project Structure

```text id="jlwm2"
secure-notepad/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── styles/
│   └── public/
│
├── backend/
│   ├── utils/
│   ├── models/
│   ├── routes/
│   ├── app.py
│   └── requirements.txt
│
└── README.md
```

---

# ⚠️ Important Note

> Face login may take a few seconds depending on device performance because facial recognition models are computationally intensive.

💡 For faster authentication, traditional password login is also available.

---

# 🔮 Future Improvements

🚀 Two-Factor Authentication
🚀 End-to-End Note Encryption
🚀 Face Anti-Spoof Detection
🚀 Dark Mode Enhancements
🚀 Cloud Deployment
🚀 Real-Time Sync

---

# 👨‍💻 Author

<div align="center">

## Ramtanay Chakraborty

🎓 B.Tech CSE Student
🤖 AI/ML & Full Stack Development Enthusiast
💡 Passionate about AI, Secure Systems & Web Development

<br/>

### 🌟 Connect • Learn • Build 🌟

</div>

---

<div align="center">

# ⭐ If you like this project, consider giving it a Star ⭐

### 🚀 Thanks for visiting the repository 🚀

</div>
