import React, { useState } from 'react';
import './JournalPage.css';

function JournalPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [journals, setJournals] = useState([]);
    const [newJournal, setNewJournal] = useState({
        title: '',
        content: '',
        files: [],
        date: new Date()
    });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewJournal(prev => ({
            ...prev,
            files: [...prev.files, ...files]
        }));
    };

    const handleAddJournal = () => {
        if (newJournal.content.trim() !== '') {
            setJournals([{
                ...newJournal,
                id: Date.now(),
                date: new Date()
            }, ...journals]);
            setNewJournal({
                title: '',
                content: '',
                files: [],
                date: new Date()
            });
            setIsDialogOpen(false);
        }
    };

    const removeFile = (indexToRemove) => {
        setNewJournal(prev => ({
            ...prev,
            files: prev.files.filter((_, index) => index !== indexToRemove)
        }));
    };

    return (
        <div className="journal-page">
            <button 
                className="add-journal-button"
                onClick={() => setIsDialogOpen(true)}
            >
                +
            </button>

            <div className="journals-container">
                {journals.map((journal) => (
                    <div key={journal.id} className="journal-entry">
                        <div className="journal-header">
                            <h2>{journal.title}</h2>
                            <span className="journal-date">
                                {journal.date.toLocaleDateString()}
                            </span>
                        </div>
                        <p className="journal-content">{journal.content}</p>
                        {journal.files.length > 0 && (
                            <div className="journal-attachments">
                                {journal.files.map((file, index) => (
                                    <div key={index} className="attachment-item">
                                        {file.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isDialogOpen && (
                <div className="dialog-overlay">
                    <div className="journal-dialog">
                        <input
                            type="text"
                            placeholder="Journal Title"
                            value={newJournal.title}
                            onChange={(e) => setNewJournal({ ...newJournal, title: e.target.value })}
                            className="dialog-title"
                        />
                        <textarea
                            placeholder="Write your thoughts..."
                            value={newJournal.content}
                            onChange={(e) => setNewJournal({ ...newJournal, content: e.target.value })}
                            className="dialog-content"
                        />
                        <div className="file-upload-section">
                            <input
                                type="file"
                                multiple
                                accept=".jpeg,.jpg,.png,.heic,.pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="file-input"
                                id="file-input"
                            />
                            <label htmlFor="file-input" className="file-input-label">
                                Add Files
                            </label>
                            {newJournal.files.length > 0 && (
                                <div className="selected-files">
                                    {newJournal.files.map((file, index) => (
                                        <div key={index} className="selected-file-item">
                                            <span>{file.name}</span>
                                            <button onClick={() => removeFile(index)}>×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="dialog-actions">
                            <button onClick={() => setIsDialogOpen(false)}>Cancel</button>
                            <button onClick={handleAddJournal}>Save Journal</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JournalPage;