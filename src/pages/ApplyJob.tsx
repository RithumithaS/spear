import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { auth } from '../firebase';
import { jobApi, applicationApi, userApi } from '../services/api';
import { JobPosting, UserProfile, JobApplication } from '../types';
import { motion } from 'motion/react';
import { Briefcase, MapPin, Send, ArrowLeft, PenTool, CheckCircle, FileText, Link as LinkIcon } from 'lucide-react';

const ApplyJob: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<JobPosting | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        bio: '',
        message: '',
        portfolioLink: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const jobData = await jobApi.getById(id);
                setJob(jobData as JobPosting);
                
                if (auth.currentUser) {
                    const profileData = await userApi.getByUid(auth.currentUser.uid);
                    setProfile(profileData as UserProfile);
                    setFormData(prev => ({
                        ...prev,
                        bio: profileData?.bio || ''
                    }));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser || !job || !id) return;

        setSubmitting(true);
        try {
            const application: Omit<JobApplication, 'id'> = {
                jobId: id,
                userId: auth.currentUser.uid,
                applicantName: profile?.name || auth.currentUser.displayName || 'Unknown',
                applicantEmail: profile?.email || auth.currentUser.email || '',
                bio: formData.bio,
                portfolioLink: formData.portfolioLink,
                message: formData.message,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };

            await applicationApi.apply(application);
            alert("Application submitted successfully!");
            navigate('/jobs');
        } catch (error: any) {
            console.error("Error submitting application:", error);
            alert(error.message || "Error submitting application.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse">Loading Job Details...</p>
                </div>
            </Layout>
        );
    }

    if (!job) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
                    <div className="p-4 bg-red-50 text-red-500 rounded-full mb-6">
                        <ArrowLeft className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Job Not Found</h2>
                    <p className="text-slate-500 font-medium mb-8">This opportunity may have been removed or filled.</p>
                    <button onClick={() => navigate('/jobs')} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl">Back to Jobs</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button 
                  onClick={() => navigate('/jobs')}
                  className="mb-8 flex items-center space-x-2 text-slate-500 font-bold hover:text-emerald-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Jobs</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Job Info Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 sticky top-24 shadow-sm">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 mb-6 w-fit">
                                <Briefcase className="w-8 h-8" />
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 mb-4 leading-tight">{job.title}</h1>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center space-x-3 text-sm font-bold text-slate-600">
                                    <MapPin className="w-4 h-4 text-emerald-500" />
                                    <span>{job.location}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm font-bold text-slate-600">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    <span>Role: {job.roleRequired}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-sm text-slate-500 font-medium leading-relaxed italic line-clamp-6">
                                    "{job.description}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Application Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 shadow-sm border-t-8 border-t-emerald-600">
                            <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center space-x-4">
                                <span>Application <span className="text-emerald-600">Form</span></span>
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest">Name</label>
                                        <div className="relative">
                                            <input 
                                              type="text" 
                                              disabled 
                                              value={profile?.name || auth.currentUser?.displayName || ''} 
                                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-slate-500 font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest">Email</label>
                                        <div className="relative">
                                            <input 
                                              type="email" 
                                              disabled 
                                              value={profile?.email || auth.currentUser?.email || ''} 
                                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-slate-500 font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center space-x-2">
                                        <PenTool className="w-4 h-4" />
                                        <span>Professional Bio</span>
                                    </label>
                                    <textarea 
                                      required
                                      value={formData.bio}
                                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                      placeholder="Introduce yourself and your experience..."
                                      rows={4}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-slate-900 font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center space-x-2">
                                        <LinkIcon className="w-4 h-4" />
                                        <span>Portfolio/Work Link</span>
                                    </label>
                                    <input 
                                      type="url"
                                      value={formData.portfolioLink}
                                      onChange={(e) => setFormData(prev => ({ ...prev, portfolioLink: e.target.value }))}
                                      placeholder="https://yourportfolio.com"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-slate-900 font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center space-x-2">
                                        <FileText className="w-4 h-4" />
                                        <span>Pitch Message</span>
                                    </label>
                                    <textarea 
                                      required
                                      value={formData.message}
                                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                      placeholder="Why are you the perfect fit for this role?"
                                      rows={6}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-slate-900 font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all"
                                    />
                                </div>

                                <button 
                                  type="submit"
                                  disabled={submitting}
                                  className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-700 hover:shadow-2xl transition-all flex items-center justify-center space-x-3 text-lg"
                                >
                                    <Send className="w-6 h-6" />
                                    <span>{submitting ? 'Sending Request...' : 'Submit Application'}</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ApplyJob;
