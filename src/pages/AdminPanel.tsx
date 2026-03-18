import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { db, auth } from '../firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { UserProfile, JobPosting, ShootingLocation } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Shield, Users, Briefcase, MapPin, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [locations, setLocations] = useState<ShootingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'jobs' | 'locations'>('users');

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersSnap, jobsSnap, locsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'jobs')),
        getDocs(collection(db, 'locations'))
      ]);

      const usersList: UserProfile[] = [];
      usersSnap.forEach(doc => usersList.push(doc.data() as UserProfile));
      setUsers(usersList);

      const jobsList: JobPosting[] = [];
      jobsSnap.forEach(doc => jobsList.push({ id: doc.id, ...doc.data() } as JobPosting));
      setJobs(jobsList);

      const locsList: ShootingLocation[] = [];
      locsSnap.forEach(doc => locsList.push({ id: doc.id, ...doc.data() } as ShootingLocation));
      setLocations(locsList);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (window.confirm(`Are you sure you want to delete this ${collectionName.slice(0, -1)}?`)) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        fetchData();
      } catch (error) {
        console.error(`Error deleting from ${collectionName}:`, error);
      }
    }
  };

  if (!isAdmin) return <Layout><div className="text-center py-24 text-red-500 font-bold flex flex-col items-center"><AlertCircle className="w-12 h-12 mb-4" /> Access Denied</div></Layout>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center space-x-4 mb-12">
          <div className="p-3 bg-emerald-500 text-black rounded-2xl shadow-lg shadow-emerald-500/20">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Admin <span className="text-emerald-500">Panel</span></h1>
            <p className="text-white/40 font-medium">Manage platform users, content, and security.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          {(['users', 'jobs', 'locations'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden">
          {loading ? (
            <div className="p-24 text-center animate-pulse text-white/20 font-bold uppercase tracking-widest">Loading Records...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <tr>
                    <th className="px-8 py-4">Details</th>
                    <th className="px-8 py-4">Role / Type</th>
                    <th className="px-8 py-4">Created At</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeTab === 'users' && users.map(user => (
                    <tr key={user.uid} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden">
                            {user.profileImage ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" /> : <Users className="w-full h-full p-2 text-white/20" />}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{user.name}</div>
                            <div className="text-xs text-white/40">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded uppercase tracking-widest">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs text-white/40 font-mono">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 text-white/20 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'jobs' && jobs.map(job => (
                    <tr key={job.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-sm">{job.title}</div>
                        <div className="text-xs text-white/40">{job.location}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs text-white/60">{job.roleRequired}</span>
                      </td>
                      <td className="px-8 py-6 text-xs text-white/40 font-mono">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => handleDelete('jobs', job.id!)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'locations' && locations.map(loc => (
                    <tr key={loc.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-sm">{loc.name}</div>
                        <div className="text-xs text-white/40">{loc.address}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs text-emerald-500 font-bold">${loc.pricePerDay}/day</span>
                      </td>
                      <td className="px-8 py-6 text-xs text-white/40 font-mono">
                        {new Date(loc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => handleDelete('locations', loc.id!)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanel;
