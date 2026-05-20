import { useState, useEffect } from "react"
import axios from "axios"
import "./App.css"
import Login from "./components/Login"
import Notes from "./components/Notes"
import AdminDashboard from "./components/AdminDashboard"

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]))
        setUser(decoded)
      } catch (e) {
        console.error("Token decode error:", e)
        localStorage.removeItem("token")
        setToken(null)
      }
    }
  }, [token])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  if (!token) {
    return <Login onLogin={setToken} />
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h2>Welcome, {user?.username}!</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {user?.role === "admin" ? (
        <AdminDashboard user={user} token={token} />
      ) : (
        <Notes token={token} />
      )}
    </div>
  )
}

export default App