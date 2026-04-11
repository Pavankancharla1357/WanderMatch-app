import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/Auth/AuthContext';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../utils/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import { User, MapPin, Heart, Plane, Check, Smartphone, Camera } from 'lucide-react';
import { ImageUpload } from '../../components/Common/ImageUpload';

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
  const [formData, setFormData] = useState({
    name: profile?.name || user?.displayName || '',
    age: profile?.age?.toString() || '',
    location_city: profile?.location_city || '',
    location_country: profile?.location_country || '',
    bio: profile?.bio || '',
    gender: profile?.gender || 'prefer_not_to_say',
    social_links: {
      instagram: profile?.social_links?.instagram || '',
      linkedin: profile?.social_links?.linkedin || '',
      twitter: profile?.social_links?.twitter || '',
      website: profile?.social_links?.website || '',
    },
    interests: profile?.interests || [] as string[],
    travel_style: profile?.travel_style || 'mid_range',
    phone_number: profile?.phone_number || '',
    photo_url: profile?.photo_url || user?.photoURL || '',
  });

  useEffect(() => {
    if (profile) {
      console.log('Profile loaded in Setup:', profile);
      // If phone starts with +91, strip it for the input field
      const displayPhone = profile.phone_number?.startsWith('+91') 
        ? profile.phone_number.replace('+91', '') 
        : profile.phone_number || '';

      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        age: profile.age ? profile.age.toString() : prev.age,
        gender: profile.gender || prev.gender,
        location_city: profile.location_city || prev.location_city,
        location_country: profile.location_country || prev.location_country,
        bio: profile.bio || prev.bio,
        interests: profile.interests || prev.interests,
        travel_style: profile.travel_style || prev.travel_style,
        phone_number: displayPhone,
        photo_url: profile.photo_url || prev.photo_url,
        social_links: {
          instagram: profile.social_links?.instagram || prev.social_links.instagram,
          linkedin: profile.social_links?.linkedin || prev.social_links.linkedin,
          twitter: profile.social_links?.twitter || prev.social_links.twitter,
          website: profile.social_links?.website || prev.social_links.website,
        },
      }));

      // Initialize step based on what's already filled
      // Step 1: Basic Info (age)
      // Step 2: Travel Style
      // Step 3: Interests
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
      setInitializing(false);
    } else if (profile === null) {
      setInitializing(false);
    }
  }, [profile, navigate]);

  // Remove the auto-redirect to /discover to prevent unwanted navigation on refresh
  // The user will be redirected only when they explicitly complete the setup

  const handleNextStep = async (nextStep: number) => {
    if (!user) return;

    // Validation for Step 1
    if (step === 1) {
      if (!formData.name || !formData.age || !formData.location_city || !formData.location_country) {
        alert("Please fill in all required fields (Name, Age, City, Country).");
        return;
      }
      if (parseInt(formData.age) < 18) {
        alert("You must be at least 18 years old to use YatraMitra.");
        return;
      }
    }

    // Validation for Step 2
    if (step === 2) {
      if (!formData.travel_style) {
        alert("Please select a travel style.");
        return;
      }
    }

    const path = `users/${user.uid}`;
    try {
      const dataToSave = { ...formData };
      // Ensure phone number is stored in E.164 format if it's a 10-digit Indian number
      if (dataToSave.phone_number && dataToSave.phone_number.length === 10 && !dataToSave.phone_number.startsWith('+')) {
        dataToSave.phone_number = `+91${dataToSave.phone_number}`;
      }

      await setDoc(doc(db, 'users', user.uid), {
        ...dataToSave,
        uid: user.uid,
        email: user.email,
        age: parseInt(formData.age) || 0,
        updated_at: new Date().toISOString(),
      }, { merge: true });
      
      await refreshProfile();
      setStep(nextStep);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;

    // Validation for Step 3
    if (formData.interests.length === 0) {
      alert("Please select at least one interest.");
      return;
    }
    if (!formData.bio || formData.bio.length < 10) {
      alert("Please provide a short bio (at least 10 characters).");
      return;
    }

    const path = `users/${user.uid}`;
    try {
      const dataToSave = { ...formData };
      // Ensure phone number is stored in E.164 format if it's a 10-digit Indian number
      if (dataToSave.phone_number && dataToSave.phone_number.length === 10 && !dataToSave.phone_number.startsWith('+')) {
        dataToSave.phone_number = `+91${dataToSave.phone_number}`;
      }

      await setDoc(doc(db, 'users', user.uid), {
        ...dataToSave,
        uid: user.uid,
        email: user.email,
        age: parseInt(formData.age) || 0,
        updated_at: new Date().toISOString(),
        reputation_score: profile?.reputation_score || 0,
        is_email_verified: profile?.is_email_verified || false,
        is_id_verified: profile?.is_id_verified || false,
        created_at: profile?.created_at || new Date().toISOString(),
        setup_completed: true, // Mark setup as completed
      }, { merge: true });
      await refreshProfile();
      navigate('/discover');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
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

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
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
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
              >
                Continue
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
                  className="w-2/3 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Continue
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
                  className="w-2/3 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Complete Setup
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
