import React, { useState } from 'react';
import './TodoPage.css';

function TodoPage() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  const addTask = () => {
    if (input.trim() === '') return;
    setTasks([...tasks, { text: input, done: false }]);
    setInput('');
  };

  const toggleDone = (index) => {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);
  };

  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

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
        <button onClick={addTask}>Add</button>
      </div>
      <ul className="todo-list">
        {tasks.map((task, index) => (
          <li key={index} className={task.done ? 'done' : ''}>
            <input type="checkbox" onChange={() => toggleDone(index)} checked={task.done} />
            <span>{task.text}</span>
            <button onClick={() => deleteTask(index)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}

export default TodoPage;
