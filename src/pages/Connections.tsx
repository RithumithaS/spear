import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { auth } from '../firebase';
import { userApi, connectionApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserProfile, Connection } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Check, X, MessageSquare, Search, Filter, User, Film, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Connections: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const usersList = await userApi.getAll(user.uid);
      setUsers(usersList as UserProfile[]);

      const connList = await connectionApi.getUserConnections(user.uid);
      setConnections(connList as Connection[]);
    } catch (error) {
      console.error("Error fetching connections data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (receiverId: string) => {
    if (!auth.currentUser) return;
    try {
      await connectionApi.send({
        senderId: auth.currentUser.uid,
        receiverId,
      });
      fetchData();
    } catch (error) {
      console.error("Error sending connection request:", error);
    }
  };

  const handleAccept = async (connectionId: string) => {
    try {
      await connectionApi.accept(connectionId);
      fetchData();
    } catch (error) {
      console.error("Error accepting connection:", error);
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      await connectionApi.reject(connectionId);
      fetchData();
    } catch (error) {
      console.error("Error rejecting connection:", error);
    }
  };

  const handleMessage = (userProfile: UserProfile) => {
    navigate('/messages', { state: { preselectedUser: userProfile } });
  };

  const getConnectionStatus = (userId: string) => {
    const conn = connections.find(c => c.senderId === userId || c.receiverId === userId);
    return conn ? conn.status : null;
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = connections.filter(c => c.receiverId === user?.uid && c.status === 'PENDING');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
              Cine <span className="text-emerald-600">Network</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Connect with the best talent in the industry.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-full text-sm font-bold text-slate-700 flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{connections.filter(c => c.status === 'ACCEPTED').length} Connections</span>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-slate-900 flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <UserPlus className="w-4 h-4 text-emerald-600" />
              </div>
              <span>Pending Requests</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map(req => {
                const sender = users.find(u => u.uid === req.senderId);
                return (
                  <div key={req.id} className="p-5 bg-white border border-emerald-100 shadow-sm rounded-2xl flex items-center justify-between group hover:shadow-md hover:border-emerald-200 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                        {sender?.profileImage ? <img src={sender.profileImage} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2.5 text-slate-400" />}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-base font-bold text-slate-900 truncate">{sender?.name || 'Unknown'}</div>
                        <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide truncate">{sender?.role?.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleAccept(req.id!)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-colors" title="Accept">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleReject(req.id!)} className="p-2.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors" title="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative shadow-sm rounded-2xl group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search talent by name, role, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-4 text-slate-900 text-base font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-80 bg-white border border-slate-200 rounded-3xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredUsers.map((u) => {
              const status = getConnectionStatus(u.uid);
              return (
                <motion.div
                  key={u.uid}
                  whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                  className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col items-center text-center group transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-50 transition-colors duration-500 -z-0" />
                  
                  <Link to={`/profile/${u.uid}`} className="relative mb-6 z-10 block">
                    <div className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-md group-hover:border-emerald-100 transition-colors ml-auto mr-auto">
                      {u.profileImage ? <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" /> : <User className="w-full h-full p-6 text-slate-400" />}
                    </div>
                    <div className="absolute bottom-0 right-0 p-2.5 bg-white border border-slate-200 shadow-sm rounded-full group-hover:border-emerald-200 transition-colors">
                      <Film className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </Link>
                  
                  <h3 className="font-bold text-xl text-slate-900 mb-1 leading-tight z-10">{u.name}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4 z-10">{u.role.replace('_', ' ')}</p>
                  
                  <p className="text-sm text-slate-500 line-clamp-2 mb-8 h-10 font-medium z-10">
                    {u.bio || "Industry professional looking for collaboration."}
                  </p>

                  <div className="w-full mt-auto z-10">
                    {status === 'ACCEPTED' ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleMessage(u)}
                          className="flex-1 py-3 bg-white border border-slate-200 shadow-sm text-slate-700 text-sm font-bold rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-50 transition-colors hover:border-slate-300 hover:text-emerald-600"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Message</span>
                        </button>
                        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl" title="Connected">
                          <Check className="w-5 h-5" />
                        </div>
                      </div>
                    ) : status === 'PENDING' ? (
                      <button disabled className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-400 text-sm font-bold rounded-xl flex justify-center items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Pending</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(u.uid)}
                        className="w-full py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Connections;
