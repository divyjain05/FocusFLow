import React, { useState, useEffect} from 'react'
import Navbar from '/src/components/Navbar'
import SplashScreen from './components/SplashScreen'


function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), 3000); // 3s
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      {showSplash ? <SplashScreen /> : <Navbar />}
    </>
  );
}


export default App