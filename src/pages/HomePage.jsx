import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../components/AuthProvider';
import './HomePage.css';

function HomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [todos, setTodos] = useState([]);
    const [notes, setNotes] = useState([]);
    const [journal, setJournal] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch recent incomplete todos
                const todosQuery = query(
                    collection(db, 'tasks'),
                    where('userId', '==', user.uid),
                    where('done', '==', false),
                    orderBy('timestamp', 'desc'),
                    limit(3)
                );
                const todoSnap = await getDocs(todosQuery);
                setTodos(todoSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch recent notes
                const notesQuery = query(
                    collection(db, 'notes'),
                    where('userId', '==', user.uid),
                    orderBy('timestamp', 'desc'),
                    limit(3)
                );
                const notesSnap = await getDocs(notesQuery);
                setNotes(notesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch most recent journal entry
                const journalQuery = query(
                    collection(db, 'journals'),
                    where('userId', '==', user.uid),
                    orderBy('date', 'desc'),
                    limit(1)
                );
                const journalSnap = await getDocs(journalQuery);
                if (!journalSnap.empty) {
                    setJournal({ id: journalSnap.docs[0].id, ...journalSnap.docs[0].data() });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="home-page">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <h2>Welcome Back!</h2>
            
            <div className="dashboard-grid">
                <div className="dashboard-card todo-card" onClick={() => navigate('/todo')}>
                    <div className="card-header">
                        <h3>Recent Tasks</h3>
                        <span className="task-count">{todos.length} pending</span>
                    </div>
                    <div className="card-content">
                        {todos.length > 0 ? (
                            <ul className="preview-list">
                                {todos.map(todo => (
                                    <li key={todo.id} className="preview-item">
                                        <span className="todo-text">{todo.text}</span>
                                        {todo.category && (
                                            <span className="category-tag">{todo.category}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-message">No pending tasks</p>
                        )}
                    </div>
                    <div className="card-footer">
                        <button className="view-all-btn">View All Tasks →</button>
                    </div>
                </div>

                <div className="dashboard-card notes-card" onClick={() => navigate('/notes')}>
                    <div className="card-header">
                        <h3>Recent Notes</h3>
                    </div>
                    <div className="card-content">
                        {notes.length > 0 ? (
                            <ul className="preview-list">
                                {notes.map(note => (
                                    <li key={note.id} className="preview-item">
                                        <span className="note-title">{note.title}</span>
                                        {note.category && (
                                            <span className="category-tag">{note.category}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-message">No notes yet</p>
                        )}
                    </div>
                    <div className="card-footer">
                        <button className="view-all-btn">View All Notes →</button>
                    </div>
                </div>

                <div className="dashboard-card journal-card" onClick={() => navigate('/journal')}>
                    <div className="card-header">
                        <h3>Latest Journal Entry</h3>
                        {journal && (
                            <span className="journal-date">
                                {new Date(journal.date).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                    <div className="card-content">
                        {journal ? (
                            <div className="journal-preview">
                                <h4>{journal.title}</h4>
                                <p>{journal.content.substring(0, 150)}...</p>
                                {journal.category && (
                                    <span className="category-tag">{journal.category}</span>
                                )}
                            </div>
                        ) : (
                            <p className="empty-message">No journal entries yet</p>
                        )}
                    </div>
                    <div className="card-footer">
                        <button className="view-all-btn">View Journal →</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
