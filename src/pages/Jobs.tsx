import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { auth } from '../firebase';
import { jobApi, applicationApi } from '../services/api';
import { JobPosting } from '../types';
import { motion } from 'motion/react';
import { Briefcase, MapPin, Search, Filter, Plus, Clock, User } from 'lucide-react';
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
      });
      alert("Application submitted successfully!");
    } catch (error: any) {
      console.error("Error applying:", error);
      alert(error.message || "Error applying. You might have already applied.");
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
              Industry <span className="text-emerald-600">Opportunities</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Find your next role in the cinematic world.</p>
          </div>
          <Link to="/jobs/new" className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-full shadow-md hover:shadow-lg hover:bg-emerald-700 transition-all flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Post a Job</span>
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative shadow-sm rounded-2xl group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by title, role, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-4 text-slate-900 text-base font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
          </div>
          <button className="px-8 py-4 bg-white border border-slate-200 shadow-sm rounded-2xl text-slate-700 font-bold flex items-center justify-center space-x-2 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
            <Filter className="w-5 h-5" />
            <span>Filter Filters</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 bg-white border border-slate-200 rounded-3xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJobs.length > 0 ? filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 flex flex-col group transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm group-hover:bg-emerald-600 transition-colors duration-300">
                    <Briefcase className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center space-x-1.5 shadow-sm">
                    <Clock className="w-3.5 h-3.5" />
                    <span>New</span>
                  </span>
                </div>
                
                <h3 className="text-2xl font-black mb-3 text-slate-900 leading-tight relative z-10">{job.title}</h3>
                <p className="text-base text-slate-500 mb-6 line-clamp-3 leading-relaxed relative z-10">{job.description}</p>
                
                <div className="flex flex-col gap-3 mb-8 mt-auto relative z-10">
                  <div className="flex items-center space-x-3 text-sm font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Role: {job.roleRequired}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="truncate">{job.location}</span>
                  </div>
                </div>

                <Link
                  to={`/apply/${job.id}`}
                  className="w-full py-4 bg-slate-100 border border-slate-200 text-center text-slate-700 font-bold rounded-xl hover:bg-emerald-600 hover:text-white hover:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 transition-all relative z-10"
                >
                  Apply Now
                </Link>
              </motion.div>
            )) : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Briefcase className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No jobs found</h3>
                <p className="text-slate-500 text-lg text-center max-w-md">We couldn't find any opportunities matching your search criteria. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Jobs;
