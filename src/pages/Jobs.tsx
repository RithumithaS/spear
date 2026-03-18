import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { auth } from '../firebase';
import { jobApi, applicationApi } from '../services/api';
import { JobPosting, JobApplication } from '../types';
import { motion } from 'motion/react';
import { Briefcase, MapPin, Search, Filter, Plus, Clock, CheckCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const fetchResult = await jobApi.getAll();
      setJobs(fetchResult as JobPosting[]);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!auth.currentUser) return;
    setApplying(jobId);
    try {
      await applicationApi.apply({
        userId: auth.currentUser.uid,
        jobId,
        status: 'APPLIED',
        createdAt: new Date().toISOString()
      });
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Error applying:", error);
      alert("Error applying. You might have already applied.");
    } finally {
      setApplying(null);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.roleRequired.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
              Industry <span className="text-emerald-500">Opportunities</span>
            </h1>
            <p className="text-white/40 font-medium">Find your next role in the cinematic world.</p>
          </div>
          <Link to="/jobs/new" className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 transition-all flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Post a Job</span>
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input
              type="text"
              placeholder="Search by title, role, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button className="px-6 py-4 bg-zinc-900 border border-white/10 rounded-2xl text-white/60 font-bold flex items-center space-x-2 hover:bg-white/5 transition-colors">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-zinc-900/50 border border-white/10 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.length > 0 ? filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 flex flex-col group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <Briefcase className="w-6 h-6 text-emerald-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>New</span>
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-500 transition-colors">{job.title}</h3>
                <p className="text-sm text-white/40 mb-6 line-clamp-3">{job.description}</p>
                
                <div className="space-y-3 mb-8 mt-auto">
                  <div className="flex items-center space-x-2 text-xs font-medium text-white/60">
                    <User className="w-4 h-4 text-emerald-500/50" />
                    <span>Role: {job.roleRequired}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-medium text-white/60">
                    <MapPin className="w-4 h-4 text-emerald-500/50" />
                    <span>{job.location}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleApply(job.id!)}
                  disabled={applying === job.id}
                  className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-50"
                >
                  {applying === job.id ? 'Applying...' : 'Apply Now'}
                </button>
              </motion.div>
            )) : (
              <div className="col-span-full py-24 text-center">
                <Briefcase className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-white/40 text-lg">No jobs found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Jobs;
