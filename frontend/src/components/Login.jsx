import { useState, useRef, useEffect } from "react"
import axios from "axios"
import "./Login.css"

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  // Webcam states
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState("")

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const API = axios.create({
    baseURL: "http://localhost:5000",
  })

  // =========================
  // START CAMERA
  // =========================

  const startCamera = async () => {
    try {
      setCameraError("")

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })

      streamRef.current = stream

      setCameraActive(true)

      // Wait for video element render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 100)
    } catch (err) {
      console.error(err)

      setCameraError(
        "Unable to access webcam. Please allow camera permission."
      )
    }
  }

  // =========================
  // STOP CAMERA
  // =========================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())

      streamRef.current = null
    }

    setCameraActive(false)
  }

  // =========================
  // CAPTURE PHOTO
  // =========================

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext("2d")

    context.drawImage(video, 0, 0)

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], "webcam-photo.jpg", {
          type: "image/jpeg",
        })

        setImage(file)

        setImagePreview(canvas.toDataURL())

        stopCamera()

        setMessage("Photo captured successfully!")
      },
      "image/jpeg",
      0.95
    )
  }

  // =========================
  // FILE UPLOAD
  // =========================

  const handleImageChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      setImage(file)

      const reader = new FileReader()

      reader.onloadend = () => {
        setImagePreview(reader.result)
      }

      reader.readAsDataURL(file)

      setMessage("")
    }
  }

  // =========================
  // CLEANUP CAMERA
  // =========================

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop())
      }
    }
  }, [])

  // =========================
  // SIGNUP
  // =========================

  const handleSignup = async (e) => {
    e.preventDefault()

    setError("")
    setMessage("")
    setLoading(true)

    if (!username || !password || !image) {
      setError("All fields are required")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()

      formData.append("username", username)
      formData.append("password", password)
      formData.append("image", image)

      await API.post("/auth/signup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setMessage("Signup successful! Please login.")

      setTimeout(() => {
        setMode("login")
        setUsername("")
        setPassword("")
        setImage(null)
        setImagePreview(null)
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // NORMAL LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    if (!username || !password) {
      setError("Username and password are required")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()

      formData.append("username", username)
      formData.append("password", password)

      const response = await API.post("/auth/login", formData)

      const token = response.data.token

      localStorage.setItem("token", token)

      onLogin(token)
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // FACE LOGIN
  // =========================

  const handleFaceLogin = async (e) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    if (!username || !image) {
      setError("Username and image are required")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()

      formData.append("username", username)
      formData.append("image", image)

      const response = await API.post(
        "/auth/face_login",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      const token = response.data.token

      localStorage.setItem("token", token)

      onLogin(token)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Face login failed"
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // REUSABLE IMAGE SECTION
  // =========================

  const renderImageSection = (inputId) => (
    <div className="form-group">
      <label>Face Photo</label>

      {!cameraActive ? (
        <>
          <div className="image-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
              id={inputId}
            />

            <label
              htmlFor={inputId}
              className="upload-label"
            >
              📷 Choose Image
            </label>
          </div>

          <button
            type="button"
            className="btn btn-secondary webcam-btn"
            onClick={startCamera}
          >
            🎥 Use Webcam
          </button>
        </>
      ) : (
        <div className="webcam-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="webcam-video"
          />

          <div className="webcam-buttons">
            <button
              type="button"
              className="btn btn-primary"
              onClick={capturePhoto}
            >
              📸 Capture
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={stopCamera}
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />

      {cameraError && (
        <div className="alert alert-error">
          {cameraError}
        </div>
      )}

      {imagePreview && (
        <img
          src={imagePreview}
          alt="Preview"
          className="image-preview"
        />
      )}
    </div>
  )

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Secure Notepad</h1>

        <p className="subtitle">
          Smart Notes with Face Recognition
        </p>

        <div className="mode-switcher">
          <button
            className={`mode-btn ${
              mode === "login" ? "active" : ""
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>

          <button
            className={`mode-btn ${
              mode === "signup" ? "active" : ""
            }`}
            onClick={() => setMode("signup")}
          >
            Signup
          </button>

          <button
            className={`mode-btn ${
              mode === "face-login"
                ? "active"
                : ""
            }`}
            onClick={() => setMode("face-login")}
          >
            Face Login
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        {/* LOGIN */}

        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>

              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>
          </form>
        )}

        {/* SIGNUP */}

        {mode === "signup" && (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label>Username</label>

              <input
                type="text"
                placeholder="Choose username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Choose password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />
            </div>

            {renderImageSection("signup-image")}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Sign Up"}
            </button>
          </form>
        )}

        {/* FACE LOGIN */}

        {mode === "face-login" && (
          <form onSubmit={handleFaceLogin}>
            <div className="form-group">
              <label>Username</label>

              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
              />
            </div>

            {renderImageSection("face-login-image")}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Verifying face..."
                : "Login With Face"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}