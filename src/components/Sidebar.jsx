import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div className="sidebar-item" onClick={() => navigate('/')}>Home</div>
      <div className="sidebar-item" onClick={() => navigate('/todo')}>To-Do</div>
      <div className="sidebar-item" onClick={() => navigate('/notes')}>Notes</div>
      <div className="sidebar-item" onClick={() => navigate('/journal')}>Journal</div>
    </div>
  );
}

export default Sidebar; 
