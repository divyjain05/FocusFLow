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
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user) return;
        fetchNotes();
    }, [user]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'notes'), where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        setUploading(true);
        try {
            const storage = getStorage();
            const uploadedFiles = await Promise.all(files.map(async (file) => {
                const storageRef = ref(storage, `notes/${user.uid}/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                return { name: file.name, url };
            }));
            setNewNote(prev => ({ ...prev, files: [...(prev.files || []), ...uploadedFiles] }));
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleAddOrEditNote = async () => {
        if (newNote.content.trim() === '' || !user) return;
        try {
            if (isEdit && editId) {
                await updateDoc(doc(db, 'notes', editId), {
                    ...newNote,
                    userId: user.uid,
                    timestamp: new Date().toISOString()
                });
                setNotes(notes.map(n => n.id === editId ? { ...newNote, id: editId, userId: user.uid } : n));
            } else {
                const docRef = await addDoc(collection(db, 'notes'), {
                    ...newNote,
                    userId: user.uid,
                    timestamp: new Date().toISOString()
                });
                setNotes([...notes, { ...newNote, id: docRef.id, userId: user.uid }]);
            }
            setNewNote({ title: '', content: '', category: '', files: [] });
            setIsDialogOpen(false);
            setIsEdit(false);
            setEditId(null);
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    const handleEdit = (note) => {
        setNewNote({ 
            title: note.title, 
            content: note.content, 
            category: note.category || '', 
            files: note.files || [] 
        });
        setIsDialogOpen(true);
        setIsEdit(true);
        setEditId(note.id);
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'notes', id));
            setNotes(notes.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const removeFile = (indexToRemove) => {
        setNewNote(prev => ({
            ...prev,
            files: prev.files.filter((_, index) => index !== indexToRemove)
        }));
    };

    // Filter notes based on search term and category
    const filteredNotes = notes.filter(note => {
        const matchesSearch = !searchTerm || 
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !searchCategory || note.category === searchCategory;
        return matchesSearch && matchesCategory;
    });

    // Clear search filters
    const clearSearch = () => {
        setSearchTerm('');
        setSearchCategory('');
    };

    return (
        <div className="notes-out">
            <div className="notes-page">
                <div className="notes-header">
                    <h2>Notes</h2>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <select
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                            className="category-filter"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        {(searchTerm || searchCategory) && (
                            <button onClick={clearSearch} className="clear-search">
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading notes...</div>
                ) : filteredNotes.length === 0 ? (
                    <div className="no-results">
                        {searchTerm || searchCategory ? 'No notes found matching your search' : 'No notes yet'}
                    </div>
                ) : (
                    <div className="notes-grid">
                        {filteredNotes.map((note) => (
                            <div key={note.id} className="note-card">
                                <h3>{note.title}</h3>
                                <p>{note.content}</p>
                                {note.category && <span className="note-category">{note.category}</span>}
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
                )}

                <button 
                    className="add-note-button"
                    onClick={() => { 
                        setIsDialogOpen(true); 
                        setIsEdit(false); 
                        setNewNote({ title: '', content: '', category: '', files: [] }); 
                    }}
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
                                className="dialog-category"
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
                            {uploading && <div className="uploading">Uploading files...</div>}
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
                                <button onClick={() => { 
                                    setIsDialogOpen(false); 
                                    setIsEdit(false); 
                                    setEditId(null); 
                                }}>
                                    Cancel
                                </button>
                                <button onClick={handleAddOrEditNote}>
                                    {isEdit ? 'Save Changes' : 'Add Note'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotesPage; 