import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../Auth/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Video, X, PhoneIncoming, BellRing } from 'lucide-react';
import { VideoCall } from './VideoCall';
import { toast } from 'sonner';

export const GlobalCallObserver: React.FC = () => {
  const { user } = useAuth();
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [joiningCall, setJoiningCall] = useState<any | null>(null);
  const notifiedCalls = useRef(new Set<string>());

  useEffect(() => {
    if (!user || !user.uid) return;

    // 1. Listen for trip memberships to find active calls in trips
    const tripMembersQuery = query(
      collection(db, 'trip_members'),
      where('user_id', '==', user.uid),
      where('status', '==', 'approved')
    );

    const activeTripUnsubscribes = new Map<string, () => void>();

    const unsubscribeMemberships = onSnapshot(tripMembersQuery, (snapshot) => {
      const currentTripIds = new Set(snapshot.docs.map(docSnapshot => docSnapshot.data().trip_id).filter(Boolean));
      
      // Cleanup old unsubscribes
      activeTripUnsubscribes.forEach((unsub, tripId) => {
        if (!currentTripIds.has(tripId)) {
          unsub();
          activeTripUnsubscribes.delete(tripId);
          setActiveCalls(prev => prev.filter(c => c.id !== tripId));
        }
      });

      // Add new unsubscribes
      currentTripIds.forEach(tripId => {
        if (!activeTripUnsubscribes.has(tripId)) {
          const unsub = onSnapshot(doc(db, 'trips', tripId), (tripDoc) => {
            if (tripDoc.exists()) {
              const data = tripDoc.data();
              updateCallDetails(tripId, 'trip', data.name || 'Trip Group', data.active_call);
            }
          });
          activeTripUnsubscribes.set(tripId, unsub);
        }
      });
    });

    // 2. Also listen to trips where user is organizer
    const organizerQuery = query(
      collection(db, 'trips'),
      where('organizer_id', '==', user.uid)
    );
    const unsubscribeOrganizer = onSnapshot(organizerQuery, (snapshot) => {
      snapshot.docs.forEach(tripDoc => {
        const tripId = tripDoc.id;
        const data = tripDoc.data();
        updateCallDetails(tripId, 'trip', data.name || 'Trip Group', data.active_call);
      });
    });

    // 3. Listen for calls in direct message channels
    const channelsQuery = query(
      collection(db, 'channels'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribeChannels = onSnapshot(channelsQuery, (snapshot) => {
      snapshot.docs.forEach(chanDoc => {
        const data = chanDoc.data();
        if (data.type === 'direct') {
          updateCallDetails(chanDoc.id, 'channel', 'Direct Message', data.active_call);
        }
      });
    });

    return () => {
      unsubscribeMemberships();
      unsubscribeOrganizer();
      unsubscribeChannels();
      activeTripUnsubscribes.forEach(unsub => unsub());
    };
  }, [user]);

  const updateCallDetails = (id: string, source: string, name: string, activeCall: any) => {
    setActiveCalls(prev => {
      const others = prev.filter(c => c.id !== id);
      
      if (activeCall && activeCall.started_by !== user?.uid) {
        // Show notification toast if new
        const callKey = `${id}-${activeCall.started_at}`;
        if (!notifiedCalls.current.has(callKey)) {
          notifiedCalls.current.add(callKey);
          toast.info(`Incoming ${activeCall.type} call`, {
            description: source === 'trip' ? `Group: ${name}` : `Started by ${activeCall.started_by_name}`,
            icon: <BellRing className="w-4 h-4" />,
            duration: 15000,
          });
        }
        return [...others, { id, source, name, ...activeCall }];
      }
      
      return others;
    });
  };

  const handleJoin = (call: any) => {
    setJoiningCall(call);
  };

  const handleDecline = (callId: string) => {
    setActiveCalls(prev => prev.filter(c => c.id !== callId));
  };

  if (!user) return null;

  return (
    <>
      <div className="fixed top-24 right-4 z-[999] flex flex-col space-y-4 pointer-events-none">
        <AnimatePresence>
          {activeCalls.map(call => (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, x: 50, scale: 0.9, y: 0 }}
              animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 border-2 border-indigo-500 dark:border-indigo-600 rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.2)] p-5 w-80 pointer-events-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 ring-2 ring-indigo-500/20">
                      {call.type === 'video' ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[160px]">
                      {call.name}
                    </h4>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest animate-pulse">Call in progress</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDecline(call.id)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2.5 mb-4 border border-gray-100 dark:border-gray-700">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight">Started by</p>
                <p className="text-xs font-black text-gray-800 dark:text-gray-200">{call.started_by_name}</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleJoin(call)}
                  className="flex-3 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:translate-y-[-1px]"
                >
                  <PhoneIncoming className="w-3.5 h-3.5" />
                  <span>JOIN NOW</span>
                </button>
                <button
                  onClick={() => handleDecline(call.id)}
                  className="flex-1 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  IGNORE
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {joiningCall && (
          <VideoCall
            roomName={joiningCall.room_name}
            displayName={user.displayName || 'Traveler'}
            email={user.email || ''}
            type={joiningCall.type}
            onClose={() => setJoiningCall(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
