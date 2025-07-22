import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import CategoryManager from './CategoryManager';

function Sidebar() {
  const navigate = useNavigate();
  const [showCategories, setShowCategories] = useState(false);

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-item" onClick={() => navigate('/')}>Home</div>
        <div className="sidebar-item" onClick={() => navigate('/todo')}>To-Do</div>
        <div className="sidebar-item" onClick={() => navigate('/notes')}>Notes</div>
        <div className="sidebar-item" onClick={() => navigate('/journal')}>Journal</div>
        <div className="sidebar-item" onClick={() => setShowCategories(v => !v)}>
          {showCategories ? 'Hide Categories' : 'Categories'}
        </div>
      </div>
      {showCategories && <CategoryManager />}
    </>
  );
}

export default Sidebar; 
