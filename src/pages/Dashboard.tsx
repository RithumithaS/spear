import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
 // removed unused firestore imports
import { motion } from 'motion/react';
import { Users, Briefcase, MapPin, Sparkles, ArrowRight, TrendingUp, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSpearRecommendations } from '../services/aiService';
import Markdown from 'react-markdown';
import { seedInitialData } from '../utils/seed';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [recommendations, setRecommendations] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [stats, setStats] = useState({ connections: 0, jobs: 0, locations: 0 });

  useEffect(() => {
    if (profile) {
      fetchAIRecommendations();
      fetchStats();
      seedInitialData();
    }
  }, [profile]);

  const fetchAIRecommendations = async () => {
    setLoadingAI(true);
    const context = `User: ${profile?.name}, Role: ${profile?.role}, Skills: ${profile?.skills?.join(', ') || 'None'}`;
    const recs = await getSpearRecommendations(context);
    setRecommendations(recs);
    setLoadingAI(false);
  };

  const fetchStats = async () => {
    // Mocking stats for now, but in a real app we'd count documents
    setStats({ connections: 12, jobs: 5, locations: 3 });
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between mb-12 gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
              Welcome, <span className="text-emerald-500">{profile?.name || 'Artist'}</span>
            </h1>
            <p className="text-white/40 font-medium">
              Here's what's happening in your cine-network today.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/profile/edit" className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 transition-colors">
              Edit Profile
            </Link>
            <Link to="/jobs/new" className="px-6 py-2 bg-emerald-500 text-black rounded-full text-sm font-bold hover:bg-emerald-400 transition-colors">
              Post a Job
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 bg-zinc-900/50 border border-white/10 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-5 h-5 text-emerald-500" />
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-black">{stats.connections}</div>
                <div className="text-xs uppercase tracking-widest text-white/40 mt-1">Connections</div>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-white/10 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <Briefcase className="w-5 h-5 text-emerald-500" />
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-black">{stats.jobs}</div>
                <div className="text-xs uppercase tracking-widest text-white/40 mt-1">Job Matches</div>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-white/10 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-black">{stats.locations}</div>
                <div className="text-xs uppercase tracking-widest text-white/40 mt-1">Saved Locations</div>
              </div>
            </div>

            {/* Recent Activity / Feed */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span>Industry Feed</span>
              </h3>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex space-x-4 pb-6 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-sm">Production House {i}</h4>
                        <span className="text-[10px] text-white/20 uppercase">2h ago</span>
                      </div>
                      <p className="text-sm text-white/60 mb-3">
                        Looking for a Director of Photography for an upcoming feature film in Mumbai. Must have experience with anamorphic lenses.
                      </p>
                      <div className="flex items-center space-x-4">
                        <button className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400">Apply Now</button>
                        <button className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white">Save</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* AI Recommendations */}
            <div className="bg-emerald-500 text-black rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                <Sparkles className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4 flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>SPEAR AI</span>
              </h3>
              <div className="text-sm font-medium leading-relaxed mb-6">
                {loadingAI ? (
                  <div className="flex items-center space-x-2 animate-pulse">
                    <div className="w-2 h-2 bg-black rounded-full" />
                    <div className="w-2 h-2 bg-black rounded-full" />
                    <div className="w-2 h-2 bg-black rounded-full" />
                  </div>
                ) : (
                  <div className="markdown-body prose prose-invert prose-sm max-w-none text-black">
                    <Markdown>{recommendations}</Markdown>
                  </div>
                )}
              </div>
              <button 
                onClick={fetchAIRecommendations}
                className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Refresh Insights
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-white/40">Quick Actions</h3>
              <div className="space-y-2">
                <Link to="/connections" className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                  <span className="text-sm font-bold">Find Collaborators</span>
                  <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/locations" className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                  <span className="text-sm font-bold">Book a Set</span>
                  <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/messages" className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                  <span className="text-sm font-bold">Messages</span>
                  <MessageSquare className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
