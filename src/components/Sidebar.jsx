import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import CategoryManager from './CategoryManager';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCategories, setShowCategories] = useState(false);
  const [open, setOpen] = useState(window.innerWidth >= 768);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        document.body.style.paddingLeft = open ? '260px' : '0';
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
      document.body.style.paddingLeft = open ? '260px' : '0';
    }
  }, [open]);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setOpen(false);
    }
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
      <div className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-item" onClick={() => handleNavigation('/')}>Home</div>
        <div className="sidebar-item" onClick={() => handleNavigation('/todo')}>To-Do</div>
        <div className="sidebar-item" onClick={() => handleNavigation('/notes')}>Notes</div>
        <div className="sidebar-item" onClick={() => handleNavigation('/journal')}>Journal</div>
        <div className="sidebar-item" onClick={() => setShowCategories(v => !v)}>
          {showCategories ? 'Hide Categories' : 'Show Categories'}
        </div>
        {showCategories && <CategoryManager />}
      </div>
      <div 
        className={`sidebar-overlay${open ? ' active' : ''}`} 
        onClick={() => setOpen(false)}
      />
    </>
  );
}

export default Sidebar; 
