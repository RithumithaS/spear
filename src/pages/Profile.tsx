import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { auth } from '../firebase';
import { userApi, portfolioApi, connectionApi } from '../services/api';
import { UserProfile, PortfolioItem } from '../types';
import { motion } from 'motion/react';
import { User, MapPin, Link as LinkIcon, Film, Play, Image as ImageIcon, Plus, Check, Clock } from 'lucide-react';

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
        status: 'PENDING',
        createdAt: new Date().toISOString()
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return <Layout><div className="text-center py-24">User not found</div></Layout>;

  return (
    <Layout>
      {/* Header / Cover */}
      <div className="relative h-64 md:h-96 bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
        {profile.profileImage && (
          <img src={profile.profileImage} alt="Cover" className="w-full h-full object-cover opacity-30 blur-xl" />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
          <div className="w-48 h-48 rounded-3xl bg-zinc-800 border-4 border-black overflow-hidden shadow-2xl flex-shrink-0">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20">
                <User className="w-16 h-16" />
              </div>
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">{profile.name}</h1>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold rounded-full uppercase tracking-widest">
                {profile.role.replace('_', ' ')}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-white/40 text-sm font-medium">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Mumbai, India</span>
              </div>
              <div className="flex items-center space-x-1">
                <LinkIcon className="w-4 h-4" />
                <a href="#" className="hover:text-emerald-400 transition-colors">portfolio.spear.com</a>
              </div>
            </div>
          </div>
          <div className="pb-4 flex space-x-4">
            {isOwnProfile ? (
              <Link to="/profile/edit" className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-emerald-500 transition-colors">
                Edit Profile
              </Link>
            ) : (
              <>
                {connectionStatus === 'ACCEPTED' ? (
                  <button disabled className="px-8 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold rounded-full flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Connected</span>
                  </button>
                ) : connectionStatus === 'PENDING' ? (
                  <button disabled className="px-8 py-3 bg-white/5 border border-white/10 text-white/40 font-bold rounded-full flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Pending</span>
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 transition-colors disabled:opacity-50"
                  >
                    {connecting ? 'Connecting...' : 'Connect'}
                  </button>
                )}
                <button
                  onClick={handleMessage}
                  className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition-colors"
                >
                  Message
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-24">
          {/* About & Skills */}
          <div className="space-y-8">
            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-white/40">About</h3>
              <p className="text-white/80 leading-relaxed">
                {profile.bio || "No bio provided yet. This artist is busy creating magic behind the scenes."}
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-white/40">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/60">
                    {skill}
                  </span>
                )) || <span className="text-white/20 text-xs italic">No skills listed</span>}
              </div>
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black tracking-tighter uppercase flex items-center space-x-2">
                <Film className="w-6 h-6 text-emerald-500" />
                <span>Portfolio</span>
              </h3>
              {isOwnProfile && (
                <Link to="/profile/edit" className="p-2 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-colors">
                  <Plus className="w-5 h-5" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {portfolio.length > 0 ? portfolio.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -5 }}
                  className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <div className="aspect-video relative overflow-hidden bg-zinc-800">
                    <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.mediaType === 'video' ? (
                        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-black fill-black" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-xs text-white/40 line-clamp-2">{item.description}</p>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-2 py-24 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <Film className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/20 font-medium">No portfolio items yet.</p>
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
