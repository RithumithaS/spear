import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { auth } from '../firebase';
import { jobApi, applicationApi } from '../services/api';
import { JobPosting, JobApplication } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, User, Mail, MessageCircle, ExternalLink, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const JobApplications: React.FC = () => {
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [applications, setApplications] = useState<Record<string, JobApplication[]>>({});
    const [loading, setLoading] = useState(true);
    const [activeJobId, setActiveJobId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!auth.currentUser) return;
            try {
                // Get all jobs posted by the user
                const allJobs = await jobApi.getAll();
                const userJobs = allJobs.filter(j => j.postedBy === auth.currentUser?.uid);
                setJobs(userJobs as JobPosting[]);

                // Get applications for each job
                const appsMap: Record<string, JobApplication[]> = {};
                for (const job of userJobs) {
                    if (job.id) {
                        const apps = await applicationApi.getByJob(job.id);
                        appsMap[job.id] = apps as JobApplication[];
                    }
                }
                setApplications(appsMap);
                if (userJobs.length > 0) setActiveJobId(userJobs[0].id!);
            } catch (error) {
                console.error("Error fetching applications:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const updateStatus = async (jobId: string, appId: string, status: 'SELECTED' | 'REJECTED') => {
        try {
            await applicationApi.updateStatus(appId, status);
            // Refresh local state
            setApplications(prev => ({
                ...prev,
                [jobId]: prev[jobId].map(app => app.id === appId ? { ...app, status } : app)
            }));
            alert(`Application ${status.toLowerCase()} successfully.`);
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error updating application status.");
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 font-bold text-sm animate-pulse tracking-widest uppercase">Fetching Responses...</p>
                </div>
            </Layout>
        );
    }

    if (jobs.length === 0) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Briefcase className="w-12 h-12 text-slate-300" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4">You Haven't Posted Any Jobs Yet</h1>
                    <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto">Start by posting your production's casting calls or crew requirements to see applications here.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
                        Response <span className="text-emerald-600">Center</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">Manage applicants for your open productions.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Job List Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">My Postings</h3>
                        {jobs.map(job => (
                            <button
                                key={job.id}
                                onClick={() => setActiveJobId(job.id!)}
                                className={`w-full p-5 rounded-2xl text-left transition-all border ${
                                    activeJobId === job.id 
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600 shadow-sm'
                                }`}
                            >
                                <div className="text-sm font-black mb-1 line-clamp-1 uppercase tracking-tight">{job.title}</div>
                                <div className="text-[10px] font-bold flex items-center space-x-1.5 opacity-80">
                                    <Clock className="w-3 h-3" />
                                    <span>{(applications[job.id!] || []).length} Responses</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Applications View */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            {activeJobId && (
                                <motion.div
                                    key={activeJobId}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {(applications[activeJobId] || []).length === 0 ? (
                                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-24 text-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <User className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">No applications yet</h3>
                                            <p className="text-slate-500 font-medium">Keep your job posting active to receive talent responses!</p>
                                        </div>
                                    ) : (
                                        applications[activeJobId].map(app => (
                                            <div key={app.id} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500 opacity-50" />
                                                
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-4 mb-6">
                                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
                                                                <User className="w-8 h-8 text-slate-400" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-2xl font-black text-slate-900">{app.applicantName}</h4>
                                                                <div className="flex items-center space-x-3 text-slate-500 text-sm font-bold">
                                                                    <Mail className="w-4 h-4 text-emerald-500" />
                                                                    <span>{app.applicantEmail}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                                            <div className="space-y-3">
                                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    <span>Bio & Experience</span>
                                                                </h5>
                                                                <p className="text-slate-600 text-sm leading-relaxed font-medium line-clamp-4">
                                                                    {app.bio}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                                    <span>Pitch message</span>
                                                                </h5>
                                                                <p className="text-slate-600 text-sm leading-relaxed font-medium line-clamp-4">
                                                                    {app.message}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {app.portfolioLink && (
                                                            <a 
                                                              href={app.portfolioLink} 
                                                              target="_blank" 
                                                              rel="noopener noreferrer"
                                                              className="inline-flex items-center space-x-2 text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm group/btn"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                                <span>View Portfolio</span>
                                                                <div className="w-0.5 h-3 bg-emerald-300 mx-1 group-hover/btn:bg-white/30" />
                                                                <span className="opacity-70 group-hover/btn:opacity-100">External Site</span>
                                                            </a>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-row md:flex-col gap-3 min-w-[140px]">
                                                        <button 
                                                          onClick={() => updateStatus(activeJobId, app.id!, 'SELECTED')}
                                                          className="flex-1 py-3 px-6 bg-emerald-600 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>Shortlist</span>
                                                        </button>
                                                        <button 
                                                          onClick={() => updateStatus(activeJobId, app.id!, 'REJECTED')}
                                                          className="flex-1 py-3 px-6 bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all flex items-center justify-center space-x-2"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            <span>Decline</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default JobApplications;
