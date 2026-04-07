import { useState, useEffect } from "react";
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';

const API_URL = "http://localhost:3000/notes";

const App = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

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

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      await axios.post(API_URL, { title, content });
      setTitle('');
      setContent('');
      fetchNotes();
    } catch (err) {
      console.error("error: failed to create note", err);
    }
  };

  return (
    <div style={{ display: 'flex', padding: '20px', gap: '40px' }}>

      <div style={{ flex: 1 }}>
        <h2>Create a New Note</h2>
        <form onSubmit={handleCreateNote} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Write your markdown here... e.g., **Bold**, *Italic*, # Header"
            rows="10"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit">Save Note</button>
        </form>
      </div>

      <div style={{ flex: 1 }}>
        <h2>Your Notes</h2>
        {notes.length === 0 ? <p>No notes yet. Create one!</p> : null}

        {notes.map((note, index) => (
          <div key={_} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
            <h3>{note.title}</h3>
            <hr />
            <ReactMarkdown>{note.content}</ReactMarkdown>
          </div>
        ))}
      </div>

    </div>
  );

}
export default App;