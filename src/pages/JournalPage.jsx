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
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [newJournal, setNewJournal] = useState({
        title: '',
        content: '',
        files: [],
        date: new Date(),
        category: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user) return;
        fetchJournals();
    }, [user]);

    const fetchJournals = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'journals'), where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            setJournals(snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(), 
                date: doc.data().date ? new Date(doc.data().date) : new Date() 
            })));
        } catch (error) {
            console.error('Error fetching journals:', error);
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
                const storageRef = ref(storage, `journals/${user.uid}/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                return { name: file.name, url };
            }));
            setNewJournal(prev => ({ ...prev, files: [...(prev.files || []), ...uploadedFiles] }));
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleAddOrEditJournal = async () => {
        if (newJournal.content.trim() === '' || !user) return;
        try {
            if (isEdit && editId) {
                await updateDoc(doc(db, 'journals', editId), {
                    ...newJournal,
                    userId: user.uid,
                    date: newJournal.date.toISOString()
                });
                setJournals(journals.map(j => j.id === editId ? { ...newJournal, id: editId, userId: user.uid } : j));
            } else {
                const docRef = await addDoc(collection(db, 'journals'), {
                    ...newJournal,
                    userId: user.uid,
                    date: new Date().toISOString()
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
        } catch (error) {
            console.error('Error saving journal:', error);
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
        try {
            await deleteDoc(doc(db, 'journals', id));
            setJournals(journals.filter(j => j.id !== id));
        } catch (error) {
            console.error('Error deleting journal:', error);
        }
    };

    const removeFile = (indexToRemove) => {
        setNewJournal(prev => ({
            ...prev,
            files: prev.files.filter((_, index) => index !== indexToRemove)
        }));
    };

    // Filter journals based on search term and category
    const filteredJournals = journals.filter(journal => {
        const matchesSearch = !searchTerm || 
            journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            journal.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !searchCategory || journal.category === searchCategory;
        return matchesSearch && matchesCategory;
    });

    // Clear search filters
    const clearSearch = () => {
        setSearchTerm('');
        setSearchCategory('');
    };

    return (
        <div className="journal-out">
            <div className="journal-page">
                <div className="journal-header">
                    <h2>Journal</h2>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search journals..."
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
                    <div className="loading">Loading journals...</div>
                ) : filteredJournals.length === 0 ? (
                    <div className="no-results">
                        {searchTerm || searchCategory ? 'No journals found matching your search' : 'No journals yet'}
                    </div>
                ) : (
                    <div className="journals-container">
                        {filteredJournals.map((journal) => (
                            <div key={journal.id} className="journal-entry">
                                <div className="journal-header">
                                    <h3 className="journal-title">{journal.title}</h3>
                                    <span className="journal-date">
                                        {journal.date.toLocaleDateString()}
                                    </span>
                                    {journal.category && (
                                        <span className="journal-category">{journal.category}</span>
                                    )}
                                </div>
                                <p className="journal-content">{journal.content}</p>
                                {journal.files && journal.files.length > 0 && (
                                    <div className="journal-attachments">
                                        {journal.files.map((file, index) => (
                                            <a key={index} 
                                               href={file.url} 
                                               target="_blank" 
                                               rel="noopener noreferrer"
                                               className="attachment-item"
                                            >
                                                {file.name}
                                            </a>
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
                )}

                <button 
                    className="add-journal-button"
                    onClick={() => {
                        setIsDialogOpen(true);
                        setIsEdit(false);
                        setNewJournal({
                            title: '',
                            content: '',
                            files: [],
                            date: new Date(),
                            category: ''
                        });
                    }}
                >
                    +
                </button>

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
                            {newJournal.files && newJournal.files.length > 0 && (
                                <div className="selected-files">
                                    {newJournal.files.map((file, index) => (
                                        <div key={index} className="selected-file-item">
                                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                {file.name}
                                            </a>
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
                                <button onClick={handleAddOrEditJournal}>
                                    {isEdit ? 'Save Changes' : 'Add Journal'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default JournalPage;