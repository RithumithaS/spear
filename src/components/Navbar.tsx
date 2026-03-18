import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { Film, User, LogOut, Menu, X, Briefcase, Users, MapPin, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Navbar: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Film className="w-4 h-4" /> },
    { name: 'Connections', path: '/connections', icon: <Users className="w-4 h-4" />, auth: true },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase className="w-4 h-4" />, auth: true },
    { name: 'Locations', path: '/locations', icon: <MapPin className="w-4 h-4" />, auth: true },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, auth: true },
    { name: 'Admin', path: '/admin', icon: <User className="w-4 h-4" />, auth: true, admin: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Film className="text-black w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">SPEAR</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              (!link.auth || user) && (!link.admin || isAdmin) && (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm font-medium text-white/70 hover:text-emerald-400 transition-colors flex items-center space-x-1"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              )
            ))}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to={`/profile/${user.uid}`} className="flex items-center space-x-2 text-sm font-medium text-white/70 hover:text-emerald-400">
                  {profile?.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span>{profile?.name || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/70 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white">Login</Link>
                <Link to="/register" className="px-4 py-2 bg-emerald-500 text-black text-sm font-bold rounded-full hover:bg-emerald-400 transition-colors">Join Now</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white/70 hover:text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                (!link.auth || user) && (!link.admin || isAdmin) && (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-white/70 hover:text-emerald-400 hover:bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      {link.icon}
                      <span>{link.name}</span>
                    </div>
                  </Link>
                )
              ))}
              {user ? (
                <>
                  <Link
                    to={`/profile/${user.uid}`}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-white/70 hover:text-emerald-400 hover:bg-white/5 rounded-lg"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:bg-white/5 rounded-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="pt-4 flex flex-col space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-center text-base font-medium text-white/70 hover:text-white border border-white/20 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-center text-base font-medium bg-emerald-500 text-black rounded-lg"
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
