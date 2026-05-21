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
    baseURL: import.meta.env.VITE_API_URL,
  })

  // Add request/response interceptors for debugging
  API.interceptors.request.use(request => {
    console.log("📤 Request:", {
      url: request.url,
      method: request.method,
      data: request.data instanceof FormData ? "FormData" : request.data,
      headers: request.headers
    })
    return request
  })

  API.interceptors.response.use(
    response => {
      console.log("📥 Response:", {
        status: response.status,
        data: response.data
      })
      return response
    },
    error => {
      console.error("❌ Response Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      return Promise.reject(error)
    }
  )

  // =========================
  // SWITCH MODE WITH CLEANUP
  // =========================

  const switchMode = (newMode) => {
    setMode(newMode)
    setError("")
    setMessage("")
    setUsername("")
    setPassword("")
    setImage(null)
    setImagePreview(null)
    setCameraActive(false)
    setCameraError("")
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  // =========================
  // START CAMERA
  // =========================

  const startCamera = async () => {
    try {
      setCameraError("")

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })

      streamRef.current = stream
      setCameraActive(true)

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(err => console.error("Video play error:", err))
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
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "webcam-photo.jpg", {
            type: "image/jpeg",
          })
          setImage(file)
          setImagePreview(URL.createObjectURL(blob))
          stopCamera()
          setMessage("Photo captured successfully!")
        }
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
      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file")
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB")
        return
      }

      console.log("📷 Image selected:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      })

      setImage(file)
      setImagePreview(URL.createObjectURL(file))
      setMessage("")
      setError("")
    }
  }

  // =========================
  // CLEANUP CAMERA AND PREVIEWS
  // =========================

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  // =========================
  // SIGNUP
  // =========================

  const handleSignup = async (e) => {
    e.preventDefault()

    setError("")
    setMessage("")
    setLoading(true)

    console.log("🔐 Starting signup process...")

    if (!username || !password || !image) {
      console.log("❌ Missing fields:", { username: !!username, password: !!password, image: !!image })
      setError("All fields are required")
      setLoading(false)
      return
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("username", username)
      formData.append("password", password)
      formData.append("image", image)

      console.log("📤 Sending signup request to:", `${API.defaults.baseURL}/auth/signup`)
      console.log("📦 FormData contents:")
      for (let [key, value] of formData.entries()) {
        if (key === 'image') {
          console.log(`  ${key}: ${value.name} (${value.type}, ${value.size} bytes)`)
        } else {
          console.log(`  ${key}: ${value}`)
        }
      }

      const response = await API.post("/auth/signup", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })

      console.log("✅ Signup successful:", response.data)

      setMessage("Signup successful! Please login.")
      
      setTimeout(() => {
        switchMode("login")
      }, 2000)

    } catch (err) {
      console.error("❌ Signup error:", err)
      
      let errorMessage = "Signup failed"
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
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
    setMessage("")
    setLoading(true)

    console.log("🔐 Starting login process...")

    if (!username || !password) {
      setError("Username and password are required")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("username", username)
      formData.append("password", password)

      console.log("📤 Sending login request for user:", username)

      const response = await API.post("/auth/login", formData)
      const token = response.data.token

      console.log("✅ Login successful")

      localStorage.setItem("token", token)
      onLogin(token)
      
    } catch (err) {
      console.error("❌ Login error:", err)
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
    setMessage("")
    setLoading(true)

    console.log("😊 Starting face login process...")

    if (!username || !image) {
      setError("Username and image are required")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("username", username)
      formData.append("image", image)

      console.log("📤 Sending face login request for user:", username)

      const response = await API.post("/auth/face_login", formData)
      const token = response.data.token

      console.log("✅ Face login successful")

      localStorage.setItem("token", token)
      onLogin(token)

    } catch (err) {
      console.error("❌ Face login error:", err)
      
      if (err.response?.status === 404) {
        setError("User not found. Please sign up first.")
      } else if (err.response?.status === 401) {
        setError("Face verification failed. Please try again with better lighting.")
      } else {
        setError(err.response?.data?.message || "Face login failed. Make sure your face is clearly visible.")
      }
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
              style={{ display: "none" }}
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
            disabled={loading}
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
              disabled={loading}
            >
              📸 Capture
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={stopCamera}
              disabled={loading}
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
        <div className="image-preview-container">
          <img
            src={imagePreview}
            alt="Preview"
            className="image-preview"
          />
          <button
            type="button"
            className="remove-image-btn"
            onClick={() => {
              setImage(null)
              setImagePreview(null)
            }}
          >
            ✕ Remove
          </button>
        </div>
      )}
    </div>
  )

  // Display current API URL for debugging
  console.log("🌐 API Base URL:", API.defaults.baseURL)

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Secure Notepad</h1>

        <p className="subtitle">
          Smart Notes with Face Recognition
        </p>

        {/* Debug info - remove in production */}
        {import.meta.env.DEV && (
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
            API: {API.defaults.baseURL}
          </div>
        )}

        <div className="mode-switcher">
          <button
            className={`mode-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
            disabled={loading}
          >
            Login
          </button>

          <button
            className={`mode-btn ${mode === "signup" ? "active" : ""}`}
            onClick={() => switchMode("signup")}
            disabled={loading}
          >
            Signup
          </button>

          <button
            className={`mode-btn ${mode === "face-login" ? "active" : ""}`}
            onClick={() => switchMode("face-login")}
            disabled={loading}
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
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
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
                placeholder="Choose username (min 3 characters)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Choose password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            {renderImageSection("signup-image")}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
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
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>

            {renderImageSection("face-login-image")}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Verifying face..." : "Login With Face"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}