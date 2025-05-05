import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'

function HomePage(){
    const navigate = useNavigate()

    return (
        <div className = 'home-page'>
            <div className = 'top-row'>
                <div className = 'box-todo' onClick={() => navigate('/todo')}>
                    <h3>To-Do</h3>
                    <p>3 Kaam Bacche hai</p>
                </div>
                <div>
                    <div className = 'box-notes' onClick={() => navigate('/notes')}>
                        <h3>Notes</h3>
                        <p>View saved notes</p>
                    </div>
                </div>
                <div>
                <div className = 'box-journal' onClick={() => navigate('/journal')}>
                        <h3>Journal</h3>
                        <p>I hate Coding!</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage;
