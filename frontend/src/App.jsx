import { useState, useEffect } from "react";
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';

const API_URL = "http://0.0.0.0:3000/notes";

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
    const noteId = typeof note._id === "string" ? note._id : note._id.$oid;
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
    <div style={{ display: 'flex', padding: '20px', gap: '40px' }}>

      <div style={{ flex: 1 }}>
        <h2>{editingId ? "Edit Note" : "Create a New Note"}</h2>
        <form onSubmit={handleSaveNote} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ flex: 1 }}>
              {editingId ? "Update Note" : "Save Note"}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={{ flex: 1, backgroundColor: '#666', color: 'white' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ flex: 1 }}>
        <h2>Your Notes</h2>
        {notes.length === 0 ? <p>No notes yet. Create one!</p> : null}

        {notes.map((note) => {
          const noteId = note._id.$oid;

          return (
            <div key={noteId} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{note.title}</h3>
                <div>
                  <button
                    onClick={() => handleEditClick(note)}
                    style={{ backgroundColor: '#4da6ff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(noteId)}
                    style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <hr />
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          );
        })}
      </div>
    </div>
  );

}
export default App;