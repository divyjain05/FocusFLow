import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../components/AuthProvider';
import { useCategories } from '../components/CategoryManager';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const categories = useCategories();
  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchResults, setSearchResults] = useState({
    todos: [],
    notes: [],
    journals: []
  });
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch initial data
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

  // Search functionality
  const handleSearch = async () => {
    if (!searchTerm.trim() && !searchCategory) return;
    
    setLoading(true);
    try {
      let todoResults = [], noteResults = [], journalResults = [];

      // Build base queries
      const buildQuery = (collectionName) => {
        let conditions = [where('userId', '==', user.uid)];
        
        if (searchCategory) {
          conditions.push(where('category', '==', searchCategory));
        }
        
        return query(collection(db, collectionName), ...conditions);
      };

      // Search in todos
      const todosQuery = buildQuery('tasks');
      const todoSnap = await getDocs(todosQuery);
      todoResults = todoSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(todo => 
          !searchTerm || 
          todo.text.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Search in notes
      const notesQuery = buildQuery('notes');
      const notesSnap = await getDocs(notesQuery);
      noteResults = notesSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(note => 
          !searchTerm || 
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Search in journals
      const journalsQuery = buildQuery('journals');
      const journalsSnap = await getDocs(journalsQuery);
      journalResults = journalsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(journal => 
          !searchTerm || 
          journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          journal.content.toLowerCase().includes(searchTerm.toLowerCase())
        );

      setSearchResults({
        todos: todoResults,
        notes: noteResults,
        journals: journalResults
      });
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes
  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value && !searchCategory) {
      setShowSearchResults(false);
    }
  };

  // Handle category selection changes
  const handleCategoryChange = (e) => {
    setSearchCategory(e.target.value);
    if (!e.target.value && !searchTerm) {
      setShowSearchResults(false);
    }
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h2>Welcome Back!</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search in todos, notes, and journals..."
            value={searchTerm}
            onChange={handleSearchInput}
            className="search-input"
          />
          <select
            value={searchCategory}
            onChange={handleCategoryChange}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <button onClick={handleSearch} className="search-button">
            Search
          </button>
        </div>
      </div>

      {showSearchResults ? (
        <div className="search-results">
          <h3>Search Results</h3>
          
          {/* Todo Results */}
          <div className="result-section">
            <h4>Tasks ({searchResults.todos.length})</h4>
            {searchResults.todos.map(todo => (
              <div key={todo.id} className="result-item" onClick={() => navigate('/todo')}>
                <span>{todo.text}</span>
                {todo.category && <span className="category-tag">{todo.category}</span>}
              </div>
            ))}
          </div>

          {/* Notes Results */}
          <div className="result-section">
            <h4>Notes ({searchResults.notes.length})</h4>
            {searchResults.notes.map(note => (
              <div key={note.id} className="result-item" onClick={() => navigate('/notes')}>
                <span>{note.title}</span>
                {note.category && <span className="category-tag">{note.category}</span>}
              </div>
            ))}
          </div>

          {/* Journal Results */}
          <div className="result-section">
            <h4>Journal Entries ({searchResults.journals.length})</h4>
            {searchResults.journals.map(journal => (
              <div key={journal.id} className="result-item" onClick={() => navigate('/journal')}>
                <span>{journal.title}</span>
                {journal.category && <span className="category-tag">{journal.category}</span>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Original dashboard content */}
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
      )}
    </div>
  );
}

export default HomePage;
