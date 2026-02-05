import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import RoleSelection from './onboarding/steps/RoleSelection';
import WeddingDate from './onboarding/steps/WeddingDate';
import Location from './onboarding/steps/Location';
import Preferences from './onboarding/steps/Preferences';
import CeremonyDetails from './onboarding/steps/CeremonyDetails';
import Goals from './onboarding/steps/Goals';
import Summary from './onboarding/steps/Summary';
import { OnboardingData } from './onboarding/Onboarding';
import { Heart } from 'lucide-react';

const MovieTrailerText = ({ text, show }: { text: string; show: boolean }) => (
  <div
    className={`text-center text-2xl md:text-3xl font-bold text-primary-600 transition-all duration-500 ${
      show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    }`}
  >
    {text}
  </div>
);

export default function DemoPage() {
  const navigate = useNavigate();
  const [demoStep, setDemoStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({ role: '', weddingStyle: '', topPriority: [], goals: '' });
  const [showDashboard, setShowDashboard] = useState(false);
  const [trailerTexts, setTrailerTexts] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const script: Array<{ delay: number; run: () => void }> = [];
    let t = 0;
    const push = (d: number, fn: () => void) => { t += d; script.push({ delay: t, run: fn }); };

    push(500, () => setTrailerTexts(prev => ({ ...prev, 0: true })));
    push(1200, () => { setTrailerTexts(prev => ({ ...prev, 0: false })); setData(d => ({ ...d, role: 'self' })); });
    push(500, () => setDemoStep(2));
    push(500, () => setTrailerTexts(prev => ({ ...prev, 1: true })));
    push(1200, () => { setTrailerTexts(prev => ({ ...prev, 1: false })); setData(d => ({ ...d, weddingDate: new Date().toISOString().split('T')[0] })); });
    push(500, () => setDemoStep(3));
    push(500, () => setTrailerTexts(prev => ({ ...prev, 2: true })));
    push(1000, () => { setTrailerTexts(prev => ({ ...prev, 2: false })); setData(d => ({ ...d, weddingCity: 'San Francisco', weddingState: 'CA' })); });
    push(500, () => setDemoStep(4));
    push(500, () => setTrailerTexts(prev => ({ ...prev, 3: true })));
    push(1000, () => { setTrailerTexts(prev => ({ ...prev, 3: false })); setData(d => ({ ...d, religions: ['Hindu'], isReligious: true })); });
    push(500, () => setDemoStep(5));
    push(500, () => setTrailerTexts(prev => ({ ...prev, 4: true })));
    push(900, () => { setTrailerTexts(prev => ({ ...prev, 4: false })); setData(d => ({ ...d, estimatedBudget: 15000, guestCount: 120 })); });
    push(500, () => setDemoStep(6));
    push(500, () => setTrailerTexts(prev => ({ ...prev, 5: true })));
    push(1000, () => { setTrailerTexts(prev => ({ ...prev, 5: false })); setData(d => ({ ...d, goals: 'Beautiful cultural ceremony' })); });
    push(500, () => setDemoStep(7));
    push(1200, () => setTrailerTexts(prev => ({ ...prev, 6: true })));
    push(500, () => setDemoStep(8));
    push(1000, () => { setShowDashboard(true); setTrailerTexts(prev => ({ ...prev, 6: false, 7: true })); });

    const timers: number[] = [];
    script.forEach(({ delay, run }) => {
      const id = window.setTimeout(run, delay) as unknown as number;
      timers.push(id);
    });

    const finish = window.setTimeout(() => { /* remain on page, show dashboard */ }, 30_000) as unknown as number;
    timers.push(finish);

    return () => timers.forEach((id) => clearTimeout(id));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-100 text-gray-900 flex flex-col">
      <header className="w-full border-b border-white/20 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 text-white p-2 rounded-md">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Vivaha</h1>
              <p className="text-xs text-white/80">Your Wedding Planner</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-white/90 text-primary-700 rounded-md font-medium">Back to Home</button>
            <button
              aria-label="Toggle theme"
              onClick={() => {
                const isDark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
              }}
              className="px-3 py-2 rounded-md bg-white/90 text-primary-700 border ml-2"
            >
              Theme
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-7xl">
          {/* Movie Trailer Style Descriptions */}
          <div className="mb-6 h-12 flex items-center justify-center">
            <MovieTrailerText text="Tell us who you are" show={trailerTexts[0]} />
            <MovieTrailerText text="When's the big day?" show={trailerTexts[1]} />
            <MovieTrailerText text="Where will it be?" show={trailerTexts[2]} />
            <MovieTrailerText text="What's your style?" show={trailerTexts[3]} />
            <MovieTrailerText text="Budget & guest count" show={trailerTexts[4]} />
            <MovieTrailerText text="Tell us your dreams" show={trailerTexts[5]} />
            <MovieTrailerText text="Your dashboard is ready!" show={trailerTexts[6]} />
            <MovieTrailerText text="Welcome to Vivaha ✨" show={trailerTexts[7]} />
          </div>

          <div className="bg-white/95 rounded-2xl shadow-xl p-4 md:p-8">
            <div className={`grid gap-6 min-h-[50vh] ${demoStep === 8 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
              {/* Onboarding Section - Hide when complete */}
              {demoStep !== 8 && (
                <div className="flex flex-col min-w-0">
                  <h3 className="text-lg md:text-xl font-semibold mb-4">Your Setup</h3>
                  <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl p-4 md:p-6 flex-1 overflow-auto border border-primary-100">
                    <div className="min-h-96 w-full">
                      {demoStep === 1 && <RoleSelection data={data} updateData={(d)=>setData(prev=>({...prev,...d}))} onNext={()=>setDemoStep(2)} onBack={()=>setDemoStep(1)} />}
                      {demoStep === 2 && <WeddingDate data={data} updateData={(d)=>setData(prev=>({...prev,...d}))} onNext={()=>setDemoStep(3)} onBack={()=>setDemoStep(1)} />}
                      {demoStep === 3 && <Location data={data} updateData={(d)=>setData(prev=>({...prev,...d}))} onNext={()=>setDemoStep(4)} onBack={()=>setDemoStep(2)} />}
                      {demoStep === 4 && <Preferences data={data} updateData={(d)=>setData(prev=>({...prev,...d}))} onNext={()=>setDemoStep(5)} onBack={()=>setDemoStep(3)} />}
                      {demoStep === 5 && <CeremonyDetails data={data} updateData={(d)=>setData(prev=>({...prev,...d}))} onNext={()=>setDemoStep(6)} onBack={()=>setDemoStep(4)} />}
                      {demoStep === 6 && <Goals data={data} updateData={(d)=>setData(prev=>({...prev,...d}))} onNext={()=>setDemoStep(7)} onBack={()=>setDemoStep(5)} />}
                      {demoStep === 7 && <Summary data={data} onBack={()=>setDemoStep(6)} onComplete={()=>setDemoStep(8)} />}
                    </div>
                  </div>
                </div>
              )}

              {/* Dashboard Preview Section */}
              <div className="flex flex-col min-w-0">
                <h3 className="text-lg md:text-xl font-semibold mb-4">Your Dashboard</h3>
                <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-xl p-4 md:p-6 flex-1 overflow-auto border border-gray-200">
                  {!showDashboard ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      <div className="text-center">
                        <div className="text-4xl mb-3">⏳</div>
                        <p>Setting up your dashboard...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Welcome Banner */}
                      <div className="p-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg text-white shadow-lg">
                        <div className="text-2xl font-bold">Welcome to Your Wedding Hub! 🎉</div>
                        <p className="text-primary-100 mt-1">Everything you need in one place</p>
                      </div>

                      {/* Location Card */}
                      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
                        <div className="text-xs text-gray-500 uppercase font-semibold">📍 Location</div>
                        <div className="text-2xl font-bold text-primary-600 mt-2">{data.weddingCity || 'San Francisco'}, {data.weddingState || 'CA'}</div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-primary-100 rounded-lg border border-primary-200 shadow-sm">
                          <div className="text-xs text-primary-700 uppercase font-semibold">👥 Guests</div>
                          <div className="text-3xl font-bold text-primary-700 mt-2">{data.guestCount || 120}</div>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="text-xs text-gray-500 uppercase font-semibold">💰 Budget</div>
                          <div className="text-2xl font-bold text-gray-900 mt-2">${(data.estimatedBudget || 15000).toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-xs text-gray-500 uppercase font-semibold mb-3">🚀 Quick Actions</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="text-green-500">✓</span> Guest list created
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="text-green-500">✓</span> Budget tracker set up
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="text-green-500">✓</span> Venue search ready
                          </div>
                        </div>
                      </div>

                      {/* Suggested Vendors */}
                      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-xs text-gray-500 uppercase font-semibold">⭐ Suggested Vendors</div>
                        <div className="mt-3 space-y-2 text-sm text-gray-700">
                          <div className="flex justify-between items-center">
                            <span>📷 SF Elite Photography</span>
                            <span className="text-xs text-primary-600">View</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>🏛️ Grand SF Ballroom</span>
                            <span className="text-xs text-primary-600">View</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>🍰 Sweet Moments Bakery</span>
                            <span className="text-xs text-primary-600">View</span>
                          </div>
                        </div>
                      </div>

                      {/* Success Message */}
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 shadow-md">
                        <div className="text-center">
                          <div className="text-3xl mb-2">✨</div>
                          <p className="text-sm font-semibold text-green-800">Your dashboard is ready!</p>
                          <p className="text-xs text-green-700 mt-1">Start planning your dream wedding</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>Enjoy the demo — <Link to="/">Return home</Link></p>
        </div>
      </footer>
    </div>
  );
}
