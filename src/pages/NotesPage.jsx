import React, { useState, useEffect } from 'react';
import './NotesPage.css';
import { useCategories } from '../components/CategoryManager';
import { db } from '../firebase';
import { useAuth } from '../components/AuthProvider';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function NotesPage() { 
    const categories = useCategories();
    const { user } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState({ title: '', content: '', category: '', files: [] });
    const [filterCategory, setFilterCategory] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchNotes = async () => {
            const q = query(collection(db, 'notes'), where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchNotes();
    }, [user]);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        setUploading(true);
        const storage = getStorage();
        const uploadedFiles = await Promise.all(files.map(async (file) => {
            const storageRef = ref(storage, `notes/${user.uid}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            return { name: file.name, url };
        }));
        setNewNote(prev => ({ ...prev, files: [...(prev.files || []), ...uploadedFiles] }));
        setUploading(false);
    };

    const handleAddOrEditNote = async () => {
        if (newNote.content.trim() !== '' && user) {
            if (isEdit && editId) {
                await updateDoc(doc(db, 'notes', editId), {
                    ...newNote,
                    userId: user.uid
                });
                setNotes(notes.map(n => n.id === editId ? { ...newNote, id: editId, userId: user.uid } : n));
            } else {
                const docRef = await addDoc(collection(db, 'notes'), {
                    ...newNote,
                    userId: user.uid
                });
                setNotes([...notes, { ...newNote, id: docRef.id, userId: user.uid }]);
            }
            setNewNote({ title: '', content: '', category: '', files: [] });
            setIsDialogOpen(false);
            setIsEdit(false);
            setEditId(null);
        }
    };

    const handleEdit = (note) => {
        setNewNote({ title: note.title, content: note.content, category: note.category || '', files: note.files || [] });
        setIsDialogOpen(true);
        setIsEdit(true);
        setEditId(note.id);
    };

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, 'notes', id));
        setNotes(notes.filter(n => n.id !== id));
    };

    const removeFile = (indexToRemove) => {
        setNewNote(prev => ({
            ...prev,
            files: prev.files.filter((_, index) => index !== indexToRemove)
        }));
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
                        {note.files && note.files.length > 0 && (
                            <div className="note-files">
                                {note.files.map((file, idx) => (
                                    <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                                ))}
                            </div>
                        )}
                        <div className="note-actions">
                            <button onClick={() => handleEdit(note)}>Edit</button>
                            <button onClick={() => handleDelete(note.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                className="add-note-button"
                onClick={() => { setIsDialogOpen(true); setIsEdit(false); setNewNote({ title: '', content: '', category: '', files: [] }); }}
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
                        <input
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx,.txt"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                        {uploading && <div>Uploading...</div>}
                        {newNote.files && newNote.files.length > 0 && (
                            <div className="selected-files">
                                {newNote.files.map((file, index) => (
                                    <div key={index} className="selected-file-item">
                                        <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                                        <button onClick={() => removeFile(index)}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="dialog-actions">
                            <button onClick={() => { setIsDialogOpen(false); setIsEdit(false); setEditId(null); }}>Cancel</button>
                            <button onClick={handleAddOrEditNote}>{isEdit ? 'Save Changes' : 'Add Note'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotesPage; 