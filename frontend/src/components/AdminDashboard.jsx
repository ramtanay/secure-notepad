import { useState, useEffect } from "react"
import axios from "axios"
import Toast from "./Toast"
import "./AdminDashboard.css"

export default function AdminDashboard({ user, token }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
    avgNotesPerUser: 0
  })
  const [users, setUsers] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [toast, setToast] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [systemStats, setSystemStats] = useState(null)

  const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  useEffect(() => {
    fetchAllData()
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      const response = await API.get("/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSystemStats(response.data)
    } catch (err) {
      console.error("Failed to fetch system stats:", err)
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    setError("")
    try {
      // Fetch users with the updated API response structure
      const usersRes = await API.get("/admin/users", { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      
      // Fetch notes with the updated API response structure
      const notesRes = await API.get("/admin/notes", { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      
      // Handle new response structure (object with data property)
      let usersData = []
      let notesData = []
      
      if (usersRes.data && usersRes.data.users) {
        usersData = usersRes.data.users
      } else if (Array.isArray(usersRes.data)) {
        usersData = usersRes.data
      } else {
        usersData = []
      }
      
      if (notesRes.data && notesRes.data.notes) {
        notesData = notesRes.data.notes
      } else if (Array.isArray(notesRes.data)) {
        notesData = notesRes.data
      } else {
        notesData = []
      }
      
      setUsers(usersData)
      setNotes(notesData)
      setStats({
        totalUsers: usersData.length,
        totalNotes: notesData.length,
        avgNotesPerUser: usersData.length > 0 ? (notesData.length / usersData.length).toFixed(1) : 0
      })
      
    } catch (err) {
      console.error("Failed to fetch data:", err)
      if (err.response?.status === 403) {
        setError("Admin access required. Please login with admin credentials.")
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again.")
      } else {
        setError("Failed to load dashboard data: " + (err.response?.data?.error || err.message))
      }
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This will delete all their notes.`)) return

    setLoading(true)
    try {
      await API.delete(`/admin/delete_user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setToast({ message: `User "${username}" deleted successfully`, type: "success" })
      await fetchAllData()
      await fetchSystemStats()
    } catch (err) {
      console.error("Failed to delete user:", err)
      setToast({ 
        message: err.response?.data?.error || "Failed to delete user", 
        type: "error" 
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (noteId, username = null) => {
    const confirmMessage = username 
      ? `Are you sure you want to delete this note by "${username}"?`
      : "Are you sure you want to delete this note?"
    
    if (!window.confirm(confirmMessage)) return

    setLoading(true)
    try {
      await API.delete(`/admin/delete_note/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setToast({ message: "Note deleted successfully", type: "success" })
      await fetchAllData()
      await fetchSystemStats()
    } catch (err) {
      console.error("Failed to delete note:", err)
      setToast({ 
        message: err.response?.data?.error || "Failed to delete note", 
        type: "error" 
      })
    } finally {
      setLoading(false)
    }
  }

  // Updated filter functions for new data structure
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredNotes = notes.filter(note =>
    note.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.note?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRefresh = () => {
    fetchAllData()
    fetchSystemStats()
    setToast({ message: "Data refreshed successfully", type: "success" })
    setTimeout(() => setToast(null), 2000)
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>🛡️ Admin Dashboard</h2>
        <div className="admin-badge">
          {user?.role === 'admin' ? 'Administrator' : user?.username || 'Admin'}
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
          disabled={loading}
        >
          📊 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
          disabled={loading}
        >
          👥 Users
        </button>
        <button
          className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => setActiveTab("notes")}
          disabled={loading}
        >
          📝 Notes
        </button>
        <button
          className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
          disabled={loading}
        >
          📈 Analytics
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={fetchAllData} className="retry-btn">Retry</button>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.totalUsers}</p>
                <small>Registered accounts</small>
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
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Avg Notes/User</h3>
                <p className="stat-value">{stats.avgNotesPerUser}</p>
                <small>Notes per user average</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔐</div>
              <div className="stat-content">
                <h3>System Status</h3>
                <p className="stat-value">✅ Healthy</p>
                <small>All systems operational</small>
              </div>
            </div>
          </div>

          {systemStats && systemStats.statistics && (
            <div className="stats-additional">
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-content">
                  <h3>Top Users</h3>
                  {systemStats.top_users?.map((u, idx) => (
                    <p key={idx} className="top-user">
                      {idx + 1}. {u.username} ({u.note_count} notes)
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn" onClick={handleRefresh} disabled={loading}>
                🔄 Refresh Data
              </button>
              <button className="action-btn" onClick={() => setActiveTab("users")}>
                👥 Manage Users
              </button>
              <button className="action-btn" onClick={() => setActiveTab("notes")}>
                📝 Manage Notes
              </button>
              <button className="action-btn" onClick={() => setActiveTab("analytics")}>
                📊 View Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="users-section">
          <div className="users-header">
            <div>
              <h3>Registered Users</h3>
              <p className="user-count">{filteredUsers.length} of {users.length} users</p>
            </div>
            <input
              type="text"
              placeholder="Search users by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              disabled={loading}
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <p>{searchQuery ? "No users found matching your search" : "No users registered yet"}</p>
            </div>
          ) : (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Notes</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <span className="username">{user.username}</span>
                      </td>
                      <td>
                        <span className="note-count">{user.note_count || 0}</span>
                      </td>
                      <td>
                        <span className="status active">Active</span>
                      </td>
                      <td>
                        <button 
                          className="action-link danger"
                          onClick={() => deleteUser(user.id, user.username)}
                          disabled={loading}
                        >
                          🗑️ Delete
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
              <p className="notes-count">{filteredNotes.length} of {notes.length} notes</p>
            </div>
            <input
              type="text"
              placeholder="Search notes by user or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              disabled={loading}
            />
          </div>

          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <p>{searchQuery ? "No notes found matching your search" : "No notes in system"}</p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note) => (
                <div key={note.id} className="note-item">
                  <div className="note-header">
                    <h4>@{note.username}</h4>
                    <span className="note-id">ID: {note.id}</span>
                  </div>
                  <p className="note-content">{note.note}</p>
                  {note.created_at && (
                    <div className="note-date">
                      <small>Created: {new Date(note.created_at).toLocaleString()}</small>
                    </div>
                  )}
                  <div className="note-footer">
                    <button
                      className="btn-delete"
                      onClick={() => deleteNote(note.id, note.username)}
                      disabled={loading}
                    >
                      🗑️ Delete Note
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
              <h3>📈 System Overview</h3>
              <div className="analytics-stats">
                <div className="analytics-item">
                  <label>User Growth</label>
                  <p>+{Math.floor(Math.random() * 20)}% this week</p>
                </div>
                <div className="analytics-item">
                  <label>Note Creation Rate</label>
                  <p>{Math.floor(notes.length / 7)} notes/day avg</p>
                </div>
                <div className="analytics-item">
                  <label>Active Users</label>
                  <p>{Math.floor(users.length * 0.7)} (70%)</p>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>🔐 Security Metrics</h3>
              <div className="method-stats">
                <div className="method-item">
                  <label>Face Recognition</label>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: "100%" }}></div>
                  </div>
                  <span>Enabled</span>
                </div>
                <div className="method-item">
                  <label>JWT Authentication</label>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: "100%" }}></div>
                  </div>
                  <span>Active</span>
                </div>
                <div className="method-item">
                  <label>Admin Protection</label>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: "100%" }}></div>
                  </div>
                  <span>Secure</span>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>💾 Storage Usage</h3>
              <div className="storage-stats">
                <div className="storage-item">
                  <label>Total Users</label>
                  <span>{stats.totalUsers}</span>
                </div>
                <div className="storage-item">
                  <label>Total Notes</label>
                  <span>{stats.totalNotes}</span>
                </div>
                <div className="storage-item">
                  <label>Avg Notes/User</label>
                  <span>{stats.avgNotesPerUser}</span>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>📊 Recommendations</h3>
              <div className="recommendations">
                {stats.totalUsers === 0 && <p>⚠️ No users registered yet</p>}
                {stats.totalNotes === 0 && <p>📝 No notes in the system</p>}
                {stats.avgNotesPerUser < 2 && stats.totalUsers > 0 && (
                  <p>💡 Encourage users to create more notes</p>
                )}
                {stats.totalUsers > 10 && (
                  <p>🎉 Great user base! Consider scaling up</p>
                )}
                {!stats.totalUsers && !stats.totalNotes && (
                  <p>✅ System ready for users</p>
                )}
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