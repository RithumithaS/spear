import React, { useEffect, useState } from 'react';
import { userApi, jobApi, locationApi, reportApi, adminApi } from '../services/api';
import { UserProfile, JobPosting, ShootingLocation, Report } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Users, Briefcase, MapPin, Trash2, AlertCircle, Database,
  Flag, CheckCircle, XCircle, Eye, BarChart3, TrendingUp,
  UserX, ShieldCheck, RefreshCw
} from 'lucide-react';

type TabKey = 'overview' | 'users' | 'jobs' | 'locations' | 'reports';

const AdminPanel: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [locations, setLocations] = useState<ShootingLocation[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

      // Reports - may fail for non-admins
      try {
        const reportsData = await reportApi.getAll();
        setReports(reportsData as Report[]);
      } catch (e) {
        console.warn("Could not fetch reports:", e);
      }
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
          location: ['Mumbai', 'Chennai', 'Hyderabad', 'Bangalore', 'Kolkata', 'Delhi'][i % 6],
          createdAt: new Date().toISOString()
        });
      }

      for (let i = 0; i < 20; i++) {
        await locationApi.create({
          name: `${['Heritage', 'Modern', 'Rustic', 'Temple'][i % 4]} ${['Bungalow', 'Studio', 'Warehouse', 'Courtyard'][i % 4]}`,
          address: `${100 + i} Film Nagar, ${['Hyderabad', 'Chennai', 'Mumbai', 'Kolkata'][i % 4]}`,
          pricePerDay: Number((i + 1) * 2000),
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
        } else if (collectionName === 'reports') {
          await reportApi.delete(id);
        }
        fetchData();
      } catch (error) {
        console.error(`Error deleting from ${collectionName}:`, error);
      }
    }
  };

  const handleDeleteUserAuth = async (uid: string) => {
    if (!window.confirm("PERMANENTLY delete this user's Firebase Authentication account? This cannot be undone.")) return;
    setActionLoading(uid);
    try {
      await adminApi.deleteUserAuth(uid);
      // Also delete from Firestore
      await userApi.delete(uid);
      alert("User auth account permanently deleted.");
      fetchData();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReportAction = async (reportId: string, status: string) => {
    setActionLoading(reportId);
    try {
      await reportApi.updateStatus(reportId, status);
      fetchData();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-24 h-24 bg-red-900/50 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-3xl font-black text-white mb-2">Access Denied</h2>
      <p className="text-slate-400 font-medium mb-6">You don't have permission to view the admin panel.</p>
      <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors">
        Return Home
      </button>
    </div>
  );

  const pendingReports = reports.filter(r => r.status === 'PENDING');
  const roleBreakdown = {
    USER: users.filter(u => u.role === 'USER').length,
    DIRECTOR: users.filter(u => u.role === 'DIRECTOR').length,
    PRODUCTION_HOUSE: users.filter(u => u.role === 'PRODUCTION_HOUSE').length,
    ADMIN: users.filter(u => u.role === 'ADMIN').length,
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number; color: string }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" />, color: 'emerald' },
    { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" />, count: users.length, color: 'emerald' },
    { key: 'jobs', label: 'Jobs', icon: <Briefcase className="w-4 h-4" />, count: jobs.length, color: 'blue' },
    { key: 'locations', label: 'Locations', icon: <MapPin className="w-4 h-4" />, count: locations.length, color: 'purple' },
    { key: 'reports', label: 'Reports', icon: <Flag className="w-4 h-4" />, count: pendingReports.length, color: 'amber' },
  ];

  const getTabClasses = (tab: typeof tabs[0], isActive: boolean) => {
    if (!isActive) return 'text-slate-500 hover:text-slate-300';
    const colorMap: Record<string, string> = {
      emerald: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      amber: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    };
    return colorMap[tab.color] || colorMap.emerald;
  };

  return (
    <div className="min-h-screen bg-slate-900 selection:bg-emerald-500/30 selection:text-emerald-200">
      <nav className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-emerald-500" />
            <span className="text-lg font-bold tracking-widest text-white uppercase">SPEAR Engine</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={fetchData} className="p-2 text-slate-400 hover:text-emerald-400 transition-colors" title="Refresh">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button onClick={() => window.location.href = '/'} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Exit to Site
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-slate-800/80 text-emerald-500 rounded-2xl shadow-sm border border-slate-700/50 flex-shrink-0">
              <Shield className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                Systems <span className="text-emerald-500">Terminal</span>
              </h1>
              <p className="text-slate-400 font-medium text-lg">Manage platform resources, reports, and network topology.</p>
            </div>
          </div>
          
          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="flex-shrink-0 px-6 py-3.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl shadow-sm hover:bg-emerald-600/20 hover:border-emerald-500/30 hover:text-emerald-300 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Database className="w-5 h-5" />
            <span>{seeding ? 'Seeding...' : 'Seed Data'}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-800/50 p-2 rounded-xl w-fit border border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${getTabClasses(tab, activeTab === tab.key)}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && activeTab === tab.key && (
                <span className="ml-1 text-[10px] opacity-80">({tab.count})</span>
              )}
              {tab.key === 'reports' && pendingReports.length > 0 && activeTab !== 'reports' && (
                <span className="ml-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse">
                  {pendingReports.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-slate-400 font-bold uppercase tracking-widest text-sm animate-pulse">Synchronizing Records...</div>
          </div>
        ) : (
          <>
            {/* ============= OVERVIEW TAB ============= */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: users.length, icon: <Users className="w-6 h-6" />, color: 'emerald', sub: `${roleBreakdown.DIRECTOR} Directors` },
                    { label: 'Active Jobs', value: jobs.length, icon: <Briefcase className="w-6 h-6" />, color: 'blue', sub: 'Open listings' },
                    { label: 'Locations', value: locations.length, icon: <MapPin className="w-6 h-6" />, color: 'purple', sub: 'Available sets' },
                    { label: 'Pending Reports', value: pendingReports.length, icon: <Flag className="w-6 h-6" />, color: 'amber', sub: `${reports.length} total reports` },
                  ].map((stat, i) => {
                    const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
                      emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'bg-emerald-500/10' },
                      blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'bg-blue-500/10' },
                      purple: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', text: 'text-purple-400', icon: 'bg-purple-500/10' },
                      amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400', icon: 'bg-amber-500/10' },
                    };
                    const c = colorMap[stat.color];
                    return (
                      <div key={i} className={`${c.bg} border ${c.border} rounded-2xl p-6 backdrop-blur-sm`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 ${c.icon} rounded-xl`}>{React.cloneElement(stat.icon as React.ReactElement<any>, { className: `w-6 h-6 ${c.text}` })}</div>
                          <TrendingUp className={`w-4 h-4 ${c.text} opacity-50`} />
                        </div>
                        <div className={`text-3xl font-black ${c.text} mb-1`}>{stat.value}</div>
                        <div className="text-sm font-bold text-slate-300">{stat.label}</div>
                        <div className="text-xs text-slate-500 font-medium mt-1">{stat.sub}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Role Breakdown */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span>User Role Distribution</span>
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(roleBreakdown).map(([role, count]) => {
                      const total = users.length || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={role} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{role.replace('_', ' ')}</div>
                          <div className="text-2xl font-black text-white mb-2">{count}</div>
                          <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold mt-1">{pct}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Reports Preview */}
                {pendingReports.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center space-x-2">
                      <Flag className="w-5 h-5" />
                      <span>Pending Reports ({pendingReports.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {pendingReports.slice(0, 5).map(report => (
                        <div key={report.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md mr-3">{report.type}</span>
                            <span className="text-sm text-slate-300 font-medium">{report.reason}</span>
                          </div>
                          <button
                            onClick={() => setActiveTab('reports')}
                            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            Review →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============= DATA TABLES ============= */}
            {(activeTab === 'users' || activeTab === 'jobs' || activeTab === 'locations') && (
              <div className="bg-slate-800/50 border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-700/50">
                      <tr>
                        <th className="px-8 py-5">Record Details</th>
                        <th className="px-8 py-5">Role / Status</th>
                        <th className="px-8 py-5">Created At</th>
                        <th className="px-8 py-5 text-right w-48">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {activeTab === 'users' && users.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No users found</td></tr>
                      )}
                      {activeTab === 'users' && users && users.map(user => (
                        <tr key={user.uid} className="hover:bg-slate-700/30 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-700 border border-slate-600 overflow-hidden flex-shrink-0">
                                {user.profileImage ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" /> : <Users className="w-full h-full p-3 text-slate-500" />}
                              </div>
                              <div>
                                <div className="font-bold text-white text-[15px]">{user.name}</div>
                                <div className="text-sm text-slate-400 font-medium">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1.5 bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-lg uppercase tracking-wider inline-block">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-400 font-medium">
                            {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleDeleteUserAuth(user.uid)}
                                disabled={actionLoading === user.uid}
                                className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 rounded-xl transition-all disabled:opacity-50"
                                title="Delete Auth Account"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete('users', user.uid)} className="p-2.5 bg-slate-800 border border-slate-700 shadow-sm text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 rounded-xl transition-all" title="Delete Firestore Record">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {activeTab === 'jobs' && jobs.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No jobs found</td></tr>
                      )}
                      {activeTab === 'jobs' && jobs && jobs.map(job => (
                        <tr key={job.id} className="hover:bg-slate-700/30 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 rounded-xl bg-blue-900/30 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Briefcase className="w-5 h-5 text-blue-400" />
                              </div>
                              <div>
                                <div className="font-bold text-white text-[15px]">{job.title}</div>
                                <div className="text-sm text-slate-400 font-medium flex items-center mt-0.5">
                                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                  {job.location}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1.5 bg-blue-900/30 border border-blue-500/30 text-blue-400 text-[10px] font-bold rounded-lg uppercase tracking-wider inline-block">
                              {job.roleRequired}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-400 font-medium">
                            {new Date(job.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button onClick={() => handleDelete('jobs', job.id!)} className="p-2.5 bg-slate-800 border border-slate-700 shadow-sm text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 rounded-xl transition-all" title="Delete Job">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      
                      {activeTab === 'locations' && locations.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No locations found</td></tr>
                      )}
                      {activeTab === 'locations' && locations && locations.map(loc => (
                        <tr key={loc.id} className="hover:bg-slate-700/30 transition-colors group">
                          <td className="px-8 py-5">
                             <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 rounded-xl bg-purple-900/30 border border-purple-500/30 overflow-hidden flex-shrink-0 mt-0.5 relative">
                                {loc.imageUrl ? <img src={loc.imageUrl} alt="" className="w-full h-full object-cover" /> : <MapPin className="w-full h-full p-2.5 text-purple-400" />}
                              </div>
                              <div>
                                <div className="font-bold text-white text-[15px]">{loc.name}</div>
                                <div className="text-sm text-slate-400 font-medium truncate max-w-xs">{loc.address}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1.5 bg-slate-700/50 border border-slate-600 text-slate-300 text-sm font-bold rounded-lg inline-flex items-center">
                              Rs. {loc.pricePerDay}<span className="text-[10px] text-slate-500 uppercase tracking-widest ml-1 translate-y-px">/day</span>
                            </span>
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-400 font-medium">
                            {new Date(loc.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button onClick={() => handleDelete('locations', loc.id!)} className="p-2.5 bg-slate-800 border border-slate-700 shadow-sm text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 rounded-xl transition-all" title="Delete Location">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============= REPORTS TAB ============= */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-16 text-center">
                    <Flag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-300 mb-2">No Reports</h3>
                    <p className="text-slate-500 font-medium">The platform is clean. No reports have been filed.</p>
                  </div>
                ) : (
                  reports.map(report => {
                    const reportedUser = users.find(u => u.uid === report.reportedBy);
                    const statusColors: Record<string, { bg: string; border: string; text: string }> = {
                      PENDING: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
                      REVIEWED: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
                      DISMISSED: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' },
                      ACTION_TAKEN: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
                    };
                    const sc = statusColors[report.status] || statusColors.PENDING;

                    return (
                      <div key={report.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.text} border ${sc.border} rounded-lg`}>
                                {report.status.replace('_', ' ')}
                              </span>
                              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-700/50 text-slate-400 border border-slate-600/50 rounded-lg">
                                {report.type}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                {new Date(report.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-white font-semibold mb-2">{report.reason}</p>
                            <div className="flex items-center space-x-3 text-sm">
                              <span className="text-slate-500">Target:</span>
                              <code className="bg-slate-900/80 px-2 py-0.5 rounded text-xs text-emerald-400 font-mono border border-slate-700/50">{report.targetId}</code>
                              <span className="text-slate-500">Reported by:</span>
                              <span className="text-slate-300 font-medium">{reportedUser?.name || report.reportedBy}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {report.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleReportAction(report.id!, 'REVIEWED')}
                                  disabled={actionLoading === report.id}
                                  className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all disabled:opacity-50"
                                  title="Mark as Reviewed"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReportAction(report.id!, 'ACTION_TAKEN')}
                                  disabled={actionLoading === report.id}
                                  className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-all disabled:opacity-50"
                                  title="Action Taken"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReportAction(report.id!, 'DISMISSED')}
                                  disabled={actionLoading === report.id}
                                  className="p-2.5 bg-slate-500/10 border border-slate-500/20 text-slate-400 hover:bg-slate-500/20 rounded-xl transition-all disabled:opacity-50"
                                  title="Dismiss"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete('reports', report.id!)}
                              className="p-2.5 bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 rounded-xl transition-all"
                              title="Delete Report"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
