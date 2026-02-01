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

export default function DemoPage() {
  const navigate = useNavigate();
  const [demoStep, setDemoStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({ role: '', weddingStyle: '', topPriority: [], goals: '' });
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const script: Array<{ delay: number; run: () => void }> = [];
    let t = 0;
    const push = (d: number, fn: () => void) => { t += d; script.push({ delay: t, run: fn }); };

    push(1200, () => { setData(d => ({ ...d, role: 'self' })); });
    push(800, () => setDemoStep(2));
    push(1200, () => { setData(d => ({ ...d, weddingDate: new Date().toISOString().split('T')[0] })); });
    push(800, () => setDemoStep(3));
    push(1000, () => { setData(d => ({ ...d, weddingCity: 'San Francisco', weddingState: 'CA' })); });
    push(800, () => setDemoStep(4));
    push(1000, () => { setData(d => ({ ...d, religions: ['Hindu'], isReligious: true })); });
    push(800, () => setDemoStep(5));
    push(900, () => { setData(d => ({ ...d, estimatedBudget: 15000, guestCount: 120 })); });
    push(800, () => setDemoStep(6));
    push(1000, () => { setData(d => ({ ...d, goals: 'Beautiful cultural ceremony' })); });
    push(700, () => setDemoStep(7));
    push(900, () => setDemoStep(8));
    push(900, () => { setShowDashboard(true); });

    const timers: number[] = [];
    script.forEach(({ delay, run }) => {
      const id = window.setTimeout(run, delay) as unknown as number;
      timers.push(id);
    });

    const finish = window.setTimeout(() => { /* remain on page, show dashboard */ }, 25_000) as unknown as number;
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

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl bg-white/95 rounded-2xl shadow-xl p-6">
          <div className="h-full overflow-auto">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/5 min-w-0">
                <h3 className="text-lg font-semibold">Onboarding (Demo)</h3>
                <div className="mt-4 bg-white rounded-2xl shadow p-6 max-h-[60vh] overflow-auto break-words whitespace-normal">
                  {demoStep === 1 && <RoleSelection data={data} updateData={(d)=>setData(prev=>({...prev,...d}))} onNext={()=>setDemoStep(2)} onBack={()=>setDemoStep(1)} />}
                  {demoStep === 2 && <WeddingDate data={data} updateData={(d)=>setData(prev=>({...prev,...d}))} onNext={()=>setDemoStep(3)} onBack={()=>setDemoStep(1)} />}
                  {demoStep === 3 && <Location data={data} updateData={(d)=>setData(prev=>({...prev,...d}))} onNext={()=>setDemoStep(4)} onBack={()=>setDemoStep(2)} />}
                  {demoStep === 4 && <Preferences data={data} updateData={(d)=>setData(prev=>({...prev,...d}))} onNext={()=>setDemoStep(5)} onBack={()=>setDemoStep(3)} />}
                  {demoStep === 5 && <CeremonyDetails data={data} updateData={(d)=>setData(prev=>({...prev,...d}))} onNext={()=>setDemoStep(6)} onBack={()=>setDemoStep(4)} />}
                  {demoStep === 6 && <Goals data={data} updateData={(d)=>setData(prev=>({...prev,...d}))} onNext={()=>setDemoStep(7)} onBack={()=>setDemoStep(5)} />}
                  {demoStep === 7 && <Summary data={data} onBack={()=>setDemoStep(6)} onComplete={()=>setDemoStep(8)} />}
                  {demoStep === 8 && (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold">Finishing…</h3>
                      <p className="text-sm text-gray-500 mt-2">Opening your personalized dashboard now.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:w-3/5 min-w-0">
                <h3 className="text-lg font-semibold mb-3">Dashboard Preview</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-4 break-words whitespace-normal">
                  <div className="p-3 bg-white rounded-md border">
                    <div className="text-xs text-gray-500">Location</div>
                    <div className="text-lg font-bold">{data.weddingCity || 'San Francisco'}, {data.weddingState || 'CA'}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-primary-50 rounded-md">
                      <div className="text-xs text-gray-500">Guests</div>
                      <div className="text-2xl font-bold">{data.guestCount || 120}</div>
                    </div>
                    <div className="p-3 bg-white rounded-md border">
                      <div className="text-xs text-gray-500">Budget</div>
                      <div className="text-2xl font-bold">${(data.estimatedBudget || 15000).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-md border">
                    <div className="text-xs text-gray-500">Favorites</div>
                    <div className="mt-2">SF Elite Photography · Grand SF Ballroom</div>
                  </div>

                  {showDashboard && (
                    <div className="p-3 bg-green-50 rounded-md border border-green-100 text-green-700">
                      Demo complete — this is how your dashboard will look.
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
