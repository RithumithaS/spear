import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { auth } from '../firebase';
import { userApi, portfolioApi, connectionApi } from '../services/api';
import { UserProfile, PortfolioItem } from '../types';
import { motion } from 'motion/react';
import { User, MapPin, Link as LinkIcon, Film, Play, Image as ImageIcon, Plus, Check, Clock, MessageSquare } from 'lucide-react';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const isOwnProfile = auth.currentUser?.uid === userId;

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchPortfolio();
      if (!isOwnProfile && auth.currentUser) {
        checkConnectionStatus();
      }
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const data = await userApi.getByUid(userId!);
      if (data) setProfile(data as UserProfile);
    } catch (e) { console.error("Error fetching profile", e); }
    setLoading(false);
  };

  const fetchPortfolio = async () => {
    try {
      const data = await portfolioApi.getByUserId(userId!);
      setPortfolio(data as PortfolioItem[]);
    } catch (e) { console.error("Error fetching portfolio", e); }
  };

  const checkConnectionStatus = async () => {
    try {
      const connections = await connectionApi.getUserConnections(auth.currentUser!.uid) as any[];
      const conn = connections.find(
        (c: any) => c.senderId === userId || c.receiverId === userId
      );
      if (conn) setConnectionStatus(conn.status);
    } catch (e) { console.error("Error checking connection", e); }
  };

  const handleConnect = async () => {
    if (!auth.currentUser || !userId) return;
    setConnecting(true);
    try {
      await connectionApi.send({
        senderId: auth.currentUser.uid,
        receiverId: userId,
      });
      setConnectionStatus('PENDING');
    } catch (error) {
      console.error("Error sending connection:", error);
    } finally {
      setConnecting(false);
    }
  };

  const handleMessage = () => {
    navigate('/messages', { state: { preselectedUser: profile } });
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return <Layout><div className="text-center py-24 text-slate-500 font-medium">User not found</div></Layout>;

  return (
    <Layout>
      {/* Header / Cover */}
      <div className="relative h-64 md:h-96 bg-slate-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/90 mix-blend-multiply" />
        {profile.profileImage ? (
          <img src={profile.profileImage} alt="Cover" className="w-full h-full object-cover opacity-50 blur-3xl saturate-150" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-blue-50 opacity-50" />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
          <div className="w-48 h-48 rounded-3xl bg-white border-4 border-slate-50 overflow-hidden shadow-xl flex-shrink-0">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                <User className="w-16 h-16" />
              </div>
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-3">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">{profile.name}</h1>
              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                {profile.role.replace('_', ' ')}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm font-semibold">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Mumbai, India</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <LinkIcon className="w-4 h-4 text-blue-600" />
                <a href="#" className="hover:text-blue-700 hover:underline transition-colors">portfolio.spear.com</a>
              </div>
            </div>
          </div>
          
          <div className="pb-4 w-full md:w-auto flex flex-col sm:flex-row gap-3">
            {isOwnProfile ? (
              <Link to="/profile/edit" className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:shadow-md hover:border-emerald-200 hover:text-emerald-700 transition-all text-center">
                Edit Profile
              </Link>
            ) : (
              <>
                {connectionStatus === 'ACCEPTED' ? (
                  <button disabled className="px-8 py-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold rounded-xl shadow-sm flex items-center justify-center space-x-2">
                    <Check className="w-5 h-5" />
                    <span>Connected</span>
                  </button>
                ) : connectionStatus === 'PENDING' ? (
                  <button disabled className="px-8 py-3.5 bg-slate-100 border border-slate-200 text-slate-400 font-bold rounded-xl flex items-center justify-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Pending</span>
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all disabled:opacity-50 text-center"
                  >
                    {connecting ? 'Connecting...' : 'Connect'}
                  </button>
                )}
                <button
                  onClick={handleMessage}
                  className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all text-center flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24">
          {/* About & Skills */}
          <div className="space-y-8">
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 rounded-l-3xl" />
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-400">About the Artist</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                {profile.bio || "No bio provided yet. This artist is busy creating magic behind the scenes."}
              </p>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 rounded-l-3xl" />
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-400">Expertise & Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.length ? profile.skills.map((skill, i) => (
                  <span key={i} className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 shadow-sm">
                    {skill}
                  </span>
                )) : <span className="text-slate-400 text-sm italic font-medium">No skills listed</span>}
              </div>
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2">
                <Film className="w-6 h-6 text-emerald-600" />
                <span>Creative Portfolio</span>
              </h3>
              {isOwnProfile && (
                <Link to="/portfolio/new" className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm hover:border-emerald-600 hover:text-emerald-600 transition-colors">
                  <Plus className="w-5 h-5" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolio.length > 0 ? portfolio.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300"
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-100">
                    <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors duration-300" />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
                      {item.mediaType === 'video' ? (
                        <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 text-emerald-600 ml-1 fill-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">
                          <ImageIcon className="w-6 h-6 text-emerald-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{item.title}</h4>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-1 md:col-span-2 py-24 flex flex-col items-center justify-center text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Film className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No portfolio items yet</h3>
                  {isOwnProfile ? (
                    <p className="text-slate-500 font-medium">Click the + button above to showcase your work.</p>
                  ) : (
                    <p className="text-slate-500 font-medium">This artist hasn't uploaded any projects yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
