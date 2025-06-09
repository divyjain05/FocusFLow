import React from 'react';
import { useNavigate } from 'react-router-dom';

import './HomePage.css'

function HomePage(){
    const navigate = useNavigate()

    // showing data - needs to replaced with data which will be fetched.
    //temp data for reference
    const todoPreview = [
        "Complete project documentation",
        "Review pull requests",
        "Setup meeting with team"
    ];

    const notesPreview = [
        "Meeting notes from yesterday",
        "Project ideas"
    ];

    return (
       <> 
        <div className='home-page'>
            <div className='top-row'>
                <div className='box' onClick={() => navigate('/todo')}>
                    <h3>To-Do</h3>
                    <div className='preview-list'>
                        {todoPreview.map((todo, index) => (
                            <div key={index} className='preview-item'>
                                {todo}
                            </div>
                        ))}
                    </div>
                    <p>{todoPreview.length} tasks remaining</p>
                </div>
                <div className='box' onClick={() => navigate('/notes')}>
                    <h3>Notes</h3>
                    <div className='preview-list'>
                        {notesPreview.map((note, index) => (
                            <div key={index} className='preview-item'>
                                {note}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className='bottom-box' onClick={() => navigate('/journal')}>
                <h3>Journal</h3>
                <div className='preview-item'>
                    <p>Latest Entry: Today's Reflections</p>
                    <p>Start writing your thoughts for today...</p>
                </div>
            </div>
        </div>
       </>
    )
}

export default HomePage;
