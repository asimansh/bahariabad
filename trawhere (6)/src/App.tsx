import React, { useState, useRef } from 'react';
import { 
  Compass, 
  Map as MapIcon, 
  Heart, 
  History, 
  Search, 
  LayoutDashboard,
  MapPin,
  ArrowRight,
  Rocket,
  Users,
  Share2,
  Sparkles,
  Calendar,
  DollarSign,
  Plane,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Clock,
  Utensils,
  Camera,
  ExternalLink,
  Info,
  ArrowLeft,
  User,
  LogOut,
  Settings as SettingsIcon,
  Mail,
  Lock,
  Globe,
  Bell,
  Moon,
  CreditCard,
  Camera as CameraIcon,
  Shield,
  ShieldCheck,
  X,
  UserPlus,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import Markdown from 'react-markdown';

import { AdminDashboard } from './components/AdminDashboard';

// --- Types ---

interface Destination {
  id: string;
  title: string;
  location: string;
  country: string;
  image: string;
  lastUpdated: string;
  isFavorite: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role?: 'user' | 'admin';
  isPublic: boolean;
  preferences: {
    currency: string;
    language: string;
    notifications: boolean;
    darkMode: boolean;
  };
}

type Tab = 'dashboard' | 'planner' | 'favorites' | 'history' | 'settings' | 'search' | 'profile' | 'meet' | 'admin';

interface ItineraryDay {
  dayNumber: number;
  theme: string;
  imagePrompt: string;
  activities: {
    time: string;
    title: string;
    description: string;
    type: 'sightseeing' | 'dining' | 'travel' | 'leisure';
  }[];
}

interface Itinerary {
  title: string;
  summary: string;
  heroImagePrompt: string;
  days: ItineraryDay[];
}

// --- Mock Data ---

const SAVED_DESTINATIONS: Destination[] = [
  {
    id: '1',
    title: 'Kyoto Temples',
    location: 'Kyoto, Japan',
    country: 'Japan',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzsE2Yv6WUkdG1TZQS7lC8bMg4tsLIS5cs9AYr8bHPBxeg2vA9HOWLg3arMiQ7krJubpOtSI17IZZs0s3qg1NQ9UrbuUefNsatxvBWl22YwUK8SBI2u-CiFNyA7oyJveeq-vNicSObpsh-OUbIJu1m9-catXw7O_CBqu5KBL6V35_m2VM-hG7bJ0WaXimNnQ1pBABzwu7ETCk8NHj_QQ5TT1shxHlJmFwgpr9ydQ_Xcr-m2MfFCSWNVdkPfehrvznUQl94XE9vjP0',
    lastUpdated: '2d ago',
    isFavorite: true,
  },
  {
    id: '2',
    title: 'Oia Sunset',
    location: 'Santorini, Greece',
    country: 'Greece',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC18SM98MH6qvq9kHBTPEB5ggysIbEQQV0N_P3GRwACjGLUuXfZYs-Yofjp2drOYSRQepoRnWC5-dr1wj3EF3qkt3jnLpTizZytx8bsAuWu86YDTih2-SXtfBp7Em77pW55CIWUV9jfJN5gLqtUuDpa0FaWSInKAdXjmWAJnGb1pWWfRLl16Esaf_GgL2fGbnrLqnUSotHE-8NL0-cMdoIb6GICYJnZkWfzWSflKkprUhYfvbj5Wm_GdqtGaMGo4rmCVQBByUmgA0w',
    lastUpdated: '5d ago',
    isFavorite: true,
  },
  {
    id: '3',
    title: 'Eiffel Romance',
    location: 'Paris, France',
    country: 'France',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlJzRT1aR2HqG_TkU7YmfqsGJWyeKk2Wpno-V7bYzW8kAPQp1MV1YaEgddSIFBQoiclGSIndXhSCrwNg-DjFuH3c9KzSjT_iTQ0HKQ2xfv8x9t2x1jzjOI6C22i_CegUnX5wB6PHHtUQtkzRixYTbpxdjoM64Ah5e5g5XpzahQcg-7B-qNTQg3X88BLY089Llb6Eq8PJOrpm3PpK6lhTUnCs_eZqUjoyQekhT47DRTt2NMgI0GHcqQuvIpczFQZrVJ2c90DKykLxY',
    lastUpdated: '1w ago',
    isFavorite: true,
  }
];

const RECENT_SEARCHES = ['Tokyo, JP', 'Paris, FR', 'Bali, ID', 'NYC, US'];

const MOCK_USERS: Partial<User>[] = [
  {
    id: 'u1',
    name: 'Sarah Jenkins',
    avatar: 'https://picsum.photos/seed/sarah/200/200',
    bio: 'Adventure seeker and mountain climber. Currently exploring the Alps.',
    isPublic: true,
  },
  {
    id: 'u2',
    name: 'Marco Rossi',
    avatar: 'https://picsum.photos/seed/marco/200/200',
    bio: 'Foodie and culture enthusiast. Always looking for the best pasta in Italy.',
    isPublic: true,
  },
  {
    id: 'u3',
    name: 'Elena Petrova',
    avatar: 'https://picsum.photos/seed/elena/200/200',
    bio: 'Digital nomad and photographer. Capturing the world one frame at a time.',
    isPublic: true,
  },
  {
    id: 'u4',
    name: 'David Chen',
    avatar: 'https://picsum.photos/seed/david/200/200',
    bio: 'History buff and museum lover. Exploring ancient civilizations.',
    isPublic: true,
  },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-primary text-white shadow-md shadow-primary/20' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} className={active ? 'fill-current' : ''} />
    <span className={active ? 'font-semibold' : 'font-medium'}>{label}</span>
  </button>
);

interface DestinationCardProps {
  destination: Destination;
  key?: string;
}

const DestinationCard = ({ destination }: DestinationCardProps) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-2xl transition-all"
  >
    <div className="relative h-48 overflow-hidden">
      <img 
        src={destination.image} 
        alt={destination.title} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-3 right-3">
        <button className="bg-white/90 backdrop-blur p-2 rounded-full text-red-500 shadow-sm hover:scale-110 transition-transform">
          <Heart size={18} fill={destination.isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-slate-900">
        {destination.country}
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-lg font-bold text-slate-900 mb-1">{destination.title}</h3>
      <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
        <MapPin size={14} />
        {destination.location}
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs font-semibold text-slate-400 uppercase">Last updated: {destination.lastUpdated}</span>
        <button className="text-primary font-bold text-sm hover:underline">View Details</button>
      </div>
    </div>
  </motion.div>
);

const TravelPlanner = () => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<Itinerary & { heroImageUrl?: string } | null>(null);
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 'mid',
    travelers: 1,
    interests: [] as string[]
  });

  const interests = ['Culture', 'Adventure', 'Relaxation', 'Food', 'Nature', 'Shopping', 'Nightlife', 'History'];

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a detailed travel itinerary for a trip to ${formData.destination} from ${formData.startDate} to ${formData.endDate}. 
        The budget is ${formData.budget} and there are ${formData.travelers} travelers. 
        Interests include: ${formData.interests.join(', ')}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              heroImagePrompt: { type: Type.STRING, description: "A detailed description for an AI image generator to create a beautiful hero image of this destination." },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.NUMBER },
                    theme: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING, description: "A description for an AI image generator to create a visual for this day's theme." },
                    activities: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          type: { type: Type.STRING, enum: ['sightseeing', 'dining', 'travel', 'leisure'] }
                        },
                        required: ['time', 'title', 'description', 'type']
                      }
                    }
                  },
                  required: ['dayNumber', 'theme', 'imagePrompt', 'activities']
                }
              }
            },
            required: ['title', 'summary', 'heroImagePrompt', 'days']
          }
        }
      });

      const plan = JSON.parse(response.text || '{}') as Itinerary;
      
      // Generate Hero Image
      let heroImageUrl = '';
      const dayImageUrls: Record<number, string> = {};

      const generateHeroImage = async () => {
        try {
          const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [{ text: `A high-quality, professional travel photography style image of ${formData.destination}. ${plan.heroImagePrompt}. Cinematic lighting, vibrant colors.` }]
            },
            config: { imageConfig: { aspectRatio: "16:9" } }
          });
          for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
          }
        } catch (e) { return `https://picsum.photos/seed/${encodeURIComponent(formData.destination)}/1200/600`; }
        return '';
      };

      const generateDayImage = async (day: ItineraryDay) => {
        try {
          const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [{ text: `Travel photography of ${formData.destination}: ${day.theme}. ${day.imagePrompt}. Professional, high resolution.` }]
            },
            config: { imageConfig: { aspectRatio: "16:9" } }
          });
          for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
          }
        } catch (e) { return `https://picsum.photos/seed/${encodeURIComponent(day.theme)}/800/450`; }
        return '';
      };

      // Run generations in parallel
      const [heroUrl, ...dayUrls] = await Promise.all([
        generateHeroImage(),
        ...plan.days.map(day => generateDayImage(day))
      ]);

      heroImageUrl = heroUrl;
      plan.days.forEach((day, i) => {
        (day as any).imageUrl = dayUrls[i];
      });

      setGeneratedPlan({ ...plan, heroImageUrl });
      setStep(4); // Move to results step
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (step === 4 && generatedPlan) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 pb-12"
      >
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            {generatedPlan.heroImageUrl && (
              <div className="relative h-64 w-full rounded-3xl overflow-hidden shadow-lg mb-6">
                <img 
                  src={generatedPlan.heroImageUrl} 
                  alt={generatedPlan.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-1">
                    <MapPin size={14} />
                    {formData.destination}
                  </div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">{generatedPlan.title}</h2>
                </div>
              </div>
            )}
            {!generatedPlan.heroImageUrl && (
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{generatedPlan.title}</h2>
            )}
            <p className="text-slate-500 max-w-2xl">{generatedPlan.summary}</p>
          </div>
          <button 
            onClick={() => { setStep(1); setGeneratedPlan(null); }}
            className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition-colors shrink-0"
          >
            Start Over
          </button>
        </div>

        <div className="space-y-12">
          {generatedPlan.days.map((day) => (
            <div key={day.dayNumber} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">
                  {day.dayNumber}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{day.theme}</h3>
              </div>

              {(day as any).imageUrl && (
                <div className="w-full h-48 md:h-64 rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                  <img 
                    src={(day as any).imageUrl} 
                    alt={day.theme} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {day.activities.map((activity, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                        <Clock size={14} />
                        {activity.time}
                      </div>
                      <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        activity.type === 'dining' ? 'bg-orange-100 text-orange-600' :
                        activity.type === 'sightseeing' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'travel' ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {activity.type}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        {activity.type === 'dining' ? <Utensils size={16} /> : 
                         activity.type === 'sightseeing' ? <Camera size={16} /> : 
                         <MapPin size={16} />}
                        {activity.title}
                      </h4>
                      <p className="text-sm text-slate-500 leading-relaxed">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Your Next Adventure</h2>
        <p className="text-slate-500">Tell us about your dream trip and our AI will craft the perfect itinerary.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-4 max-w-md">
        {[1, 2, 3].map(i => (
          <React.Fragment key={i}>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= i ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step > i ? <CheckCircle2 size={20} /> : i}
            </div>
            {i < 3 && <div className={`flex-1 h-1 rounded-full ${step > i ? 'bg-primary' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <motion.div 
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-3xl relative overflow-hidden"
      >
        {isGenerating && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="h-20 w-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Plane className="text-primary animate-pulse" size={32} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Crafting your adventure...</h3>
              <p className="text-slate-500 max-w-xs mx-auto">We're designing your itinerary and generating custom visuals for your trip.</p>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                Where do you want to go?
              </label>
              <input 
                type="text"
                placeholder="e.g. Tokyo, Japan"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={formData.destination}
                onChange={(e) => setFormData({...formData, destination: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  Start Date
                </label>
                <input 
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  End Date
                </label>
                <input 
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <DollarSign size={16} className="text-primary" />
                What's your budget?
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['budget', 'mid', 'luxury'].map(b => (
                  <button
                    key={b}
                    onClick={() => setFormData({...formData, budget: b})}
                    className={`px-4 py-3 rounded-xl border font-bold capitalize transition-all ${
                      formData.budget === b 
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Users size={16} className="text-primary" />
                How many travelers?
              </label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setFormData({...formData, travelers: Math.max(1, formData.travelers - 1)})}
                  className="h-12 w-12 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 font-bold text-xl"
                >
                  -
                </button>
                <span className="text-xl font-bold w-12 text-center">{formData.travelers}</span>
                <button 
                  onClick={() => setFormData({...formData, travelers: formData.travelers + 1})}
                  className="h-12 w-12 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Heart size={16} className="text-primary" />
              What are your interests?
            </label>
            <div className="flex flex-wrap gap-3">
              {interests.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-6 py-2 rounded-full border font-semibold transition-all ${
                    formData.interests.includes(interest)
                      ? 'bg-primary border-primary text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between">
          <button 
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || isGenerating}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Back
          </button>
          <button 
            onClick={() => step < 3 ? setStep(step + 1) : handleGenerate()}
            disabled={isGenerating || (step === 1 && !formData.destination)}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Crafting Plan...
              </>
            ) : step === 3 ? (
              <>
                <Sparkles size={20} />
                Generate Plan
              </>
            ) : (
              <>
                Next
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Auth Modal ---

const AuthModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth
    const isAdmin = email.toLowerCase() === 'asimbyans@gmail.com';
    const mockUser: User = {
      id: '1',
      name: name || (isAdmin ? 'Admin' : 'John Doe'),
      email: email || 'john@example.com',
      avatar: 'https://picsum.photos/seed/avatar/100/100',
      bio: isAdmin ? 'System Administrator' : 'Travel enthusiast and digital nomad.',
      role: isAdmin ? 'admin' : 'user',
      isPublic: true,
      preferences: {
        currency: 'USD',
        language: 'English',
        notifications: true,
        darkMode: false
      }
    };
    onLogin(mockUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">
              {isLogin ? 'Welcome Back' : 'Join WanderAI'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:bg-primary/90 transition-all mt-4"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary font-bold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Profile View ---

const ProfileView = ({ user, onUpdate }: { user: User, onUpdate: (user: User) => void }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate({ ...user, name, bio });
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
                id="avatar-upload"
              />
              <label 
                htmlFor="avatar-upload"
                className="relative block cursor-pointer group"
              >
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-32 h-32 rounded-3xl object-cover shadow-lg ring-4 ring-white transition-all group-hover:ring-primary/20"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-900/40 rounded-3xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                  <CameraIcon size={24} className="text-white mb-1" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                </div>
              </label>
              <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg border-2 border-white">
                <CameraIcon size={14} />
              </div>
            </div>
            <label htmlFor="avatar-upload" className="text-xs font-bold text-primary cursor-pointer hover:underline">
              Change Photo
            </label>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                {isEditing ? (
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-3xl font-extrabold text-slate-900 bg-slate-50 border-none rounded-xl px-3 py-1 focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <h2 className="text-3xl font-extrabold text-slate-900">{user.name}</h2>
                )}
                <p className="text-slate-500">{user.email}</p>
              </div>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                {isEditing ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">About Me</label>
              {isEditing ? (
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary min-h-[100px]"
                  placeholder="Tell us about your travel style..."
                />
              ) : (
                <p className="text-slate-600 leading-relaxed">{user.bio || 'No bio yet.'}</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <div className="bg-slate-50 px-4 py-2 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Trips Planned</p>
                <p className="text-lg font-bold text-slate-900">12</p>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Favorites</p>
                <p className="text-lg font-bold text-slate-900">24</p>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Reviews</p>
                <p className="text-lg font-bold text-slate-900">8</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">Profile Visibility</h4>
                <p className="text-xs text-slate-500">Make your profile public to meet other travellers.</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => onUpdate({ ...user, isPublic: false })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !user.isPublic ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Lock size={14} />
                  Private
                </button>
                <button 
                  onClick={() => onUpdate({ ...user, isPublic: true })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    user.isPublic ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Globe size={14} />
                  Public
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Account Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Two-Factor Auth</p>
                  <p className="text-xs text-slate-500">Add an extra layer of security</p>
                </div>
              </div>
              <button className="text-primary text-sm font-bold">Enable</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Change Password</p>
                  <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                </div>
              </div>
              <button className="text-primary text-sm font-bold">Update</button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Connected Accounts</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <Globe size={16} className="text-slate-600" />
                </div>
                <p className="text-sm font-bold text-slate-900">Google Account</p>
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">Connected</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <Mail size={16} className="text-slate-600" />
                </div>
                <p className="text-sm font-bold text-slate-900">Apple ID</p>
              </div>
              <button className="text-primary text-sm font-bold">Connect</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Meet Other Travellers View ---

const MeetTravellersView = () => {
  const [friends, setFriends] = useState<string[]>([]);

  const toggleFriend = (userId: string) => {
    setFriends(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Meet Other Travellers</h2>
          <p className="text-slate-500 mt-1">Connect with explorers from around the world.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            Filter
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
            Find Matches
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_USERS.map((u) => (
          <motion.div 
            key={u.id}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex gap-6 items-center group"
          >
            <div className="relative">
              <img 
                src={u.avatar} 
                alt={u.name} 
                className="w-20 h-20 rounded-2xl object-cover shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 truncate">{u.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mt-1">{u.bio}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/5 px-2 py-1 rounded-lg">
                  Pro Traveller
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  12 Trips
                </span>
              </div>
            </div>

            <button 
              onClick={() => toggleFriend(u.id!)}
              className={`p-3 rounded-2xl transition-all ${
                friends.includes(u.id!) 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'bg-slate-100 text-slate-600 hover:bg-primary hover:text-white'
              }`}
            >
              {friends.includes(u.id!) ? <CheckCircle2 size={20} /> : <UserPlus size={20} />}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Settings View ---

const SettingsView = ({ user, onUpdate }: { user: User, onUpdate: (user: User) => void }) => {
  const [adminKey, setAdminKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const updatePref = (key: keyof User['preferences'], value: any) => {
    onUpdate({
      ...user,
      preferences: {
        ...user.preferences,
        [key]: value
      }
    });
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-bottom border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">App Preferences</h3>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                <Globe size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Language</p>
                <p className="text-sm text-slate-500">Choose your preferred language</p>
              </div>
            </div>
            <select 
              value={user.preferences.language}
              onChange={(e) => updatePref('language', e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-primary"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Currency</p>
                <p className="text-sm text-slate-500">Set your default currency for prices</p>
              </div>
            </div>
            <select 
              value={user.preferences.currency}
              onChange={(e) => updatePref('currency', e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-primary"
            >
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>JPY (¥)</option>
            </select>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Notifications</p>
                <p className="text-sm text-slate-500">Get updates on your trips and favorites</p>
              </div>
            </div>
            <button 
              onClick={() => updatePref('notifications', !user.preferences.notifications)}
              className={`w-12 h-6 rounded-full transition-colors relative ${user.preferences.notifications ? 'bg-primary' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.preferences.notifications ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 text-white rounded-2xl">
                <Moon size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Dark Mode</p>
                <p className="text-sm text-slate-500">Easier on the eyes in low light</p>
              </div>
            </div>
            <button 
              onClick={() => updatePref('darkMode', !user.preferences.darkMode)}
              className={`w-12 h-6 rounded-full transition-colors relative ${user.preferences.darkMode ? 'bg-primary' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.preferences.darkMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-bottom border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Admin Access</h3>
          <p className="text-sm text-slate-500">Restricted area for authorized personnel only</p>
        </div>
        <div className="p-6">
          {user.role === 'admin' ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Admin Mode Active</p>
                  <p className="text-sm text-slate-500">You have full access to the dashboard</p>
                </div>
              </div>
              <button 
                onClick={() => onUpdate({ ...user, role: 'user' })}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Logout Admin
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl">
                    <Lock size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Admin Verification</p>
                    <p className="text-sm text-slate-500">Enter secret key to unlock admin panel</p>
                  </div>
                </div>
                {!showKeyInput && (
                  <button 
                    onClick={() => setShowKeyInput(true)}
                    className="text-primary font-bold text-sm hover:underline"
                  >
                    Enter Key
                  </button>
                )}
              </div>
              
              {showKeyInput && (
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="password"
                    placeholder="Secret Admin Key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary"
                  />
                  <button 
                    onClick={() => {
                      if (adminKey === 'WANDER_ADMIN_99') {
                        onUpdate({ ...user, role: 'admin' });
                        setAdminKey('');
                        setShowKeyInput(false);
                      } else {
                        alert('Invalid Admin Key');
                      }
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
                  >
                    Verify
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
        <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <button className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    text: string;
    sources: { title: string; uri: string }[];
    location: string;
  } | null>(null);

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const query = overrideQuery || searchQuery;
    if (!query.trim()) return;

    setIsSearching(true);
    setActiveTab('search');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a comprehensive overview of ${query} as a travel destination. Include key attractions, best time to visit, local culture, and practical travel tips. Use Google Search to ensure the information is up-to-date.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter(chunk => chunk.web)
        .map(chunk => ({
          title: chunk.web!.title || 'Source',
          uri: chunk.web!.uri || ''
        })) || [];

      setSearchResult({
        text: response.text || 'No information found.',
        sources: sources,
        location: query
      });
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResult({
        text: "Sorry, we couldn't find information for that location. Please try another search.",
        sources: [],
        location: query
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-primary p-2 rounded-lg flex items-center justify-center">
                <Compass className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-primary">Trawhere</h1>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-20 py-2 border-none bg-slate-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm placeholder:text-slate-500"
                  placeholder="Search any location in the world..."
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="absolute inset-y-1.5 right-1.5 px-3 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSearching ? '...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <nav className="hidden lg:flex items-center gap-6 mr-4 text-sm font-semibold text-slate-600">
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-primary transition-colors">Explore</button>
                <button onClick={() => setActiveTab('meet')} className={`hover:text-primary transition-colors ${activeTab === 'meet' ? 'text-primary' : ''}`}>Meet Other Traveller</button>
                <button onClick={() => setActiveTab('planner')} className="hover:text-primary transition-colors">My Trips</button>
              </nav>
              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
              <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
              
              {user ? (
                <div className="flex items-center gap-3 pl-2">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                      <p className="text-[10px] text-primary font-medium uppercase tracking-wider mt-1">Explorer</p>
                    </div>
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                  <button 
                    onClick={() => setUser(null)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <nav className="space-y-1">
              <SidebarItem 
                icon={LayoutDashboard} 
                label="Dashboard" 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
              />
              <SidebarItem 
                icon={MapIcon} 
                label="Travel Planner" 
                active={activeTab === 'planner'} 
                onClick={() => setActiveTab('planner')}
              />
              <SidebarItem 
                icon={Search} 
                label="Search Results" 
                active={activeTab === 'search'} 
                onClick={() => setActiveTab('search')}
              />
              <SidebarItem 
                icon={Heart} 
                label="Favorites" 
                active={activeTab === 'favorites'} 
                onClick={() => setActiveTab('favorites')}
              />
              <SidebarItem 
                icon={History} 
                label="Past Trips" 
                active={activeTab === 'history'} 
                onClick={() => setActiveTab('history')}
              />
              <SidebarItem 
                icon={Users} 
                label="Meet Travellers" 
                active={activeTab === 'meet'} 
                onClick={() => setActiveTab('meet')}
              />
              <SidebarItem 
                icon={SettingsIcon} 
                label="Settings" 
                active={activeTab === 'settings'} 
                onClick={() => setActiveTab('settings')}
              />
              {user?.role === 'admin' && (
                <SidebarItem 
                  icon={Shield} 
                  label="Admin Panel" 
                  active={activeTab === 'admin'} 
                  onClick={() => setActiveTab('admin')}
                />
              )}
              {user && (
                <SidebarItem 
                  icon={User} 
                  label="Profile" 
                  active={activeTab === 'profile'} 
                  onClick={() => setActiveTab('profile')}
                />
              )}
            </nav>

            {/* Recent Searches */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <History size={14} />
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {RECENT_SEARCHES.map(search => (
                  <span 
                    key={search}
                    onClick={() => {
                      setSearchQuery(search);
                      handleSearch(undefined, search);
                    }}
                    className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {search}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  {/* Hero */}
                  <section className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-xl shadow-primary/10 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/40 z-10"></div>
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeBctROM0IqauIahqLL1tFlgduubLOcrKuftqNr-uu99Hbz0sJ4zY-MmO2YbLgdq9XdgQNrk3vTrEDSVV9FqNAb1I-MG_bs6b3gT0euMsTOD3qNtqRRQmDng1PcdgYxAmt7lhQtuFHiidor9FX0V61b_u-xAIoeHV8sRFe1a4k6ek-ditF2cPtD3hN684dtRpUPrJ6-a_hEPLuSi1ghRvxM1Tmjs5IEPUEdm4luNfxUmxVtgjVuvAkffGIh9TOB5Q1dZ1NlbMqQ-M" 
                      alt="Hero" 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 z-20 p-8 md:p-12 flex flex-col justify-center items-start max-w-2xl">
                      <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Ready for a new adventure?</h2>
                      <p className="text-white/90 text-lg mb-8 max-w-lg leading-relaxed">Plan your next dream vacation with our AI-powered itinerary builder. Tailored to your interests, budget, and style.</p>
                      <button 
                        onClick={() => setActiveTab('planner')}
                        className="bg-white text-primary hover:bg-slate-50 px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <Sparkles size={20} />
                        Start AI Planner
                      </button>
                    </div>
                  </section>

                  {/* Saved Destinations */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                        <Heart className="text-primary" size={24} />
                        Saved Destinations
                      </h2>
                      <a href="#" className="text-sm font-bold text-primary hover:underline">View All</a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {SAVED_DESTINATIONS.map(dest => (
                        <DestinationCard key={dest.id} destination={dest} />
                      ))}
                    </div>
                  </section>

                  {/* Tools */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                    <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 flex flex-col items-start gap-4">
                      <div className="bg-primary text-white p-3 rounded-2xl">
                        <Rocket size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">AI Trip Optimizer</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">Let our AI find the best routes and flight combinations to save you up to 30% on your next trip.</p>
                      <button className="mt-2 text-primary font-bold flex items-center gap-2 group hover:underline">
                        Try it now
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex flex-col items-start gap-4">
                      <div className="bg-white/10 text-white p-3 rounded-2xl">
                        <Users size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white">Community Insights</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">Join 2.5k other travelers planning trips this month. Get real-time advice and hidden gem recommendations.</p>
                      <button className="mt-2 text-white font-bold flex items-center gap-2 group hover:underline">
                        Join Community
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'planner' && (
                <motion.div 
                  key="planner"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <TravelPlanner />
                </motion.div>
              )}

              {activeTab === 'search' && (
                <motion.div 
                  key="search"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setActiveTab('dashboard')}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Search Results</h2>
                      <p className="text-slate-500">Information for "{searchResult?.location || searchQuery}"</p>
                    </div>
                  </div>

                  {isSearching ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Globe className="text-primary animate-pulse" size={24} />
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-900">Searching the world...</h3>
                        <p className="text-slate-500">Gathering the latest travel info for you.</p>
                      </div>
                    </div>
                  ) : searchResult ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                          <div className="prose prose-slate max-w-none markdown-body">
                            <Markdown>{searchResult.text}</Markdown>
                          </div>
                        </div>
                        
                        <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 flex items-center justify-between gap-6">
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900">Love this destination?</h3>
                            <p className="text-slate-600">Let our AI build a custom itinerary for your trip to {searchResult.location}.</p>
                          </div>
                          <button 
                            onClick={() => setActiveTab('planner')}
                            className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all whitespace-nowrap"
                          >
                            Plan Trip Now
                          </button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Info size={14} className="text-primary" />
                            Sources & Links
                          </h3>
                          <div className="space-y-3">
                            {searchResult.sources.length > 0 ? (
                              searchResult.sources.map((source, idx) => (
                                <a 
                                  key={idx}
                                  href={source.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                                >
                                  <div className="mt-1">
                                    <Globe size={14} className="text-slate-400 group-hover:text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-700 truncate group-hover:text-primary">{source.title}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{source.uri}</p>
                                  </div>
                                  <ExternalLink size={12} className="text-slate-300 group-hover:text-primary shrink-0" />
                                </a>
                              ))
                            ) : (
                              <p className="text-xs text-slate-500 italic">No direct sources found.</p>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-3xl text-white">
                          <h3 className="font-bold mb-2">Traveler Tip</h3>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            Always check local government travel advisories before booking your trip to {searchResult.location}.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}

              {activeTab === 'meet' && (
                <motion.div 
                  key="meet"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <MeetTravellersView />
                </motion.div>
              )}

              {activeTab === 'admin' && user?.role === 'admin' && (
                <motion.div 
                  key="admin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AdminDashboard />
                </motion.div>
              )}

              {activeTab === 'profile' && user && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-extrabold text-slate-900">My Profile</h2>
                    <p className="text-slate-500">Manage your personal information and travel stats</p>
                  </div>
                  <ProfileView user={user} onUpdate={setUser} />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-extrabold text-slate-900">Settings</h2>
                    <p className="text-slate-500">Customize your WanderAI experience</p>
                  </div>
                  {user ? (
                    <SettingsView user={user} onUpdate={setUser} />
                  ) : (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Lock size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Sign in to access settings</h3>
                      <p className="text-slate-500 max-w-sm mx-auto">You need to be logged in to manage your preferences and account settings.</p>
                      <button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                      >
                        Sign In Now
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Compass className="text-primary" size={20} />
              </div>
              <span className="text-lg font-bold text-slate-900">Trawhere</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-primary transition-colors">About Us</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Help Center</a>
            </div>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-slate-100 rounded-full text-slate-600 hover:text-primary transition-colors">
                <Share2 size={20} />
              </a>
              <a href="#" className="p-2 bg-slate-100 rounded-full text-slate-600 hover:text-primary transition-colors">
                <Globe size={20} />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
            © 2024 Trawhere. All rights reserved. Designed for adventurers.
          </div>
        </div>
      </footer>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={setUser} 
      />
    </div>
  );
}
