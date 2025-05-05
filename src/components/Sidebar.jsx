import React from 'react'
import './Sidebar.css'

function Sidebar() {
  return (
    <nav className = 'side-navbar'>
        <ul>
            <li>Home</li>
            <li>To-Do</li>
            <li>Notes</li>
            <li>Journal</li>
        </ul>
    </nav>
  )
}

export default Sidebar