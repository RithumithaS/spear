import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { auth } from './firebase';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import PortfolioNew from './pages/PortfolioNew';
import Connections from './pages/Connections';
import Jobs from './pages/Jobs';
import JobNew from './pages/JobNew';
import Locations from './pages/Locations';
import LocationNew from './pages/LocationNew';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import Messages from './pages/Messages';
import ApplyJob from './pages/ApplyJob';
import JobApplications from './pages/JobApplications';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user && !auth.currentUser) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAdmin) return <Navigate to="/admin/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth key="login-page" mode="login" />} />
        <Route path="/register" element={<Auth key="register-page" mode="register" />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
        <Route path="/portfolio/new" element={<ProtectedRoute><PortfolioNew /></ProtectedRoute>} />
        <Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/jobs/new" element={<ProtectedRoute><JobNew /></ProtectedRoute>} />
        <Route path="/jobs/responses" element={<ProtectedRoute><JobApplications /></ProtectedRoute>} />
        <Route path="/apply/:id" element={<ProtectedRoute><ApplyJob /></ProtectedRoute>} />
        <Route path="/locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />
        <Route path="/locations/new" element={<ProtectedRoute><LocationNew /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
