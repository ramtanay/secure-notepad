import { useState, useEffect } from "react"
import axios from "axios"
import Toast from "./Toast"
import "./Notes.css"

export default function Notes({ token }) {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [toast, setToast] = useState(null)

  const API = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const response = await API.get("/note/view_all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotes(response.data || [])
    } catch (err) {
      console.error(err)
      setToast({ message: "Failed to load notes", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const addNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) {
      setToast({ message: "Note cannot be empty", type: "error" })
      return
    }

    setLoading(true)
    try {
      await API.post(
        "/note/add",
        { note: newNote, title: newTitle || "Untitled" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewNote("")
      setNewTitle("")
      setToast({ message: "Note added successfully", type: "success" })
      fetchNotes()
    } catch (err) {
      console.error(err)
      setToast({ message: "Failed to add note", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const updateNote = async (id) => {
    if (!editingText.trim()) {
      setToast({ message: "Note cannot be empty", type: "error" })
      return
    }

    setLoading(true)
    try {
      await API.put(
        `/note/update/${id}`,
        { note: editingText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setEditingId(null)
      setEditingText("")
      setToast({ message: "Note updated successfully", type: "success" })
      fetchNotes()
    } catch (err) {
      console.error(err)
      setToast({ message: "Failed to update note", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return

    setLoading(true)
    try {
      await API.delete(`/note/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setToast({ message: "Note deleted successfully", type: "success" })
      fetchNotes()
    } catch (err) {
      console.error(err)
      setToast({ message: "Failed to delete note", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const searchNotes = async () => {
    if (!searchQuery.trim()) {
      fetchNotes()
      return
    }

    setLoading(true)
    try {
      const response = await API.get(`/note/search/${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const notesData = Array.isArray(response.data) ? response.data : []
      setNotes(notesData)
    } catch (err) {
      console.error(err)
      setToast({ message: "Search failed", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (id, text) => {
    setEditingId(id)
    setEditingText(text)
  }

  const displayNotes = Array.isArray(notes)
  ? notes.filter((note) => {
      if (filterType === "long")
        return note[1]?.length > 50

      if (filterType === "short")
        return note[1]?.length <= 50

      return true
    })
    : []

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h2>📝 My Notes</h2>
        <p className="notes-count">{notes.length} notes</p>
      </div>

      <div className="notes-toolbar">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchNotes()}
          />
          <button className="btn-search" onClick={searchNotes} disabled={loading}>
            🔍 Search
          </button>
          <button
            className="btn-reset"
            onClick={() => {
              setSearchQuery("")
              fetchNotes()
            }}
            disabled={loading}
          >
            ↺ Reset
          </button>
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterType === "all" ? "active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${filterType === "long" ? "active" : ""}`}
            onClick={() => setFilterType("long")}
          >
            Long
          </button>
          <button
            className={`filter-btn ${filterType === "short" ? "active" : ""}`}
            onClick={() => setFilterType("short")}
          >
            Short
          </button>
        </div>
      </div>

      <form onSubmit={addNote} className="add-note-form">
        <input
          type="text"
          placeholder="Note title (optional)..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={loading}
          className="note-title-input"
        />
        <textarea
          placeholder="Write a new note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          disabled={loading}
          rows="4"
        />
        <button type="submit" className="btn btn-add" disabled={loading}>
          {loading ? "Adding..." : "✨ Add Note"}
        </button>
      </form>

      <div className="notes-grid">
        {displayNotes.length === 0 ? (
          <div className="empty-state">
            <p>📭 No notes yet</p>
            <small>Start by adding a new note above!</small>
          </div>
        ) : (
          displayNotes.map((note) => (
            <div key={note[0]} className="note-card">
              {editingId === note[0] ? (
                <>
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="note-edit-textarea"
                  />
                  <div className="note-actions">
                    <button
                      className="btn-save"
                      onClick={() => updateNote(note[0])}
                      disabled={loading}
                    >
                      💾 Save
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => setEditingId(null)}
                      disabled={loading}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="note-text">{note[1]}</p>
                  <div className="note-meta">
                    <small>ID: {note[0]}</small>
                  </div>
                  <div className="note-actions">
                    <button
                      className="btn-edit"
                      onClick={() => startEdit(note[0], note[1])}
                      disabled={loading}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteNote(note[0])}
                      disabled={loading}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

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
