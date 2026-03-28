import { useState } from 'react';
import { Sparkles, DollarSign, Users, MessageSquare, Check, ArrowRight, Loader2, Hotel } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AIRecommendation() {
  const [budget, setBudget] = useState(200);
  const [preferences, setPreferences] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    recommendation: string;
    suggestedRoomTypes: string[];
  } | null>(null);

  const handleGetRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget, preferences, guestCount })
      });
      const data = await response.json();
      setRecommendation(data);
    } catch (error) {
      console.error('Failed to get recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-900/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Guest Concierge</h1>
        </div>
        <p className="text-slate-500 font-medium">Intelligent room recommendations based on guest preferences</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Form */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
          <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Guest Preferences
          </h2>
          
          <form onSubmit={handleGetRecommendation} className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nightly Budget</label>
                <span className="text-2xl font-black text-blue-600">${budget}</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>$50</span>
                <span>$1000+</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Number of Guests</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Guests</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Room Type Preference</label>
                <div className="relative">
                  <Hotel className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700">
                    <option>Any Type</option>
                    <option>Modern</option>
                    <option>Classic</option>
                    <option>Minimalist</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Additional Preferences</label>
              <textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="e.g. Quiet room, high floor, near elevator, ocean view if possible..."
                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none text-slate-700 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/20"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-blue-400" />
                  Generate Recommendation
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Section */}
        <div className="flex flex-col">
          {recommendation ? (
            <div className="bg-slate-900 text-white p-10 rounded-[40px] shadow-2xl flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black tracking-tight">AI Suggestion</h3>
              </div>

              <div className="flex-1 prose prose-invert max-w-none mb-12">
                <div className="text-slate-300 text-lg leading-relaxed font-medium">
                  <ReactMarkdown>
                    {recommendation.recommendation}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Suggested Room Types</p>
                <div className="flex flex-wrap gap-3">
                  {recommendation.suggestedRoomTypes.map((type, i) => (
                    <div key={i} className="bg-white/10 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 group hover:bg-white/20 transition-all cursor-default">
                      <div className="bg-blue-600 p-1.5 rounded-lg">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="font-bold">{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Confidence Score</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={cn("w-6 h-1.5 rounded-full", i <= 4 ? "bg-blue-500" : "bg-white/10")}></div>)}
                  </div>
                </div>
                <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-all">
                  Book Suggested
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[40px] border border-dashed border-slate-200 p-12 text-center">
              <div className="bg-slate-50 p-8 rounded-full mb-8">
                <Sparkles className="w-16 h-16 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Ready to assist</h3>
              <p className="text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
                Enter the guest's budget and preferences to generate a personalized room recommendation using our AI engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
