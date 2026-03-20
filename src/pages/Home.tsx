import React from 'react';
import VideoHero from '../components/VideoHero';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { Users, Briefcase, MapPin, Play, ArrowRight, UserPlus, Film, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const features = [
    {
      title: "Cine-Networking",
      desc: "Connect with directors, producers, and fellow artists in a dedicated industry space.",
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      bg: "bg-emerald-50",
      link: "/connections"
    },
    {
      title: "Job Opportunities",
      desc: "Find your next role in film production, from acting to technical crew logistics.",
      icon: <Briefcase className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-50",
      link: "/jobs"
    },
    {
      title: "Shooting Locations",
      desc: "Browse and book unique rental residential or set locations for your next production.",
      icon: <MapPin className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-50",
      link: "/locations"
    }
  ];

  return (
    <Layout>
      <VideoHero />
      
      {/* Features Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-emerald-600 font-bold tracking-wide uppercase text-sm mb-3">Core Features</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Everything you need to produce your next masterpiece.</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                className="p-8 bg-white border border-slate-200 shadow-sm rounded-3xl transition-all group"
              >
                <div className={`mb-6 p-4 rounded-2xl w-fit ${feature.bg} shadow-sm border border-slate-100 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                  {feature.desc}
                </p>
                <Link to={feature.link} className="flex items-center space-x-2 text-slate-700 font-bold hover:text-emerald-600 transition-colors group/link mt-auto inline-block">
                  <span>Explore Module</span>
                  <ArrowRight className="w-4 h-4 inline group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-24 bg-white border-t border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-50 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-emerald-600 font-bold tracking-wide uppercase text-sm mb-3">Portfolio</h2>
              <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">
                Showcase Your <span className="text-emerald-600 bg-emerald-50 px-2 leading-snug rounded-xl inline-block border border-emerald-100 shadow-sm">Talent</span>
              </h3>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">
                Upload your showreels, headshots, and project history. Let the industry see your talent in high definition. Stand out to casting directors and producers instantaneously.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link to="/register" className="px-8 py-4 bg-slate-900 text-white font-bold rounded-full shadow-lg hover:bg-emerald-600 hover:shadow-xl hover:-translate-y-1 transition-all inline-block">
                Start Your Portfolio
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02, y: -5, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                className="aspect-[3/4] bg-slate-100 rounded-3xl overflow-hidden relative group cursor-pointer shadow-sm border border-slate-200 transition-all duration-300"
              >
                <img
                  src={`https://picsum.photos/seed/cine${i}/600/800`}
                  alt="Portfolio"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h4 className="font-bold text-xl text-white mb-1">Cinematic Project {i}</h4>
                  <p className="text-emerald-300 text-sm font-semibold tracking-wide">Director of Photography</p>
                </div>
                <div className="absolute top-4 right-4 p-3 bg-white/95 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 text-emerald-600 group-hover:text-white group-hover:bg-emerald-500">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-emerald-900 text-white relative overflow-hidden border-t border-slate-200">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-400/30 blur-[100px] rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/30 blur-[100px] rounded-full pointer-events-none transform translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-emerald-800">
            <div className="group">
              <div className="text-5xl md:text-6xl font-black text-emerald-300 mb-3 tracking-tighter group-hover:scale-110 transition-transform duration-300">10K+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-emerald-100/70">Talents</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-black text-emerald-300 mb-3 tracking-tighter group-hover:scale-110 transition-transform duration-300">500+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-emerald-100/70">Directors</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-black text-emerald-300 mb-3 tracking-tighter group-hover:scale-110 transition-transform duration-300">2K+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-emerald-100/70">Active Jobs</div>
            </div>
            <div className="border-r border-emerald-800 md:border-r-0 group">
              <div className="text-5xl md:text-6xl font-black text-emerald-300 mb-3 tracking-tighter group-hover:scale-110 transition-transform duration-300">100+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-emerald-100/70">Locations</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
