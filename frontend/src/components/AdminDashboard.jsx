import { useState, useEffect } from "react"
import axios from "axios"
import Toast from "./Toast"
import "./AdminDashboard.css"

export default function AdminDashboard({ user, token }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
  })
  const [users, setUsers] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [toast, setToast] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [usersRes, notesRes] = await Promise.all([
        API.get("/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/admin/notes", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : []
      const notesData = Array.isArray(notesRes.data) ? notesRes.data : []
      
      setUsers(usersData)
      setNotes(notesData)
      setStats({
        totalUsers: usersData.length,
        totalNotes: notesData.length,
      })
      setError("")
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return

    try {
      await API.delete(`/admin/delete_user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setToast({ message: "User deleted successfully", type: "success" })
      fetchAllData()
    } catch (err) {
      console.error("Failed to delete user:", err)
      setToast({ message: "Failed to delete user", type: "error" })
    }
  }

  const deleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return

    try {
      await API.delete(`/admin/delete_note/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setToast({ message: "Note deleted successfully", type: "success" })
      fetchAllData()
    } catch (err) {
      console.error("Failed to delete note:", err)
      setToast({ message: "Failed to delete note", type: "error" })
    }
  }

  const filteredUsers = users.filter(user =>
    user[1].toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredNotes = notes.filter(note =>
    String(note[1]).includes(searchQuery) ||
    note[2]?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>🛡️ Admin Dashboard</h2>
        <div className="admin-badge">Admin</div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => setActiveTab("notes")}
        >
          Notes
        </button>
        <button
          className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {activeTab === "overview" && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.totalUsers}</p>
                <small>Active accounts</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>Total Notes</h3>
                <p className="stat-value">{stats.totalNotes}</p>
                <small>All notes in system</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>System Status</h3>
                <p className="stat-value">Healthy</p>
                <small>All systems operational</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔐</div>
              <div className="stat-content">
                <h3>Face Recognition</h3>
                <p className="stat-value">Active</p>
                <small>Biometric auth enabled</small>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn">🔄 Refresh Data</button>
              <button className="action-btn">📊 Generate Report</button>
              <button className="action-btn">🔧 System Settings</button>
              <button className="action-btn">📧 Send Notification</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="users-section">
          <div className="users-header">
            <div>
              <h3>Registered Users</h3>
              <p className="user-count">{filteredUsers.length} users</p>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <p>{searchQuery ? "No users found" : "No users registered"}</p>
            </div>
          ) : (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, idx) => (
                    <tr key={idx}>
                      <td>{user[0]}</td>
                      <td>
                        <span className="username">{user[1]}</span>
                      </td>
                      <td>
                        <span className="status active">Active</span>
                      </td>
                      <td>
                        <button 
                          className="action-link danger"
                          onClick={() => deleteUser(user[0], user[1])}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <div className="notes-section">
          <div className="notes-header">
            <div>
              <h3>All System Notes</h3>
              <p className="notes-count">{filteredNotes.length} notes</p>
            </div>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <p>{searchQuery ? "No notes found" : "No notes in system"}</p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note, idx) => (
                <div key={idx} className="note-item">
                  <div className="note-header">
                    <h4>User ID: {note[1]}</h4>
                    <span className="note-id">ID: {note[0]}</span>
                  </div>
                  <p className="note-content">{note[2]}</p>
                  <div className="note-footer">
                    <button
                      className="btn-delete"
                      onClick={() => deleteNote(note[0])}
                      disabled={loading}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="analytics-section">
          <div className="analytics-grid">
            <div className="chart-card">
              <h3>📈 Activity Trend</h3>
              <div className="chart-placeholder">
                <p>Chart visualization would appear here</p>
                <svg viewBox="0 0 200 100" className="mini-chart">
                  <polyline
                    points="10,90 40,60 70,80 100,40 130,55 160,30 190,50"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>

            <div className="chart-card">
              <h3>🔐 Login Methods</h3>
              <div className="method-stats">
                <div className="method-item">
                  <label>Traditional Auth</label>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: "65%" }}></div>
                  </div>
                  <span>65%</span>
                </div>
                <div className="method-item">
                  <label>Face Recognition</label>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: "35%" }}></div>
                  </div>
                  <span>35%</span>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>⏰ Peak Hours</h3>
              <div className="hours-stats">
                <p>Most active: 2:00 PM - 4:00 PM</p>
                <p>Least active: 12:00 AM - 6:00 AM</p>
                <p>Average daily users: {stats.totalUsers * 0.7}</p>
              </div>
            </div>

            <div className="chart-card">
              <h3>💾 Storage Usage</h3>
              <div className="storage-stats">
                <div className="storage-item">
                  <label>Database</label>
                  <span>24 MB</span>
                </div>
                <div className="storage-item">
                  <label>Face Embeddings</label>
                  <span>156 MB</span>
                </div>
                <div className="storage-item">
                  <label>Available</label>
                  <span>8.2 GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
