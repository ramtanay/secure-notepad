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
  const [editingTitle, setEditingTitle] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [toast, setToast] = useState(null)

  const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
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
        { note: newNote, title: newTitle.trim() || "Untitled" },
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
        { note: editingText, title: editingTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setEditingId(null)
      setEditingText("")
      setEditingTitle("")
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
      setNotes(response.data || [])
    } catch (err) {
      console.error(err)
      setToast({ message: "Search failed", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (id, title, text) => {
    setEditingId(id)
    setEditingTitle(title || "")
    setEditingText(text)
  }

  // Filter notes based on content length
  const displayNotes = notes.filter((note) => {
    if (filterType === "long") return note.note?.length > 100
    if (filterType === "short") return note.note?.length <= 100
    return true
  })

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
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchNotes()}
            disabled={loading}
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
            disabled={loading}
          >
            All
          </button>
          <button
            className={`filter-btn ${filterType === "long" ? "active" : ""}`}
            onClick={() => setFilterType("long")}
            disabled={loading}
          >
            Long Notes
          </button>
          <button
            className={`filter-btn ${filterType === "short" ? "active" : ""}`}
            onClick={() => setFilterType("short")}
            disabled={loading}
          >
            Short Notes
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
            <div key={note.id} className="note-card">
              {editingId === note.id ? (
                <>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="note-edit-title"
                    placeholder="Note title"
                    disabled={loading}
                  />
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="note-edit-textarea"
                    rows={4}
                    disabled={loading}
                  />
                  <div className="note-actions">
                    <button
                      className="btn-save"
                      onClick={() => updateNote(note.id)}
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
                  <h3 className="note-title">{note.title || "Untitled"}</h3>
                  <p className="note-text">{note.note}</p>
                  <div className="note-meta">
                    <small>ID: {note.id}</small>
                    <small>• {note.note?.length || 0} characters</small>
                  </div>
                  <div className="note-actions">
                    <button
                      className="btn-edit"
                      onClick={() => startEdit(note.id, note.title, note.note)}
                      disabled={loading}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteNote(note.id)}
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