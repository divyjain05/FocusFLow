import React, { useState, useEffect} from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '/src/components/Navbar'
import SplashScreen from './components/SplashScreen'
import Sidebar from '/src/components/Sidebar'
import TodoPage from '/src/pages/TodoPage'
import HomePage from '/src/pages/HomePage'
import NotesPage from '/src/pages/NotesPage'
import JournalPage from '/src/pages/JournalPage'
import { AuthProvider, useAuth } from './components/AuthProvider';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    // Redirect to login page if not authenticated
    window.location.pathname = '/login';
    return null;
  }
  return children;
}

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
        <AuthProvider>
          <Router>
            <div className="app-container">
              <Navbar />
              <Sidebar/>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/todo" element={<TodoPage />} />
                        <Route path="/notes" element={<NotesPage />} />
                        <Route path="/journal" element={<JournalPage />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      )}
    </>
  );
}

export default App