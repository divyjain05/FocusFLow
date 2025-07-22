import React, { useState } from 'react';
import './TodoPage.css';
import { useCategories } from '../components/CategoryManager';

function TodoPage() {
  const categories = useCategories();
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const addTask = () => {
    if (input.trim() === '') return;
    setTasks([...tasks, { text: input, done: false, category: selectedCategory }]);
    setInput('');
    setSelectedCategory('');
  };

  const toggleDone = (index) => {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);
  };

  const deleteTask = (index) => {
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
          <li key={index} className={task.done ? 'done' : ''}>
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
