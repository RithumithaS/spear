import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Users, Briefcase, MapPin, Sparkles, ArrowRight, TrendingUp, MessageSquare, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSpearRecommendations } from '../services/aiService';
import Markdown from 'react-markdown';
import { seedInitialData } from '../utils/seed';
import { jobApi, statsApi } from '../services/api';
import { JobPosting } from '../types';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [recommendations, setRecommendations] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [stats, setStats] = useState({ connections: 0, jobs: 0, locations: 0 });
  const [recentJobs, setRecentJobs] = useState<JobPosting[]>([]);

  useEffect(() => {
    if (profile) {
      fetchAIRecommendations();
      fetchStats();
      fetchRecentJobs();
      seedInitialData();
    }
  }, [profile]);

  const fetchAIRecommendations = async () => {
    setLoadingAI(true);
    try {
      const context = `User: ${profile?.name}, Role: ${profile?.role}, Skills: ${profile?.skills?.join(', ') || 'None'}`;
      const recs = await getSpearRecommendations(context);
      setRecommendations(recs);
    } catch (e) {
      setRecommendations('Check back later for personalized recommendations.');
    }
    setLoadingAI(false);
  };

  const fetchStats = async () => {
    try {
      const data = await statsApi.getStats(user?.uid);
      setStats({
        connections: data.userConnections || 0,
        jobs: data.totalJobs || 0,
        locations: data.totalLocations || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRecentJobs = async () => {
    try {
      const jobs = await jobApi.getAll() as JobPosting[];
      setRecentJobs(jobs.slice(0, 3));
    } catch (error) {
      console.error("Error fetching recent jobs:", error);
    }
  };

  if (!user) return null;

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between mb-12 gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
              Welcome, <span className="text-emerald-600">{profile?.name || 'Artist'}</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Here's what's happening in your cine-network today.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/profile/edit" className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all">
              Edit Profile
            </Link>
            <Link to="/jobs/new" className="px-6 py-2.5 bg-emerald-600 text-white rounded-full text-sm font-bold shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>Post a Job</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div whileHover={{ y: -2 }} className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-50 pointer-events-none" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-3xl font-black text-slate-900">{stats.connections}</div>
                <div className="text-sm font-medium text-slate-500 mt-1">Network Connections</div>
              </motion.div>
              
              <motion.div whileHover={{ y: -2 }} className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-50 pointer-events-none" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-3xl font-black text-slate-900">{stats.jobs}</div>
                <div className="text-sm font-medium text-slate-500 mt-1">Active Industry Jobs</div>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full blur-2xl opacity-50 pointer-events-none" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-3xl font-black text-slate-900">{stats.locations}</div>
                <div className="text-sm font-medium text-slate-500 mt-1">Shooting Locations</div>
              </motion.div>
            </div>

            {/* Recent Jobs Feed */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center space-x-2 text-slate-900">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Industry Feed</span>
                </h3>
                <Link to="/jobs" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  View All →
                </Link>
              </div>
              
              <div className="space-y-0">
                {recentJobs.length > 0 ? recentJobs.map((job) => (
                  <div key={job.id} className="group relative flex space-x-5 py-6 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex-shrink-0 flex items-center justify-center border border-emerald-100/50">
                      <Briefcase className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1 sm:gap-0">
                        <Link to={`/jobs`} className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {job.title}
                        </Link>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-medium w-fit">{getTimeAgo(job.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          {job.roleRequired}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.location}
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                    <Briefcase className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium tracking-tight">No recent job postings yet.</p>
                    <Link to="/jobs/new" className="mt-2 text-emerald-600 font-semibold hover:underline">Be the first to post!</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* AI Recommendations */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-emerald-900/10">
              <div className="absolute -top-12 -right-12 p-8 bg-emerald-500/30 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold tracking-tight flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                  <span>SPEAR AI Insights</span>
                </h3>
              </div>
              
              <div className="text-sm font-medium leading-relaxed mb-6 opacity-90">
                {loadingAI ? (
                  <div className="flex flex-col space-y-3 animate-pulse pt-2">
                    <div className="h-2 bg-emerald-400/50 rounded-full w-3/4" />
                    <div className="h-2 bg-emerald-400/50 rounded-full w-full" />
                    <div className="h-2 bg-emerald-400/50 rounded-full w-5/6" />
                  </div>
                ) : (
                  <div className="prose prose-sm prose-invert p-4 bg-black/10 rounded-2xl border border-white/10 shadow-inner">
                    <Markdown>{recommendations}</Markdown>
                  </div>
                )}
              </div>
              <button 
                onClick={fetchAIRecommendations}
                className="w-full py-3 bg-white text-emerald-900 text-sm font-bold rounded-xl hover:bg-emerald-50 shadow-md transition-all active:scale-[0.98]"
              >
                Refresh Insights
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-slate-400">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/connections" className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-700 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-emerald-100 transition-colors">
                      <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Find Collaborators</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link to="/locations" className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-blue-100 transition-colors">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Book a Set</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link to="/messages" className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-purple-50 hover:border-purple-100 hover:text-purple-700 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-purple-100 transition-colors">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-purple-700">Open Messages</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
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
