import React, { useState, useEffect} from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '/src/components/Navbar'
import SplashScreen from './components/SplashScreen'
import Sidebar from '/src/components/Sidebar'
import TodoPage from '/src/pages/TodoPage'
import HomePage from '/src/pages/HomePage'


function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), 3000); // 3s
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      {showSplash ? (
        <SplashScreen />
      ) : (
        <Router>
          <Navbar />
          <Sidebar/>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/todo" element={<TodoPage />} />
          {/* <Route path="/notes" element={<NotesPage />} /> */}
          {/* <Route path="/journal" element={<JournalPage />} /> */}
          </Routes>
      </Router>
    )}
    </>
  );
}


export default App