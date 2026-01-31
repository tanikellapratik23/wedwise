import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Onboarding from './components/onboarding/Onboarding';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    const onboarding = localStorage.getItem('onboardingCompleted');
    setIsAuthenticated(!!token);
    setHasCompletedOnboarding(!!onboarding);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
          
          <Route 
            path="/onboarding" 
            element={
              isAuthenticated ? (
                <Onboarding setHasCompletedOnboarding={setHasCompletedOnboarding} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          <Route 
            path="/dashboard/*" 
            element={
              isAuthenticated && hasCompletedOnboarding ? (
                <Dashboard />
              ) : isAuthenticated ? (
                <Navigate to="/onboarding" />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                hasCompletedOnboarding ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Navigate to="/onboarding" />
                )
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
