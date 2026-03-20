import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { userApi, jobApi, locationApi } from '../services/api';
import { UserProfile, JobPosting, ShootingLocation } from '../types';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Briefcase, MapPin, Trash2, AlertCircle, Database } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [locations, setLocations] = useState<ShootingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'jobs' | 'locations'>('users');

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, jobsData, locsData] = await Promise.all([
        userApi.getAll(),
        jobApi.getAll(),
        locationApi.getAll()
      ]);

      setUsers(usersData as UserProfile[]);
      setJobs(jobsData as JobPosting[]);
      setLocations(locsData as ShootingLocation[]);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm("Seed 20 fresh records into each collection?")) return;
    setSeeding(true);
    try {
      const userNames = [
        "John Doe", "Jane Smith", "Alex Johnson", "Emily Davis", "Michael Brown",
        "Sarah Miller", "David Wilson", "Laura Moore", "James Taylor", "Emma Anderson",
        "Robert Thomas", "Olivia Jackson", "William White", "Sophia Harris", "Richard Martin",
        "Isabella Garcia", "Charles Martinez", "Mia Robinson", "Joseph Clark", "Charlotte Lewis"
      ];
      const roles = ['USER', 'DIRECTOR', 'PRODUCTION_HOUSE'] as const;
      
      const userIds = [];
      for (let i = 0; i < 20; i++) {
        const uid = `test_user_uid_${i}_${Date.now()}`;
        userIds.push(uid);
        await userApi.create({
          uid: uid,
          name: userNames[i] || `User ${i}`,
          email: `user${i}@example.com`,
          role: roles[i % 3],
          bio: "Industry professional with a passion for creative storytelling.",
          skills: ["Directing", "Editing", "Cinematography"].slice(0, (i % 3) + 1),
          profileImage: `https://i.pravatar.cc/150?u=${uid}`,
          createdAt: new Date().toISOString()
        });
      }

      for (let i = 0; i < 20; i++) {
        await jobApi.create({
          title: `Looking for ${['Lead Actor', 'Cinematographer', 'Editor', 'Sound Mixer'][i % 4]}`,
          description: "We are casting/hiring for an upcoming blockbuster independent film. Great pay and credits.",
          postedBy: userIds[i % userIds.length],
          roleRequired: ['Actor', 'Camera', 'Editor', 'Sound'][i % 4],
          location: ['Mumbai', 'Los Angeles', 'London', 'New York'][i % 4],
          createdAt: new Date().toISOString()
        });
      }

      for (let i = 0; i < 20; i++) {
        await locationApi.create({
          name: `${['Victorian', 'Modern', 'Rustic', 'Sci-Fi'][i % 4]} ${['Mansion', 'Apartment', 'Cabin', 'Studio'][i % 4]}`,
          address: `${100 + i} Film City, World`,
          pricePerDay: Number((i + 1) * 100),
          ownerId: userIds[i % userIds.length],
          imageUrl: `https://picsum.photos/seed/loc${i}/800/600`,
          createdAt: new Date().toISOString()
        });
      }

      alert("Successfully seeded database!");
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Error seeding.");
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (window.confirm(`Are you sure you want to delete this ${collectionName.slice(0, -1)}?`)) {
      try {
        if (collectionName === 'users') {
          await userApi.delete(id);
        } else if (collectionName === 'jobs') {
          await jobApi.delete(id);
        } else if (collectionName === 'locations') {
          await locationApi.delete(id);
        }
        fetchData();
      } catch (error) {
        console.error(`Error deleting from ${collectionName}:`, error);
      }
    }
  };

  if (!isAdmin) return <Layout><div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"><div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6"><AlertCircle className="w-12 h-12 text-red-500" /></div><h2 className="text-3xl font-black text-slate-900 mb-2">Access Denied</h2><p className="text-slate-500 font-medium">You don't have permission to view the admin panel.</p></div></Layout>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl shadow-sm border border-emerald-100 flex-shrink-0">
              <Shield className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
                Admin <span className="text-emerald-600">Panel</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg">Manage platform users, content, and system security.</p>
            </div>
          </div>
          
          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="flex-shrink-0 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 hover:text-emerald-600 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Database className="w-5 h-5" />
            <span>{seeding ? 'Seeding...' : 'Seed Data'}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 bg-slate-100 p-2 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
              activeTab === 'users' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users</span>
            {activeTab === 'users' && <span className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px]">{users.length}</span>}
          </button>
          
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
              activeTab === 'jobs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Jobs</span>
            {activeTab === 'jobs' && <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">{jobs.length}</span>}
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
              activeTab === 'locations' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Locations</span>
            {activeTab === 'locations' && <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px]">{locations.length}</span>}
          </button>
        </div>

        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden drop-shadow-sm">
          {loading ? (
            <div className="p-24 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-slate-400 font-bold uppercase tracking-widest text-sm animate-pulse">Synchronizing Records...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5">Record Details</th>
                    <th className="px-8 py-5">Role / Status</th>
                    <th className="px-8 py-5">Created At</th>
                    <th className="px-8 py-5 text-right w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTab === 'users' && users.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No users found</td></tr>
                  )}
                  {activeTab === 'users' && users && users.map(user => (
                    <tr key={user.uid} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                            {user.profileImage ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" /> : <Users className="w-full h-full p-3 text-slate-400" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-[15px]">{user.name}</div>
                            <div className="text-sm text-slate-500 font-medium">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg uppercase tracking-wider inline-block">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                        {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => handleDelete('users', user.uid)} className="p-2.5 bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all" title="Delete User">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {activeTab === 'jobs' && jobs.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No jobs found</td></tr>
                  )}
                  {activeTab === 'jobs' && jobs && jobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-[15px]">{job.title}</div>
                            <div className="text-sm text-slate-500 font-medium flex items-center mt-0.5">
                              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              {job.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold rounded-lg uppercase tracking-wider inline-block">
                          {job.roleRequired}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                        {new Date(job.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => handleDelete('jobs', job.id!)} className="p-2.5 bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all" title="Delete Job">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {activeTab === 'locations' && locations.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No locations found</td></tr>
                  )}
                  {activeTab === 'locations' && locations && locations.map(loc => (
                    <tr key={loc.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-5">
                         <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 overflow-hidden flex-shrink-0 mt-0.5 relative">
                            {loc.imageUrl ? <img src={loc.imageUrl} alt="" className="w-full h-full object-cover" /> : <MapPin className="w-full h-full p-2.5 text-purple-400" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-[15px]">{loc.name}</div>
                            <div className="text-sm text-slate-500 font-medium truncate max-w-xs">{loc.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg inline-flex items-center">
                          ${loc.pricePerDay}<span className="text-[10px] text-slate-500 uppercase tracking-widest ml-1 translate-y-px">/day</span>
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                        {new Date(loc.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => handleDelete('locations', loc.id!)} className="p-2.5 bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all" title="Delete Location">
                          <Trash2 className="w-4 h-4" />
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
