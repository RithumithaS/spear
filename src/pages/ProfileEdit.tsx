import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { User, Mail, FileText, Code, Save, ArrowLeft } from 'lucide-react';

const ProfileEdit: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBio(profile.bio || '');
      setSkills(profile.skills?.join(', ') || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await userApi.update(user.uid, {
        name,
        bio,
        skills: skills.split(',').map(s => s.trim()).filter(s => s !== ''),
      });
      await refreshProfile();
      
      navigate(`/profile/${user.uid}`);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-slate-500 font-medium hover:text-emerald-600 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Profile</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50" />
          
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-10 relative z-10">
            Edit <span className="text-emerald-600">Profile</span>
          </h1>
          
          <form onSubmit={handleSave} className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
              <div className="relative group shadow-sm rounded-xl">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Bio</label>
              <div className="relative group shadow-sm rounded-xl">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  placeholder="Tell the industry about yourself..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Skills (comma separated)</label>
              <div className="relative group shadow-sm rounded-xl">
                <Code className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  placeholder="Directing, Cinematography, Editing..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.98] mt-4"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileEdit;
