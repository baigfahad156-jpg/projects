import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('general');
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [summary, setSummary] = useState('');
  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      let url = `notes/?search=${search}&tag=${filterTag}`;
      const res = await api.get(url);
      setNotes(res.data);
    } catch {
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const clearForm = () => {
    setTitle('');
    setContent('');
    setTag('general');
    setEditingId(null);
  };

  const saveNote = async (e) => {
    e.preventDefault();
    const data = { title, content, tag };
    if (editingId) {
      await api.put(`notes/${editingId}/`, data);
    } else {
      await api.post('notes/', data);
    }
    clearForm();
    fetchNotes();
  };

  const editNote = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setTag(note.tag);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteNote = async (id) => {
    await api.delete(`notes/${id}/`);
    fetchNotes();
  };

  const summarizeNote = async (id) => {
    const res = await api.post(`notes/${id}/summarize/`);
    setSummary(res.data.summary);
  };

  return (
    <main className="container">
      <section className="hero">
        <h1>Smart Notes Manager</h1>
        <p>Create, organize, search, and summarize your notes.</p>
      </section>

      <form className="noteForm" onSubmit={saveNote}>
        <h2>{editingId ? 'Edit Note' : 'Create Note'}</h2>
        <input placeholder="Note title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Write your note here" value={content} onChange={(e) => setContent(e.target.value)} required />
        <input placeholder="Tag e.g. work, study, ideas" value={tag} onChange={(e) => setTag(e.target.value)} />
        <div className="row">
          <button>{editingId ? 'Update Note' : 'Add Note'}</button>
          {editingId && <button type="button" onClick={clearForm} className="secondary">Cancel</button>}
        </div>
      </form>

      <section className="filters">
        <input placeholder="Search notes" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input placeholder="Filter by tag" value={filterTag} onChange={(e) => setFilterTag(e.target.value)} />
        <button onClick={fetchNotes}>Apply</button>
      </section>

      {summary && <div className="summary"><b>AI Summary:</b> {summary}</div>}

      <section className="notesGrid">
        {notes.map((note) => (
          <article className="noteCard" key={note.id}>
            <span className="tag">{note.tag}</span>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <div className="cardActions">
              <button onClick={() => editNote(note)}>Edit</button>
              <button onClick={() => deleteNote(note.id)} className="danger">Delete</button>
              <button onClick={() => summarizeNote(note.id)} className="secondary">Summary</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default Dashboard;
