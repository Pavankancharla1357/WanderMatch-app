import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Clock, CheckCircle, Info, Filter, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getRoute, RouteData, formatDistance, formatDuration } from '../../services/routingService';

// Fix for default marker icons in Leaflet + Vite
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const ReachedIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; items-center; justify-center; color: white;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const LocationIcon = (color: string) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

interface Place {
  id: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  day: number;
  order: number;
  is_reached?: boolean;
}

interface SmartTripMapProps {
  itinerary: Place[];
  onMarkReached?: (placeId: string) => Promise<void>;
  isMember?: boolean;
}

const DAY_COLORS = [
  '#4f46e5', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
];

// Component to handle map view updates
const AutoCenter = ({ bounds }: { bounds: L.LatLngBoundsExpression | null }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

export const SmartTripMap: React.FC<SmartTripMapProps> = ({ itinerary, onMarkReached, isMember }) => {
  const [activeDay, setActiveDay] = useState<number | 'all'>('all');
  const [routes, setRoutes] = useState<Record<string, RouteData>>({});
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  // Group by day and sort by order
  const filteredItinerary = useMemo(() => {
    let list = [...itinerary];
    if (activeDay !== 'all') {
      list = list.filter(item => item.day === activeDay);
    }
    return list.sort((a, b) => a.day - b.day || a.order - b.order);
  }, [itinerary, activeDay]);

  const days = useMemo(() => {
    return Array.from(new Set(itinerary.map(item => item.day))).sort((a, b) => a - b);
  }, [itinerary]);

  const mapBounds = useMemo(() => {
    if (filteredItinerary.length === 0) return null;
    return L.latLngBounds(filteredItinerary.map(p => [p.lat, p.lng]));
  }, [filteredItinerary]);

  // Fetch routes
  useEffect(() => {
    const fetchRoutes = async () => {
      setLoadingRoutes(true);
      const newRoutes: Record<string, RouteData> = {};
      
      // Calculate routes between consecutive stops in the same day
      for (const day of days) {
        if (activeDay !== 'all' && day !== activeDay) continue;
        
        const dayItems = itinerary
          .filter(item => item.day === day)
          .sort((a, b) => a.order - b.order);
          
        for (let i = 0; i < dayItems.length - 1; i++) {
          const start = dayItems[i];
          const end = dayItems[i+1];
          const key = `${start.id}-${end.id}`;
          
          if (!routes[key]) {
            const routeData = await getRoute([start.lat, start.lng], [end.lat, end.lng]);
            if (routeData) {
              newRoutes[key] = routeData;
            }
          } else {
            newRoutes[key] = routes[key];
          }
        }
      }
      
      setRoutes(newRoutes);
      setLoadingRoutes(false);
    };

    if (itinerary.length > 1) {
      fetchRoutes();
    }
  }, [itinerary, activeDay, days]);

  const totalStats = useMemo(() => {
    let distance = 0;
    let duration = 0;
    
    Object.values(routes).forEach(route => {
      if (route) {
        distance += route.stats.distance;
        duration += route.stats.duration;
      }
    });

    return {
      distance,
      duration,
      stops: itinerary.length,
      days: days.length
    };
  }, [routes, itinerary, days]);

  return (
    <div className="space-y-6">
      {/* Travel Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distance</p>
            <p className="text-sm font-black text-gray-900">{formatDistance(totalStats.distance)}</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Travel Time</p>
            <p className="text-sm font-black text-gray-900">{formatDuration(totalStats.duration)}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stops</p>
            <p className="text-sm font-black text-gray-900">{totalStats.stops}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <Navigation className="w-5 h-5 rotate-90" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Days</p>
            <p className="text-sm font-black text-gray-900">{totalStats.days}</p>
          </div>
        </motion.div>
      </div>

      {/* Map Controls */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveDay('all')}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              activeDay === 'all' 
                ? 'bg-gray-900 text-white shadow-lg' 
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            All Days
          </button>
          {days.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeDay === day 
                  ? 'bg-white text-gray-900 border-2 border-gray-900 shadow-md' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: DAY_COLORS[(day - 1) % DAY_COLORS.length] }} 
              />
              Day {day}
            </button>
          ))}
        </div>
        
        {loadingRoutes && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 animate-pulse">
            <ArrowRight className="w-3 h-3 animate-spin" />
            Calculating Routes...
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden h-[500px] relative z-0">
        <MapContainer 
          center={itinerary[0] ? [itinerary[0].lat, itinerary[0].lng] : [20.5937, 78.9629]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AutoCenter bounds={mapBounds} />

          {/* Markers */}
          {filteredItinerary.map((place) => (
            <Marker 
              key={place.id} 
              position={[place.lat, place.lng]}
              icon={place.is_reached ? ReachedIcon : LocationIcon(DAY_COLORS[(place.day - 1) % DAY_COLORS.length])}
            >
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: DAY_COLORS[(place.day - 1) % DAY_COLORS.length] }} 
                    />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Day {place.day}</span>
                  </div>
                  <h4 className="text-sm font-black text-gray-900 mb-1">{place.title}</h4>
                  <p className="text-[10px] text-gray-500 mb-3">{place.location}</p>
                  
                  {isMember && !place.is_reached && onMarkReached && (
                    <button
                      onClick={() => onMarkReached(place.id)}
                      className="w-full py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Mark Reached
                    </button>
                  )}
                  
                  {place.is_reached && (
                    <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle className="w-3 h-3" />
                      Visited
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Routes */}
          {Object.entries(routes).map(([key, route]) => {
            if (!route) return null;
            // Get day color for this segment
            const [startId] = key.split('-');
            const startPlace = itinerary.find(p => p.id === startId);
            const color = startPlace ? DAY_COLORS[(startPlace.day - 1) % DAY_COLORS.length] : '#4f46e5';

            return (
              <Polyline 
                key={key}
                positions={route.geometry}
                color={color}
                weight={4}
                opacity={0.6}
                dashArray="10, 10"
              />
            );
          })}
        </MapContainer>
      </div>
      
      <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
        <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-900 leading-relaxed">
          Routes are calculated based on road distance. Estimated times may vary due to traffic. 
          Use the <strong>Day Filters</strong> above to see specific routes and markers for each day of your journey.
        </p>
      </div>
    </div>
  );
};
