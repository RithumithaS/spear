import React from 'react';
import Navbar from './Navbar';
import { motion } from 'motion/react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-16"
      >
        {children}
      </motion.main>
      <footer className="bg-black/80 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Film className="text-black w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tighter text-white">SPEAR</span>
              </div>
              <p className="text-white/40 max-w-sm mb-6">
                The premier networking platform for the cine-industry. Connect, collaborate, and create the future of film.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/40 hover:text-emerald-400 transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="text-white/40 hover:text-emerald-400 transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="text-white/40 hover:text-emerald-400 transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-white/40">
                <li><Link to="/directory" className="hover:text-emerald-400 transition-colors">Directory</Link></li>
                <li><Link to="/jobs" className="hover:text-emerald-400 transition-colors">Jobs</Link></li>
                <li><Link to="/locations" className="hover:text-emerald-400 transition-colors">Locations</Link></li>
                <li><Link to="/connections" className="hover:text-emerald-400 transition-colors">Connections</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-white/40">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-white/20">
            &copy; {new Date().getFullYear()} SPEAR. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

import { Film, Twitter, Instagram, Linkedin, User, LogOut, Menu, X, Briefcase, Users, MapPin, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default Layout;
