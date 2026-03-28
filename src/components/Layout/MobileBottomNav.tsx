import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, MessageSquare, User, Users, Sparkles, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../Auth/AuthContext';
import { Capacitor } from '@capacitor/core';

export const MobileBottomNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAndroid = Capacitor.getPlatform() === 'android';

  // Only show on mobile/android
  if (!isAndroid && window.innerWidth >= 768) return null;
  if (!user) return null;

  const navItems = [
    { icon: Compass, label: 'Discover', path: '/discover' },
    { icon: Users, label: 'Buddies', path: '/buddy-finder' },
    { icon: Sparkles, label: 'AI Planner', path: '/expert-planner' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 pb-safe z-50 flex justify-around items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center min-w-[64px] py-1 rounded-xl transition-all ${
              isActive 
                ? 'text-indigo-600 bg-indigo-50' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
