import { useState, useEffect } from "react";
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

const App = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(API_URL);
      setNotes(response.data);
    } catch (err) {
      console.error("error: failed to fetch notes", err);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, { title, content });
      } else {
        await axios.post(API_URL, { title, content });
      }

      setTitle('');
      setContent('');
      setEditingId(null);
      fetchNotes();
    } catch (err) {
      console.error("error: failed to save note", err);
    }
  }

  const handleEditClick = (note) => {
    const noteId = typeof note._id === "string"
      ? note._id
      : note._id.$oid;

    setTitle(note.title);
    setContent(note.content);
    setEditingId(noteId);
  };

  const handleCancelEdit = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
  };

  return (
    <div className="app-container">

      <div className="editor-panel">
        <h2>{editingId ? "Edit Note" : "Create a New Note"}</h2>

        <form onSubmit={handleSaveNote} className="note-form">

          <input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Write your markdown here..."
            rows="10"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="button-group">

            <button type="submit" className="primary-btn">
              {editingId ? "Update Note" : "Save Note"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="secondary-btn"
              >
                Cancel
              </button>
            )}

          </div>
        </form>
      </div>

      <div className="notes-panel">
        <h2>Your Notes</h2>

        {notes.length === 0 && (
          <p className="empty-text">
            No notes yet. Create one!
          </p>
        )}

        {notes.map((note) => {
          const noteId = note._id.$oid;

          return (
            <div key={noteId} className="note-card">

              <div className="note-header">

                <h3>{note.title}</h3>

                <div className="note-actions">

                  <button
                    onClick={() => handleEditClick(note)}
                    className="edit-btn"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteNote(noteId)}
                    className="delete-btn"
                  >
                    Delete
                  </button>

                </div>
              </div>

              <hr />

              <div className="markdown-content">
                <ReactMarkdown>
                  {note.content}
                </ReactMarkdown>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default App;