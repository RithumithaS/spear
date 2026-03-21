import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { jobApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, MapPin, Save, ArrowLeft, User } from 'lucide-react';

const JobNew: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roleRequired, setRoleRequired] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await jobApi.create({
        title,
        description,
        roleRequired,
        location,
        postedBy: user.uid,
      });
      navigate('/jobs');
    } catch (error) {
      console.error("Error creating job:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-slate-500 font-medium hover:text-emerald-600 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Opportunities</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50" />
          
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-10 relative z-10">
            Post a <span className="text-emerald-600">Job</span>
          </h1>
          
          <form onSubmit={handleSave} className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Job Title</label>
              <div className="relative group shadow-sm rounded-xl">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  placeholder="e.g. Lead Actor for Short Film"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Role Required</label>
              <div className="relative group shadow-sm rounded-xl">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  value={roleRequired}
                  onChange={(e) => setRoleRequired(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  placeholder="e.g. Cinematographer"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Location</label>
              <div className="relative group shadow-sm rounded-xl">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  placeholder="e.g. Hyderabad, Telangana"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Description</label>
              <div className="relative group shadow-sm rounded-xl">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  placeholder="Describe the project and requirements..."
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.98] mt-4"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Posting...' : 'Post Job'}</span>
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default JobNew;
