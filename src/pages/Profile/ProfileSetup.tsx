import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/Auth/AuthContext';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../utils/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import { User, MapPin, Heart, Plane, Check, Smartphone, Camera, Loader2 } from 'lucide-react';
import { ImageUpload } from '../../components/Common/ImageUpload';
import { toast } from 'sonner';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export const ProfileSetup: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [hasSetInitialStep, setHasSetInitialStep] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location_city: '',
    location_country: '',
    bio: '',
    gender: 'prefer_not_to_say',
    social_links: {
      instagram: '',
      linkedin: '',
      twitter: '',
      website: '',
    },
    interests: [] as string[],
    travel_style: 'mid_range',
    phone_number: '',
    photo_url: '',
  });

  // Only sync once on initial profile load
  useEffect(() => {
    if (profile && !isInitialized) {
      console.log('Initializing form with profile:', profile);
      const displayPhone = profile.phone_number?.startsWith('+91') 
        ? profile.phone_number.replace('+91', '') 
        : profile.phone_number || '';

      setFormData({
        name: profile.name || user?.displayName || '',
        age: profile.age ? profile.age.toString() : '',
        gender: profile.gender || 'prefer_not_to_say',
        location_city: profile.location_city || '',
        location_country: profile.location_country || '',
        bio: profile.bio || '',
        interests: profile.interests || [],
        travel_style: profile.travel_style || 'mid_range',
        phone_number: displayPhone,
        photo_url: profile.photo_url || user?.photoURL || '',
        social_links: {
          instagram: profile.social_links?.instagram || '',
          linkedin: profile.social_links?.linkedin || '',
          twitter: profile.social_links?.twitter || '',
          website: profile.social_links?.website || '',
        },
      });

      // Initialize step based on what's already filled
      if (!hasSetInitialStep) {
        if (profile.setup_completed) {
          if (window.location.pathname === '/profile/setup') {
            navigate('/discover');
          }
        } else if (profile.age && profile.interests?.length > 0) {
          setStep(3);
        } else if (profile.age && profile.age > 0) {
          setStep(2);
        }
        setHasSetInitialStep(true);
      }
      setIsInitialized(true);
      setInitializing(false);
    } else if (profile === null && !isInitialized) {
      setFormData(prev => ({
        ...prev,
        name: user?.displayName || '',
        photo_url: user?.photoURL || '',
      }));
      setInitializing(false);
      setIsInitialized(true);
      setHasSetInitialStep(true);
    }
  }, [profile, user, isInitialized, hasSetInitialStep, navigate]);

  // Remove the auto-redirect to /discover to prevent unwanted navigation on refresh
  // The user will be redirected only when they explicitly complete the setup

  const handleNextStep = async (nextStep: number) => {
    if (!user) {
      toast.error("You must be logged in to continue.");
      return;
    }

    // Validation for Step 1
    if (step === 1) {
      if (!formData.name?.trim() || !formData.age || !formData.location_city?.trim() || !formData.location_country?.trim()) {
        toast.error("Please fill in all required fields (Name, Age, City, Country).");
        return;
      }
      const ageVal = parseInt(formData.age);
      if (isNaN(ageVal) || ageVal < 18) {
        toast.error("You must be at least 18 years old to use TripBridge.");
        return;
      }
    }

    // Validation for Step 2
    if (step === 2) {
      if (!formData.travel_style) {
        toast.error("Please select a travel style.");
        return;
      }
    }

    setSubmitting(true);
    const toastId = toast.loading('Saving your information...');
    const path = `users/${user.uid}`;
    
    try {
      const dataToSave = { ...formData };
      const ageToInt = parseInt(formData.age) || 0;
      
      if (dataToSave.phone_number && dataToSave.phone_number.length === 10 && !dataToSave.phone_number.startsWith('+')) {
        dataToSave.phone_number = `+91${dataToSave.phone_number}`;
      }

      await setDoc(doc(db, 'users', user.uid), {
        ...dataToSave,
        uid: user.uid,
        email: user.email,
        age: ageToInt,
        updated_at: new Date().toISOString(),
      }, { merge: true });
      
      toast.success('Progress saved!', { id: toastId });
      setStep(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save progress. Please try again.', { id: toastId });
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!user) {
      toast.error("You must be logged in to complete setup.");
      return;
    }

    // Validation for Step 3
    if (formData.interests.length === 0) {
      toast.error("Please select at least one interest.");
      return;
    }
    if (!formData.bio || formData.bio.trim().length < 10) {
      toast.error("Please provide a short bio (at least 10 characters).");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Finalizing your profile...');
    const path = `users/${user.uid}`;
    
    try {
      const dataToSave = { ...formData };
      const ageToInt = parseInt(formData.age) || 0;

      if (dataToSave.phone_number && dataToSave.phone_number.length === 10 && !dataToSave.phone_number.startsWith('+')) {
        dataToSave.phone_number = `+91${dataToSave.phone_number}`;
      }

      await setDoc(doc(db, 'users', user.uid), {
        ...dataToSave,
        uid: user.uid,
        email: user.email,
        age: ageToInt,
        updated_at: new Date().toISOString(),
        reputation_score: profile?.reputation_score || 0,
        is_email_verified: profile?.is_email_verified || false,
        is_id_verified: profile?.is_id_verified || false,
        created_at: profile?.created_at || new Date().toISOString(),
        setup_completed: true, 
      }, { merge: true });
      
      toast.success('Profile setup completed!', { id: toastId });
      navigate('/discover');
    } catch (error) {
      console.error('Finalize error:', error);
      toast.error('Failed to complete setup.', { id: toastId });
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const interestsList = ['Nature', 'Food', 'History', 'Adventure', 'Nightlife', 'Culture', 'Photography', 'Hiking', 'Beach', 'Shopping'];

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-1 mx-2 rounded ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100"
          >
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Basic Info</h2>
              <p className="text-gray-500">Let's start with the basics to help others know you better.</p>
              
              <ImageUpload 
                currentImageUrl={formData.photo_url}
                onImageUploaded={(url) => setFormData({ ...formData, photo_url: url })}
                label="Profile Photo"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.location_city}
                    onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.location_country}
                    onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="India"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                <div className="flex items-center px-4 py-3 border border-gray-200 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500 bg-white">
                  <span className="text-gray-400 font-bold mr-2">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={formData.phone_number}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone_number: val });
                    }}
                    className="flex-1 outline-none bg-transparent"
                    placeholder="9876543210"
                  />
                </div>
                {profile?.is_phone_verified && (
                  <p className="mt-1 text-xs text-emerald-600 flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Phone Verified
                  </p>
                )}
              </div>

              <button
                onClick={() => handleNextStep(2)}
                disabled={submitting}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Travel Style</h2>
              <p className="text-gray-500">How do you like to travel?</p>

              <div className="grid grid-cols-1 gap-3">
                {['budget', 'mid_range', 'luxury', 'backpacking'].map((style) => (
                  <button
                    key={style}
                    onClick={() => setFormData({ ...formData, travel_style: style })}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.travel_style === style ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <span className="font-bold capitalize">{style.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-4 border-2 border-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => handleNextStep(3)}
                  disabled={submitting}
                  className="w-2/3 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Interests & Bio</h2>
              <p className="text-gray-500">What are you passionate about?</p>

              <div className="flex flex-wrap gap-2">
                {interestsList.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.interests.includes(interest) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Social Links (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Instagram</label>
                    <input
                      type="text"
                      value={formData.social_links.instagram}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        social_links: { ...formData.social_links, instagram: e.target.value } 
                      })}
                      className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">LinkedIn</label>
                    <input
                      type="text"
                      value={formData.social_links.linkedin}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        social_links: { ...formData.social_links, linkedin: e.target.value } 
                      })}
                      className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="linkedin.com/in/..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Twitter</label>
                    <input
                      type="text"
                      value={formData.social_links.twitter}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        social_links: { ...formData.social_links, twitter: e.target.value } 
                      })}
                      className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Website</label>
                    <input
                      type="text"
                      value={formData.social_links.website}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        social_links: { ...formData.social_links, website: e.target.value } 
                      })}
                      className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 py-4 border-2 border-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={submitting}
                  className="w-2/3 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
);
};
