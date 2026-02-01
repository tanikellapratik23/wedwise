import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Onboarding from './components/onboarding/Onboarding';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Landing from './components/Landing';
import WhatIsVivaha from './components/WhatIsVivaha';
import DemoPage from './components/DemoPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const BASENAME = ((import.meta.env.BASE_URL as string) || '/').replace(/\/$/, '') || '/';

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    const onboarding = localStorage.getItem('onboardingCompleted');
    setIsAuthenticated(!!token);
    
    // Check if admin from token
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(decoded.isAdmin || false);
        // Admins are always considered onboarded
        if (decoded.isAdmin) {
          setHasCompletedOnboarding(true);
          return;
        }
      } catch (e) {
        setIsAdmin(false);
      }
    }
    
    // onboardingCompleted is stored as the literal string 'true' when finished
    setHasCompletedOnboarding(onboarding === 'true');
  }, []);

  useEffect(() => {
    // Respect explicit user preference stored in localStorage, otherwise follow OS setting
    const applyPref = () => {
      const stored = localStorage.getItem('theme'); // 'light' | 'dark' | null
      if (stored === 'dark') {
        document.documentElement.classList.add('dark');
        return;
      }
      if (stored === 'light') {
        document.documentElement.classList.remove('dark');
        return;
      }
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    applyPref();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      // only follow system changes when user hasn't set explicit preference
      if (!localStorage.getItem('theme')) applyPref();
    };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler as any);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler as any);
    };
  }, []);

  return (
    <Router basename={BASENAME}>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-black">
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
          
          <Route 
            path="/onboarding" 
            element={
              isAuthenticated ? (
                isAdmin ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Onboarding setHasCompletedOnboarding={setHasCompletedOnboarding} />
                )
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          <Route 
            path="/dashboard/*" 
            element={
              isAuthenticated && (isAdmin || hasCompletedOnboarding) ? (
                <Dashboard isAdmin={isAdmin} />
              ) : isAuthenticated ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          <Route
            path="/"
            element={
              isAuthenticated ? (
                isAdmin || hasCompletedOnboarding ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Navigate to="/onboarding" />
                )
              ) : (
                <Landing />
              )
            }
          />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/what-is-vivaha" element={<WhatIsVivaha />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
