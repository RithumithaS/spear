import React from 'react';
import VideoHero from '../components/VideoHero';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { Users, Briefcase, MapPin, Star, Play, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const features = [
    {
      title: "Cine-Networking",
      desc: "Connect with directors, producers, and fellow artists in a dedicated industry space.",
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      link: "/connections"
    },
    {
      title: "Job Opportunities",
      desc: "Find your next role in film production, from acting to technical crew.",
      icon: <Briefcase className="w-6 h-6 text-emerald-500" />,
      link: "/jobs"
    },
    {
      title: "Shooting Locations",
      desc: "Browse and book unique rental locations for your next production.",
      icon: <MapPin className="w-6 h-6 text-emerald-500" />,
      link: "/locations"
    }
  ];

  return (
    <Layout>
      <VideoHero />
      
      {/* Features Section */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
              >
                <div className="mb-6 p-3 bg-emerald-500/10 rounded-xl w-fit group-hover:bg-emerald-500/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-white/40 mb-6 leading-relaxed">
                  {feature.desc}
                </p>
                <Link to={feature.link} className="flex items-center space-x-2 text-emerald-500 font-bold hover:text-emerald-400 transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter">
                Showcase Your <span className="text-emerald-500">Portfolio</span>
              </h2>
              <p className="text-white/40 text-lg">
                Upload your showreels, headshots, and project history. Let the industry see your talent in high definition.
              </p>
            </div>
            <div className="mt-8 md:mt-0">
              <Link to="/register" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-emerald-500 transition-colors">
                Create Portfolio
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="aspect-[3/4] bg-white/5 rounded-2xl overflow-hidden relative group cursor-pointer"
              >
                <img
                  src={`https://picsum.photos/seed/cine${i}/600/800`}
                  alt="Portfolio"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <h4 className="font-bold text-lg">Cinematic Project {i}</h4>
                  <p className="text-white/60 text-sm">Director of Photography</p>
                </div>
                <div className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-black text-emerald-500 mb-2">10K+</div>
              <div className="text-sm uppercase tracking-widest text-white/40">Talents</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-emerald-500 mb-2">500+</div>
              <div className="text-sm uppercase tracking-widest text-white/40">Directors</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-emerald-500 mb-2">2K+</div>
              <div className="text-sm uppercase tracking-widest text-white/40">Jobs Posted</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-emerald-500 mb-2">100+</div>
              <div className="text-sm uppercase tracking-widest text-white/40">Locations</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
