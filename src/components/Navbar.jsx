import React from 'react';
import './Navbar.css';
import { useAuth } from './AuthProvider';
import logoFocusFlow from '../Images/logoFocusFlow.png';

function Navbar() {
    const { user, logout } = useAuth();
    return (
        <nav className="Navbar">
            <div className="navbar-brand">
                <img src={logoFocusFlow} alt="FocusFlow Logo" className="navbar-logo" />
                <h1>FocusFlow</h1>
            </div>
            {user && (
                <>
                    <div className="navbar-user-actions">
                        <span className="navbar-user-email">{user.email}</span>
                        <button className="navbar-logout" onClick={logout}>Logout</button>
                    </div>
                    <hr className="navbar-line" />
                </>
            )}
        </nav>
    );
}

export default Navbar;

