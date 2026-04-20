import React from 'react';
import { Navigation, MapPin, Award, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface TravelStatsProps {
  stats?: {
    total_distance?: number;
    total_trips?: number;
    unique_places?: number;
  };
}

export const TravelStats: React.FC<TravelStatsProps> = ({ stats }) => {
  const displayStats = [
    { 
      label: 'Distance Traveled', 
      value: `${((stats?.total_distance || 0) / 1000).toFixed(0)} km`, 
      icon: Navigation, 
      color: 'bg-indigo-50 text-indigo-600',
      badge: 'Explorer'
    },
    { 
      label: 'Trips Completed', 
      value: stats?.total_trips || 0, 
      icon: Award, 
      color: 'bg-emerald-50 text-emerald-600',
      badge: 'Veteran'
    },
    { 
      label: 'Destinations', 
      value: stats?.unique_places || 0, 
      icon: MapPin, 
      color: 'bg-amber-50 text-amber-600',
      badge: 'Nomad'
    },
    { 
      label: 'Carbon Saved', 
      value: '124kg', 
      icon: TrendingUp, 
      color: 'bg-purple-50 text-purple-600',
      badge: 'Eco'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {displayStats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/30 group hover:border-indigo-100 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.badge}</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mb-1">{stat.value}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
};
