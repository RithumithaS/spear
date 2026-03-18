import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { ShootingLocation } from '../types';
import { motion } from 'motion/react';
import { MapPin, DollarSign, Plus, Search, Filter, Star, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<ShootingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const querySnapshot = await getDocs(collection(db, 'locations'));
    const items: ShootingLocation[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as ShootingLocation);
    });
    setLocations(items);
    setLoading(false);
  };

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
              Shooting <span className="text-emerald-500">Locations</span>
            </h1>
            <p className="text-white/40 font-medium">Find and book the perfect backdrop for your next masterpiece.</p>
          </div>
          <Link to="/locations/new" className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 transition-all flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>List a Location</span>
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input
              type="text"
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button className="px-6 py-4 bg-zinc-900 border border-white/10 rounded-2xl text-white/60 font-bold flex items-center space-x-2 hover:bg-white/5 transition-colors">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-zinc-900/50 border border-white/10 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLocations.length > 0 ? filteredLocations.map((loc) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden group"
              >
                <div className="aspect-video relative overflow-hidden bg-zinc-800">
                  <img src={loc.imageUrl} alt={loc.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full flex items-center space-x-1">
                    <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    <span className="text-[10px] font-bold text-white">4.9</span>
                  </div>
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-emerald-500 text-black text-[10px] font-bold rounded-full uppercase tracking-widest">
                    Available
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold group-hover:text-emerald-500 transition-colors">{loc.name}</h3>
                    <div className="flex items-center text-emerald-500 font-black">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-lg">{loc.pricePerDay}</span>
                      <span className="text-[10px] text-white/40 ml-1 uppercase">/ day</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/40 mb-8">
                    <MapPin className="w-4 h-4 text-emerald-500/50" />
                    <span>{loc.address}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-emerald-500 hover:text-black transition-all">
                      Book Now
                    </button>
                    <button className="p-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors">
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-24 text-center">
                <MapPin className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-white/40 text-lg">No locations found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Locations;
