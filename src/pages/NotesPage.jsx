import React, { useState } from 'react';
import './NotesPage.css';
import { useCategories } from '../components/CategoryManager';

function NotesPage() { 
    const categories = useCategories();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState({ title: '', content: '', category: '' });
    const [filterCategory, setFilterCategory] = useState('');

    const handleAddNote = () => {
        if (newNote.content.trim() !== '') {
            setNotes([...notes, { ...newNote, id: Date.now() }]);
            setNewNote({ title: '', content: '', category: '' });
            setIsDialogOpen(false);
        }
    };

    const filteredNotes = filterCategory
        ? notes.filter(note => note.category === filterCategory)
        : notes;

    return (
        <div className="notes-page">
            <div className="notes-filter">
                <label>Filter by Category: </label>
                <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                >
                    <option value="">All</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
            </div>
            <div className="notes-grid">
                {filteredNotes.map((note) => (
                    <div key={note.id} className="note-card">
                        {note.title && <h3>{note.title}</h3>}
                        <p>{note.content}</p>
                        {note.category && <span className="note-category">[{note.category}]</span>}
                    </div>
                ))}
            </div>

            <button 
                className="add-note-button"
                onClick={() => setIsDialogOpen(true)}
            >
                +
            </button>

            {isDialogOpen && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <input
                            type="text"
                            placeholder="Title"
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            className="dialog-title"
                        />
                        <textarea
                            placeholder="Take a note..."
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            className="dialog-content"
                        />
                        <select
                            value={newNote.category}
                            onChange={e => setNewNote({ ...newNote, category: e.target.value })}
                        >
                            <option value="">No Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <div className="dialog-actions">
                            <button onClick={() => setIsDialogOpen(false)}>Cancel</button>
                            <button onClick={handleAddNote}>Add Note</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotesPage; 