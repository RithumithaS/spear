import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { auth } from '../firebase';
import { userApi, connectionApi } from '../services/api';
import { UserProfile, Connection } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Check, X, MessageSquare, Search, Filter, User, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

const Connections: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        // Fetch all users except current
        const usersList = await userApi.getAll(auth.currentUser.uid);
        setUsers(usersList as UserProfile[]);

        // Fetch connections for current user
        const connList = await connectionApi.getUserConnections(auth.currentUser.uid);
        setConnections(connList as Connection[]);
      }
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
        status: 'PENDING',
        createdAt: new Date().toISOString()
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

  const getConnectionStatus = (userId: string) => {
    const conn = connections.find(c => c.senderId === userId || c.receiverId === userId);
    return conn ? conn.status : null;
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = connections.filter(c => c.receiverId === auth.currentUser?.uid && c.status === 'PENDING');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
              Cine <span className="text-emerald-500">Network</span>
            </h1>
            <p className="text-white/40 font-medium">Connect with the best talent in the industry.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-white/60">
              {connections.filter(c => c.status === 'ACCEPTED').length} Connections
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-emerald-500 flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Pending Requests</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map(req => {
                const sender = users.find(u => u.uid === req.senderId);
                return (
                  <div key={req.id} className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                        {sender?.profileImage ? <img src={sender.profileImage} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-white/20" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{sender?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-white/40 uppercase">{sender?.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleAccept(req.id!)} className="p-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors">
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
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input
              type="text"
              placeholder="Search talent by name, role, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-72 bg-zinc-900/50 border border-white/10 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredUsers.map((u) => {
              const status = getConnectionStatus(u.uid);
              return (
                <motion.div
                  key={u.uid}
                  whileHover={{ y: -5 }}
                  className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center group"
                >
                  <Link to={`/profile/${u.uid}`} className="relative mb-6">
                    <div className="w-24 h-24 rounded-3xl bg-zinc-800 overflow-hidden border-2 border-transparent group-hover:border-emerald-500 transition-colors">
                      {u.profileImage ? <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" /> : <User className="w-full h-full p-6 text-white/20" />}
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-zinc-900 border border-white/10 rounded-xl">
                      <Film className="w-3 h-3 text-emerald-500" />
                    </div>
                  </Link>
                  
                  <h3 className="font-bold text-lg mb-1">{u.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-4">{u.role.replace('_', ' ')}</p>
                  
                  <p className="text-xs text-white/40 line-clamp-2 mb-6 h-8">
                    {u.bio || "Industry professional looking for collaboration."}
                  </p>

                  <div className="w-full mt-auto">
                    {status === 'ACCEPTED' ? (
                      <div className="flex items-center space-x-2">
                        <button className="flex-1 py-2 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>Message</span>
                        </button>
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    ) : status === 'PENDING' ? (
                      <button disabled className="w-full py-2 bg-white/5 border border-white/10 text-white/40 text-xs font-bold rounded-xl">
                        Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(u.uid)}
                        className="w-full py-2 bg-emerald-500 text-black text-xs font-bold rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center space-x-1"
                      >
                        <UserPlus className="w-3 h-3" />
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
