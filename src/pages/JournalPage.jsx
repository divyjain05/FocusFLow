import React, { useState, useEffect } from 'react';
import './JournalPage.css';
import { useCategories } from '../components/CategoryManager';
import { db } from '../firebase';
import { useAuth } from '../components/AuthProvider';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function JournalPage() {
    const categories = useCategories();
    const { user } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [journals, setJournals] = useState([]);
    const [newJournal, setNewJournal] = useState({
        title: '',
        content: '',
        files: [],
        date: new Date(),
        category: ''
    });
    const [filterCategory, setFilterCategory] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchJournals = async () => {
            const q = query(collection(db, 'journals'), where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            setJournals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), date: doc.data().date ? new Date(doc.data().date) : new Date() })));
        };
        fetchJournals();
    }, [user]);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        setUploading(true);
        const storage = getStorage();
        const uploadedFiles = await Promise.all(files.map(async (file) => {
            const storageRef = ref(storage, `journals/${user.uid}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            return { name: file.name, url };
        }));
        setNewJournal(prev => ({ ...prev, files: [...(prev.files || []), ...uploadedFiles] }));
        setUploading(false);
    };

    const handleAddOrEditJournal = async () => {
        if (newJournal.content.trim() !== '' && user) {
            if (isEdit && editId) {
                await updateDoc(doc(db, 'journals', editId), {
                    ...newJournal,
                    userId: user.uid,
                    date: newJournal.date.toISOString ? newJournal.date.toISOString() : newJournal.date
                });
                setJournals(journals.map(j => j.id === editId ? { ...newJournal, id: editId, userId: user.uid, date: newJournal.date } : j));
            } else {
                const docRef = await addDoc(collection(db, 'journals'), {
                    ...newJournal,
                    userId: user.uid,
                    date: new Date().toISOString(),
                });
                setJournals([{ ...newJournal, id: docRef.id, userId: user.uid, date: new Date() }, ...journals]);
            }
            setNewJournal({
                title: '',
                content: '',
                files: [],
                date: new Date(),
                category: ''
            });
            setIsDialogOpen(false);
            setIsEdit(false);
            setEditId(null);
        }
    };

    const handleEdit = (journal) => {
        setNewJournal({
            title: journal.title,
            content: journal.content,
            files: journal.files || [],
            date: journal.date,
            category: journal.category || ''
        });
        setIsDialogOpen(true);
        setIsEdit(true);
        setEditId(journal.id);
    };

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, 'journals', id));
        setJournals(journals.filter(j => j.id !== id));
    };

    const removeFile = (indexToRemove) => {
        setNewJournal(prev => ({
            ...prev,
            files: prev.files.filter((_, index) => index !== indexToRemove)
        }));
    };

    const filteredJournals = filterCategory
        ? journals.filter(journal => journal.category === filterCategory)
        : journals;

    return (
        <div className="journal-page">
            <div className="journal-filter">
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
            <button 
                className="add-journal-button"
                onClick={() => { setIsDialogOpen(true); setIsEdit(false); setNewJournal({ title: '', content: '', files: [], date: new Date(), category: '' }); }}
            >
                +
            </button>

            <div className="journals-container">
                {filteredJournals.map((journal) => (
                    <div key={journal.id} className="journal-entry">
                        <div className="journal-header">
                            <h2>{journal.title}</h2>
                            <span className="journal-date">
                                {journal.date.toLocaleDateString()}
                            </span>
                            {journal.category && <span className="journal-category">[{journal.category}]</span>}
                        </div>
                        <p className="journal-content">{journal.content}</p>
                        {journal.files && journal.files.length > 0 && (
                            <div className="journal-attachments">
                                {journal.files.map((file, index) => (
                                    <a key={index} className="attachment-item" href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                                ))}
                            </div>
                        )}
                        <div className="journal-actions">
                            <button onClick={() => handleEdit(journal)}>Edit</button>
                            <button onClick={() => handleDelete(journal.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {isDialogOpen && (
                <div className="dialog-overlay">
                    <div className="journal-dialog">
                        <input
                            type="text"
                            placeholder="Journal Title"
                            value={newJournal.title}
                            onChange={(e) => setNewJournal({ ...newJournal, title: e.target.value })}
                            className="dialog-title"
                        />
                        <textarea
                            placeholder="Write your thoughts..."
                            value={newJournal.content}
                            onChange={(e) => setNewJournal({ ...newJournal, content: e.target.value })}
                            className="dialog-content"
                        />
                        <select
                            value={newJournal.category}
                            onChange={e => setNewJournal({ ...newJournal, category: e.target.value })}
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
                        {newJournal.files && newJournal.files.length > 0 && (
                            <div className="selected-files">
                                {newJournal.files.map((file, index) => (
                                    <div key={index} className="selected-file-item">
                                        <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                                        <button onClick={() => removeFile(index)}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="dialog-actions">
                            <button onClick={() => { setIsDialogOpen(false); setIsEdit(false); setEditId(null); }}>Cancel</button>
                            <button onClick={handleAddOrEditJournal}>{isEdit ? 'Save Changes' : 'Save Journal'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JournalPage;