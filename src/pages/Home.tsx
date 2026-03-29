import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Users, Shield, MapPin, ArrowRight, Star, Globe, Heart, CheckCircle, Plane, Camera, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../components/Auth/AuthContext';

export const Home: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/discover');
    }
  }, [user, loading, navigate]);

  if (loading) return null;
  if (user) return null;

  const destinations = [
    { name: 'Jaipur, Rajasthan', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80', tag: 'Heritage' },
    { name: 'Munnar, Kerala', image: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=800&q=80', tag: 'Nature' },
    { name: 'Hampi, Karnataka', image: 'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=800&q=80', tag: 'History' },
    { name: 'Varanasi, UP', image: 'https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?auto=format&fit=crop&w=800&q=80', tag: 'Spiritual' },
  ];

  const steps = [
    { icon: <Globe className="w-6 h-6" />, title: 'Create Profile', desc: 'Tell us about your travel style and where you want to go in India.' },
    { icon: <Users className="w-6 h-6" />, title: 'Find Buddies', desc: 'Browse trips or find travelers with matching vibes across the country.' },
    { icon: <Plane className="w-6 h-6" />, title: 'Travel Together', desc: 'Coordinate, pack your bags, and start your Indian adventure.' },
  ];

  const testimonials = [
    { name: 'Ananya S.', role: 'Solo Traveler', text: 'Found my best friend and travel buddy for a 2-week trek in Himachal. Best decision ever!', avatar: 'https://i.pravatar.cc/150?img=32' },
    { name: 'Rahul M.', role: 'Adventure Seeker', text: 'The verification system gave me peace of mind. Had an amazing group trip to Spiti Valley.', avatar: 'https://i.pravatar.cc/150?img=11' },
    { name: 'Priya K.', role: 'Culture Enthusiast', text: 'Perfect for finding people to share costs and experiences while exploring the Ghats of Varanasi.', avatar: 'https://i.pravatar.cc/150?img=44' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1920&q=80" 
            alt="India Travel Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-white uppercase bg-indigo-600/80 backdrop-blur-md rounded-full">
                India's Largest Travel Community
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight leading-[0.9] mb-8">
                EXPLORE INDIA, <br />
                <span className="text-indigo-400">NEVER ALONE.</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-gray-200 mb-10 font-medium">
                Connect with verified travelers who share your interests, travel style, and budget. 
                Discover group trips or create your own adventure across the incredible India.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/40 flex items-center justify-center group"
                >
                  Start Your Journey <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/discover"
                  className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-2xl font-black text-lg hover:bg-white/20 transition-all flex items-center justify-center"
                >
                  Explore Trips
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-16 relative z-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 border border-gray-100">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-indigo-600 mb-1">500+</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-indigo-600 mb-1">15+</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">States</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-indigo-600 mb-1">200+</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trips Made</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-indigo-600 mb-1">4.8/5</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Popular Destinations</h2>
              <p className="text-gray-500 font-medium max-w-lg">Discover where our community is heading next. From the deserts of Rajasthan to the backwaters of Kerala.</p>
            </div>
            <Link to="/discover" className="text-indigo-600 font-bold flex items-center hover:underline">
              View all trips <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="group relative h-[400px] rounded-[2rem] overflow-hidden cursor-pointer"
              >
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-2 inline-block">
                    {dest.tag}
                  </span>
                  <h3 className="text-2xl font-black text-white">{dest.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50 rounded-[4rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">How It Works</h2>
            <p className="text-gray-500 text-lg font-medium">Three simple steps to start your next big adventure with amazing people across India.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-indigo-100 -translate-y-1/2 z-0" />
            
            {steps.map((step, i) => (
              <div key={i} className="relative z-10 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-gray-100 text-center">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-200">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{step.desc}</p>
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black text-xl border-4 border-white">
                  0{i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1515091943-9d5c0ad475af?auto=format&fit=crop&w=800&q=80" 
                  alt="Indian Travelers" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 max-w-xs hidden md:block">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-emerald-600 w-6 h-6" />
                  </div>
                  <div className="font-black text-gray-900">Verified Community</div>
                </div>
                <p className="text-sm text-gray-500 font-medium">Every member goes through a verification process to ensure safety and trust.</p>
              </div>
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">Built for the modern Indian traveler.</h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                    <Users className="text-indigo-600 w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 mb-2">Smart Matching</h4>
                    <p className="text-gray-500 font-medium">Our AI algorithm matches you with companions based on travel personality, budget, and interests.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                    <Shield className="text-emerald-600 w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 mb-2">Safety First</h4>
                    <p className="text-gray-500 font-medium">Identity verification and a robust reputation system to ensure you travel with peace of mind.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                    <MessageSquare className="text-amber-600 w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 mb-2">Group Coordination</h4>
                    <p className="text-gray-500 font-medium">Built-in chats, itineraries, and expense tracking to keep your group organized effortlessly.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-indigo-600 rounded-[4rem] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl -ml-48 -mb-48" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">What Travelers Say</h2>
            <p className="text-indigo-100 text-lg font-medium">Real stories from our amazing community members across India.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/20">
                <div className="flex items-center space-x-4 mb-6">
                  <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full border-2 border-white/50" />
                  <div>
                    <div className="font-black text-lg">{t.name}</div>
                    <div className="text-indigo-200 text-sm font-bold">{t.role}</div>
                  </div>
                </div>
                <p className="text-indigo-50 font-medium italic leading-relaxed">"{t.text}"</p>
                <div className="flex mt-6 text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gray-900 rounded-[3.5rem] p-12 md:p-20 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <img 
                src="https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80" 
                alt="India Footer BG" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">Ready for your next <br /> Indian adventure?</h2>
              <p className="text-gray-400 text-xl font-medium mb-12 max-w-2xl mx-auto">
                Join thousands of Indian travelers who have already found their perfect companions. Your next story starts here.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-12 py-6 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/40"
                >
                  Join the Community
                </Link>
                <Link
                  to="/discover"
                  className="w-full sm:w-auto px-12 py-6 bg-white text-gray-900 rounded-2xl font-black text-xl hover:bg-gray-100 transition-all"
                >
                  Browse Trips
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Compass className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900">WanderMatch</span>
          </div>
          <div className="flex space-x-8 text-sm font-bold text-gray-500 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
            <a href="#" className="hover:text-indigo-600">Contact</a>
          </div>
          <div className="text-gray-400 text-sm font-medium">
            © 2026 WanderMatch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
