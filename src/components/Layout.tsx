import React from 'react';
import Navbar from './Navbar';
import { motion } from 'motion/react';
import { Film, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-16"
      >
        {children}
      </motion.main>
      <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                  <Film className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">SPEAR</span>
              </div>
              <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
                The premier networking platform for the cine-industry. Connect, collaborate, and create the future of film.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><Link to="/connections" className="hover:text-emerald-600 transition-colors">Connections</Link></li>
                <li><Link to="/jobs" className="hover:text-emerald-600 transition-colors">Jobs</Link></li>
                <li><Link to="/locations" className="hover:text-emerald-600 transition-colors">Locations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200 text-center text-xs font-medium text-slate-400">
            &copy; {new Date().getFullYear()} SPEAR. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
