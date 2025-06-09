import React, { useState } from 'react';
import './NotesPage.css';

function NotesPage() { 
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState({ title: '', content: '' });

    const handleAddNote = () => {
        if (newNote.content.trim() !== '') {
            setNotes([...notes, { ...newNote, id: Date.now() }]);
            setNewNote({ title: '', content: '' });
            setIsDialogOpen(false);
        }
    };

    return (
        <div className="notes-page">
            <div className="notes-grid">
                {notes.map((note) => (
                    <div key={note.id} className="note-card">
                        {note.title && <h3>{note.title}</h3>}
                        <p>{note.content}</p>
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