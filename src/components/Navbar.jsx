import React from 'react'
import './Navbar.css'
import { useAuth } from './AuthProvider';

function Navbar(){
    const { user, logout } = useAuth();
    return (
    <nav className = 'Navbar'>
        <h1>FocusFlow</h1>
        {user && (
          <div className="navbar-user-actions">
            <span className="navbar-user-email">{user.email}</span>
            <button className="navbar-logout" onClick={logout}>Logout</button>
          </div>
        )}
        <hr className = 'navbar-line'/>
     </nav>
    )
}

export default Navbar

