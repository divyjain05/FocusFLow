import React, { useState, useEffect } from 'react';
import './TodoPage.css';
import { useCategories } from '../components/CategoryManager';
import { db } from '../firebase';
import { useAuth } from '../components/AuthProvider';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

function TodoPage() {
  const categories = useCategories();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch tasks from Firestore
  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const addTask = async () => {
    if (input.trim() === '' || !user) return;
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        text: input,
        done: false,
        category: selectedCategory,
        userId: user.uid,
        timestamp: new Date().toISOString()
      });
      setTasks([...tasks, { id: docRef.id, text: input, done: false, category: selectedCategory, userId: user.uid }]);
      setInput('');
      setSelectedCategory('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleDone = async (index) => {
    const task = tasks[index];
    try {
      const updated = { ...task, done: !task.done };
      await updateDoc(doc(db, 'tasks', task.id), { done: updated.done });
      const newTasks = [...tasks];
      newTasks[index] = updated;
      setTasks(newTasks);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (index) => {
    const task = tasks[index];
    try {
      await deleteDoc(doc(db, 'tasks', task.id));
      setTasks(tasks.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Filter tasks based on search term and category
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !searchCategory || task.category === searchCategory;
    return matchesSearch && matchesCategory;
  });

  // Clear search filters
  const clearSearch = () => {
    setSearchTerm('');
    setSearchCategory('');
  };

  return (
    <div className="todo-out">
      <div className="todo-page">
        <div className="todo-header">
          <h2>To-Do List</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search tasks..."
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

        <div className="todo-input">
          <input
            type="text"
            placeholder="Add a new task..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">No Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <button onClick={addTask}>Add</button>
        </div>

        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="no-results">
            {searchTerm || searchCategory ? 'No tasks found matching your search' : 'No tasks yet'}
          </div>
        ) : (
          <ul className="todo-list">
            {filteredTasks.map((task, index) => (
              <li key={task.id} className={task.done ? 'done' : ''}>
                <input 
                  type="checkbox" 
                  onChange={() => toggleDone(index)} 
                  checked={task.done}
                />
                <span>{task.text}</span>
                {task.category && <span className="todo-category">[{task.category}]</span>}
                <button onClick={() => deleteTask(index)}>🗑️</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TodoPage;
