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

  // Only add interceptors in development
  if (import.meta.env.DEV) {
    API.interceptors.request.use(request => {
      console.log("📤 Request:", {
        url: request.url,
        method: request.method,
        data: request.data instanceof FormData ? "FormData" : request.data,
      })
      return request
    })

    API.interceptors.response.use(
      response => {
        console.log("📥 Response:", {
          status: response.status,
        })
        return response
      },
      error => {
        console.error("❌ Response Error:", {
          status: error.response?.status,
          message: error.message
        })
        return Promise.reject(error)
      }
    )
  }

  // =========================
  // SWITCH MODE WITH CLEANUP (FIXED)
  // =========================

  const switchMode = (newMode) => {
    // Stop camera first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    
    // Clear image preview blob URL to prevent memory leaks
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    
    // Reset all states
    setMode(newMode)
    setError("")
    setMessage("")
    setUsername("")
    setPassword("")
    setImage(null)
    setImagePreview(null)
    setCameraActive(false)
    setCameraError("")
    setLoading(false)
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
  // SIGNUP (FIXED - No freezing)
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
      formData.append("username", username.trim())
      formData.append("password", password)
      formData.append("image", image)

      await API.post("/auth/signup", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })

      // Stop camera if active
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      setCameraActive(false)
      
      // Clear image preview blob
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
      
      setMessage("Signup successful! Please login.")
      setImage(null)
      setImagePreview(null)
      setLoading(false)
      
      // Switch to login mode after delay
      setTimeout(() => {
        setMode("login")
        setUsername("")
        setPassword("")
        setImage(null)
        setImagePreview(null)
        setError("")
        setMessage("")
        setCameraActive(false)
        setCameraError("")
      }, 2000)

    } catch (err) {
      console.error("Signup error:", err)
      
      let errorMessage = "Signup failed"
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
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
      console.error("Login error:", err)
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

    if (!username || !image) {
      setError("Username and image are required")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("username", username)
      formData.append("image", image)

      const response = await API.post("/auth/face_login", formData)
      const token = response.data.token

      localStorage.setItem("token", token)
      onLogin(token)

    } catch (err) {
      console.error("Face login error:", err)
      
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

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Secure Notepad</h1>

        <p className="subtitle">
          Smart Notes with Face Recognition
        </p>

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

              <div className="face-login-disclaimer">
                ⚠️ Face login may take a few seconds depending on device performance. 
                For faster access, we recommend using password login.
              </div>

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