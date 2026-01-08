import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Unauthorized access component
  const UnauthorizedAccess = () => (
    <div className="min-vh-100 bg-white d-flex align-items-center justify-content-center p-4">
      <div className="card shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-4">
          <div className="text-center">
            <div className="mx-auto d-flex align-items-center justify-content-center h-12 w-12 rounded-circle bg-danger bg-opacity-10 mb-4">
              <svg className="h-6 w-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="h4 mb-3">Access Denied</h1>
            <p className="text-muted mb-4">You don't have permission to access this page.</p>
            <button
              onClick={handleLogout}
              className="btn btn-primary"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Error boundary component
  const ErrorBoundary = ({ error }) => (
    <div className="min-vh-100 bg-white d-flex align-items-center justify-content-center p-4">
      <div className="card shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-4">
          <div className="text-center">
            <div className="mx-auto d-flex align-items-center justify-content-center h-12 w-12 rounded-circle bg-danger bg-opacity-10 mb-4">
              <svg className="h-6 w-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="h4 mb-3">Something went wrong</h1>
            <p className="text-muted mb-4">{error || 'An unexpected error occurred.'}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    if (!user || !user.role) {
      return <UnauthorizedAccess />;
    }

    switch (user.role) {
      case 'student':
        return <StudentDashboard user={user} onLogout={handleLogout} />;
      case 'teacher':
        return <TeacherDashboard user={user} onLogout={handleLogout} />;
      case 'admin':
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      default:
        return <UnauthorizedAccess />;
    }
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            path="/"
            element={user ? renderDashboard() : <LoginPage onLogin={handleLogin} />}
          />
          <Route
            path="/teacher"
            element={
              <TeacherDashboard
                user={user || { username: 'Teacher', role: 'teacher' }}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/student"
            element={
              <StudentDashboard
                user={user || { username: 'Student', role: 'student' }}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/admin"
            element={
              <AdminDashboard
                user={user || { username: 'Admin', role: 'admin' }}
                onLogout={handleLogout}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
