import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../components/Auth/AuthContext';
import { createNotification } from '../../services/notificationService';
import { X, Send, Info, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JoinRequestModalProps {
  trip: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const JoinRequestModal: React.FC<JoinRequestModalProps> = ({ trip, onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isRestricted = trip.is_women_only && profile?.gender !== 'female';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isRestricted) return;

    setLoading(true);
    try {
      await setDoc(doc(db, 'trip_members', `${user.uid}_${trip.id}`), {
        trip_id: trip.id,
        user_id: user.uid,
        organizer_id: trip.organizer_id,
        user_name: profile?.name || user.displayName || 'Traveler',
        trip_name: trip.destination_city,
        role: 'member',
        status: 'pending',
        request_message: message.trim(),
        joined_at: serverTimestamp(),
      });

      // Create notification for organizer
      await createNotification(
        trip.organizer_id,
        'request_received',
        'New Join Request',
        `${profile?.name || user.displayName || 'A traveler'} wants to join your trip to ${trip.destination_city}.`,
        `/dashboard`
      );

      onSuccess();
    } catch (error) {
      console.error('Error sending join request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight font-serif">Request to Join</h3>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 block">Trip Application</span>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-lg rounded-2xl transition-all text-gray-400 hover:text-gray-900">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {isRestricted ? (
            <div className="bg-pink-50/50 p-8 rounded-[2.5rem] border border-pink-100 text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
              </div>
              <h4 className="text-xl font-black text-pink-900 mb-2 tracking-tight font-serif">Women Only Trip</h4>
              <p className="text-sm text-pink-700 leading-relaxed font-medium">
                This trip is exclusively for female travelers. To join, please ensure your profile gender is set to 'Female'.
              </p>
              <button 
                type="button"
                onClick={() => navigate('/profile')}
                className="mt-8 w-full py-4 bg-pink-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-pink-700 transition-all shadow-xl shadow-pink-100"
              >
                Update Profile
              </button>
            </div>
          ) : (
            <>
              <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 flex items-start space-x-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <Info className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                  Introduce yourself to the organizer! Mention why you're interested in this trip and your travel experience.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Message to Organizer</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none transition-all font-medium text-gray-700"
                  placeholder="Hi! I'm an avid hiker and would love to join your Tokyo adventure..."
                />
              </div>

              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center disabled:opacity-50"
              >
                {loading ? 'Sending...' : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Send Request
                  </>
                )}
              </button>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
};
