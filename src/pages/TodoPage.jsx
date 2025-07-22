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

  // Fetch tasks from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchTasks();
  }, [user]);

  const addTask = async () => {
    if (input.trim() === '' || !user) return;
    const docRef = await addDoc(collection(db, 'tasks'), {
      text: input,
      done: false,
      category: selectedCategory,
      userId: user.uid
    });
    setTasks([...tasks, { id: docRef.id, text: input, done: false, category: selectedCategory, userId: user.uid }]);
    setInput('');
    setSelectedCategory('');
  };

  const toggleDone = async (index) => {
    const task = tasks[index];
    const updated = { ...task, done: !task.done };
    await updateDoc(doc(db, 'tasks', task.id), { done: updated.done });
    const newTasks = [...tasks];
    newTasks[index] = updated;
    setTasks(newTasks);
  };

  const deleteTask = async (index) => {
    const task = tasks[index];
    await deleteDoc(doc(db, 'tasks', task.id));
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const filteredTasks = filterCategory
    ? tasks.filter(task => task.category === filterCategory)
    : tasks;

  return (
    <div className = 'todo-out'>
    <div className="todo-page">
      <h2>To-Do List</h2>
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
      <div className="todo-filter">
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
      <ul className="todo-list">
        {filteredTasks.map((task, index) => (
          <li key={task.id} className={task.done ? 'done' : ''}>
            <input type="checkbox" onChange={() => toggleDone(index)} checked={task.done} />
            <span>{task.text}</span>
            {task.category && <span className="todo-category">[{task.category}]</span>}
            <button onClick={() => deleteTask(index)}>🗑️</button> 
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}

export default TodoPage;
