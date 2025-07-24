import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import CategoryManager from './CategoryManager';

function Sidebar() {
  const navigate = useNavigate();
  const [showCategories, setShowCategories] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={`sidebar-toggle${open ? ' open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>
      <div className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-item" onClick={() => { navigate('/'); setOpen(false); }}>Home</div>
        <div className="sidebar-item" onClick={() => { navigate('/todo'); setOpen(false); }}>To-Do</div>
        <div className="sidebar-item" onClick={() => { navigate('/notes'); setOpen(false); }}>Notes</div>
        <div className="sidebar-item" onClick={() => { navigate('/journal'); setOpen(false); }}>Journal</div>
        <div className="sidebar-item" onClick={() => setShowCategories(v => !v)}>
          {showCategories ? 'Hide Categories' : 'Categories'}
        </div>
        {showCategories && <CategoryManager />}
      </div>
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)}></div>}
    </>
  );
}

export default Sidebar; 
