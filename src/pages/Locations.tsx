import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { auth } from '../firebase';
import { locationApi } from '../services/api';
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
    try {
      const data = await locationApi.getAll();
      setLocations(data as ShootingLocation[]);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
              Shooting <span className="text-emerald-600">Locations</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Find and book the perfect backdrop for your next masterpiece.</p>
          </div>
          <Link to="/locations/new" className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-full shadow-md hover:shadow-lg hover:bg-emerald-700 transition-all flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>List a Location</span>
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative shadow-sm rounded-2xl group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-4 text-slate-900 text-base font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
          </div>
          <button className="px-8 py-4 bg-white border border-slate-200 shadow-sm rounded-2xl text-slate-700 font-bold flex items-center justify-center space-x-2 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 bg-white border border-slate-200 rounded-3xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLocations.length > 0 ? filteredLocations.map((loc) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden group transition-all duration-300"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img src={loc.imageUrl} alt={loc.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-sm flex items-center space-x-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-slate-700">4.9</span>
                  </div>
                  <div className="absolute bottom-4 left-4 px-3.5 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-md transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    Available
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors pr-4">{loc.name}</h3>
                    <div className="flex items-center text-emerald-600 font-black whitespace-nowrap bg-emerald-50 px-3 py-1.5 rounded-xl">
                      <span className="text-sm mr-1">Rs.</span>
                      <span className="text-lg">{loc.pricePerDay}</span>
                      <span className="text-[10px] text-emerald-700/60 ml-1 uppercase">/ day</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium mb-8 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{loc.address}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-emerald-600 transition-all text-center">
                      Book Now
                    </button>
                    <button className="p-3.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-sm focus:ring-4 focus:ring-emerald-500/10">
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <MapPin className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No locations found</h3>
                <p className="text-slate-500 text-lg text-center max-w-md">We couldn't find any shooting locations matching your search. Try different keywords.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Locations;
