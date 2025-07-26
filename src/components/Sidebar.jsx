import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import CategoryManager from './CategoryManager';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCategories, setShowCategories] = useState(false);
  const [open, setOpen] = useState(window.innerWidth >= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        document.body.style.paddingLeft = open ? '235px' : '0';
      } else {
        document.body.style.paddingLeft = '0';
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

  // Update padding when sidebar state changes
  useEffect(() => {
    if (window.innerWidth >= 768) {
      document.body.style.paddingLeft = open ? '235px' : '0';
    }
  }, [open]);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <>
      <button
        className={`sidebar-toggle${open ? ' open' : ''}`}
        onClick={handleToggle}
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-item" onClick={() => handleNavigation('/')}>Home</div>
          <div className="sidebar-item" onClick={() => handleNavigation('/todo')}>To-Do</div>
          <div className="sidebar-item" onClick={() => handleNavigation('/notes')}>Notes</div>
          <div className="sidebar-item" onClick={() => handleNavigation('/journal')}>Journal</div>
          <div className="sidebar-item" onClick={() => setShowCategories(v => !v)}>
            {showCategories ? 'Hide Categories' : 'Show Categories'}
          </div>
          {showCategories && <CategoryManager />}
        </div>
      </aside>

      {open && window.innerWidth < 768 && (
        <div 
          className={`sidebar-overlay${open ? ' active' : ''}`} 
          onClick={handleToggle}
        />
      )}
    </>
  );
}

export default Sidebar; 
