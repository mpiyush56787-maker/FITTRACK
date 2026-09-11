import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { FoodTracker } from './components/FoodTracker';
import { WorkoutLogger } from './components/WorkoutLogger';
import { StrengthRecords } from './components/StrengthRecords';
import { HistoryView } from './components/HistoryView';
import { ProgressDashboard } from './components/ProgressDashboard';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { ExpertContactModal } from './components/ExpertContactModal';
import { LoadingScreen } from './components/LoadingScreen';
import {
  Flame,
  UtensilsCrossed,
  Dumbbell,
  Crown,
  User,
  Wifi,
  Battery,
  Smartphone,
  Maximize2,
  MessageCircle
} from 'lucide-react';

export function App() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'profile'>('signup');
  const [isExpertModalOpen, setIsExpertModalOpen] = useState<boolean>(false);
  // Default to phone portrait container so the preview renders as a true 390px portrait mobile phone app
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleOpenAuthModal = (mode: 'login' | 'signup' | 'profile') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBottomTabClick = (tabId: string) => {
    if (tabId === 'profile') {
      handleOpenAuthModal(user ? 'profile' : 'login');
    } else {
      handleNavigate(tabId);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1013] text-zinc-100 flex flex-col font-sans selection:bg-[#E53935] selection:text-white">
      {/* Top Device Switcher Bar on Desktop/Iframe Screens */}
      <div className="hidden sm:flex items-center justify-between px-4 py-2 bg-[#121417] border-b border-[#2A2E35] text-xs text-zinc-400 shrink-0 z-50">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#E53935] animate-pulse" />
          <span className="font-athletic uppercase font-bold text-zinc-200 tracking-wider">
            FITTRACK Mobile-First Mode (390px Portrait Phone)
          </span>
          <span className="text-[10px] text-zinc-500 hidden md:inline">
            — Optimized for 360px, 390px & 430px Viewports
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="toggle-phone-frame-btn"
            onClick={() => setIsPhoneFrame(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-athletic uppercase text-[11px] font-bold transition cursor-pointer ${
              isPhoneFrame
                ? 'bg-[#E53935] text-white shadow-md'
                : 'bg-[#202328] text-zinc-400 hover:text-zinc-200 hover:bg-[#2A2E35]'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>390px Phone</span>
          </button>
          <button
            id="toggle-fullscreen-btn"
            onClick={() => setIsPhoneFrame(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-athletic uppercase text-[11px] font-bold transition cursor-pointer ${
              !isPhoneFrame
                ? 'bg-[#E53935] text-white shadow-md'
                : 'bg-[#202328] text-zinc-400 hover:text-zinc-200 hover:bg-[#2A2E35]'
            }`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Fullscreen</span>
          </button>
        </div>
      </div>

      {isPhoneFrame ? (
        /* ================= 390px PORTRAIT MOBILE PHONE EXPERIENCE ================= */
        <div className="flex-1 flex flex-col items-center justify-start sm:py-3 sm:px-4 w-full">
          <div
            id="fittrack-mobile-phone-frame"
            className="w-full max-w-[420px] min-h-screen sm:min-h-[844px] sm:max-h-[92vh] bg-[#17191C] text-zinc-100 flex flex-col relative sm:rounded-[44px] sm:border-[8px] sm:border-[#2A2E35] sm:shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden"
          >
            {/* Phone Top Status Bar (Time + Speaker Island + Wifi/Battery) */}
            <div className="w-full bg-[#17191C] pt-2 px-5 pb-1 flex items-center justify-between text-zinc-400 text-[11px] font-semibold tracking-tight shrink-0 select-none border-b border-[#2A2E35]/40">
              <span className="font-athletic font-bold text-zinc-300">9:41</span>
              {/* Speaker pill / Dynamic island */}
              <div className="h-4 w-24 bg-[#202328] border border-[#2A2E35] rounded-full flex items-center justify-center">
                <div className="h-1.5 w-10 bg-zinc-700 rounded-full" />
              </div>
              <div className="flex items-center gap-1.5">
                <Wifi className="h-3 w-3 text-zinc-400" />
                <Battery className="h-3.5 w-3.5 text-zinc-400" />
              </div>
            </div>

            {/* Compact Mobile Header */}
            <Navbar
              currentTab={currentTab}
              setCurrentTab={handleNavigate}
              onOpenExpertModal={() => setIsExpertModalOpen(true)}
              onOpenAuthModal={handleOpenAuthModal}
              isPhoneMode={true}
            />

            {/* Scrollable Mobile Viewport Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 pt-3 pb-24 scrollbar-thin scrollbar-thumb-zinc-700">
              {currentTab === 'dashboard' && (
                <Dashboard
                  onNavigate={handleNavigate}
                  onOpenExpertModal={() => setIsExpertModalOpen(true)}
                  onOpenAuthModal={handleOpenAuthModal}
                />
              )}

              {currentTab === 'food' && <FoodTracker />}

              {currentTab === 'workout' && (
                <WorkoutLogger
                  onWorkoutSaved={() => {}}
                  onNavigate={handleNavigate}
                />
              )}

              {currentTab === 'strength' && <StrengthRecords />}

              {currentTab === 'history' && <HistoryView />}

              {currentTab === 'progress' && <ProgressDashboard />}

              {currentTab === 'plans' && (
                <SubscriptionPlans onOpenExpertModal={() => setIsExpertModalOpen(true)} />
              )}

              {currentTab === 'admin' && (
                <AdminPanel
                  onNavigate={handleNavigate}
                  onOpenAuthModal={handleOpenAuthModal}
                />
              )}
            </main>

            {/* Mobile Fixed/Docked Bottom Navigation Bar (5 Primary Views: Dashboard, Workouts, Meals, Plans, Profile) */}
            <nav
              id="mobile-portrait-bottom-nav"
              className="sticky bottom-0 left-0 right-0 z-40 bg-[#141619] border-t border-[#2A2E35] px-1 py-1 shadow-[0_-6px_20px_rgba(0,0,0,0.85)] shrink-0"
            >
              <div className="grid grid-cols-5 items-center w-full">
                {/* 1. Dashboard */}
                <button
                  id="bottom-tab-dashboard"
                  onClick={() => handleBottomTabClick('dashboard')}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 min-h-[50px] transition cursor-pointer ${
                    currentTab === 'dashboard'
                      ? 'text-[#E53935] font-extrabold'
                      : 'text-zinc-400 hover:text-white font-semibold'
                  }`}
                >
                  <Flame className={`h-5 w-5 ${currentTab === 'dashboard' ? 'text-[#E53935] stroke-[2.5]' : 'text-zinc-400'}`} />
                  <span className="text-[10px] font-athletic uppercase tracking-wider mt-0.5 leading-none">Dashboard</span>
                  {currentTab === 'dashboard' && <span className="h-1 w-3 rounded-full bg-[#E53935] mt-0.5" />}
                </button>

                {/* 2. Workouts */}
                <button
                  id="bottom-tab-workouts"
                  onClick={() => handleBottomTabClick('workout')}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 min-h-[50px] transition cursor-pointer ${
                    currentTab === 'workout'
                      ? 'text-[#E53935] font-extrabold'
                      : 'text-zinc-400 hover:text-white font-semibold'
                  }`}
                >
                  <Dumbbell className={`h-5 w-5 ${currentTab === 'workout' ? 'text-[#E53935] stroke-[2.5]' : 'text-zinc-400'}`} />
                  <span className="text-[10px] font-athletic uppercase tracking-wider mt-0.5 leading-none">Workouts</span>
                  {currentTab === 'workout' && <span className="h-1 w-3 rounded-full bg-[#E53935] mt-0.5" />}
                </button>

                {/* 3. Meals */}
                <button
                  id="bottom-tab-meals"
                  onClick={() => handleBottomTabClick('food')}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 min-h-[50px] transition cursor-pointer ${
                    currentTab === 'food'
                      ? 'text-[#E53935] font-extrabold'
                      : 'text-zinc-400 hover:text-white font-semibold'
                  }`}
                >
                  <UtensilsCrossed className={`h-5 w-5 ${currentTab === 'food' ? 'text-[#E53935] stroke-[2.5]' : 'text-zinc-400'}`} />
                  <span className="text-[10px] font-athletic uppercase tracking-wider mt-0.5 leading-none">Meals</span>
                  {currentTab === 'food' && <span className="h-1 w-3 rounded-full bg-[#E53935] mt-0.5" />}
                </button>

                {/* 4. Plans */}
                <button
                  id="bottom-tab-plans"
                  onClick={() => handleBottomTabClick('plans')}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 min-h-[50px] transition cursor-pointer ${
                    currentTab === 'plans'
                      ? 'text-[#E53935] font-extrabold'
                      : 'text-zinc-400 hover:text-white font-semibold'
                  }`}
                >
                  <Crown className={`h-5 w-5 ${currentTab === 'plans' ? 'text-[#E53935] stroke-[2.5]' : 'text-zinc-400'}`} />
                  <span className="text-[10px] font-athletic uppercase tracking-wider mt-0.5 leading-none">Plans</span>
                  {currentTab === 'plans' && <span className="h-1 w-3 rounded-full bg-[#E53935] mt-0.5" />}
                </button>

                {/* 5. Profile */}
                <button
                  id="bottom-tab-profile"
                  onClick={() => handleBottomTabClick('profile')}
                  className="flex flex-col items-center justify-center py-1.5 px-1 min-h-[50px] transition cursor-pointer text-zinc-400 hover:text-white font-semibold"
                >
                  <User className="h-5 w-5 text-zinc-400" />
                  <span className="text-[10px] font-athletic uppercase tracking-wider mt-0.5 leading-none">Profile</span>
                </button>
              </div>

              {/* Smartphone Bottom Home Bar Indicator */}
              <div className="w-28 h-1 bg-zinc-600/70 rounded-full mx-auto mt-1 mb-0.5" />
            </nav>
          </div>
        </div>
      ) : (
        /* ================= FULLSCREEN / DESKTOP FALLBACK VIEW ================= */
        <div className="flex-1 flex flex-col w-full">
          <Navbar
            currentTab={currentTab}
            setCurrentTab={handleNavigate}
            onOpenExpertModal={() => setIsExpertModalOpen(true)}
            onOpenAuthModal={handleOpenAuthModal}
            isPhoneMode={false}
          />

          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28 sm:pb-16 overflow-x-hidden">
            {currentTab === 'dashboard' && (
              <Dashboard
                onNavigate={handleNavigate}
                onOpenExpertModal={() => setIsExpertModalOpen(true)}
                onOpenAuthModal={handleOpenAuthModal}
              />
            )}

            {currentTab === 'food' && <FoodTracker />}

            {currentTab === 'workout' && (
              <WorkoutLogger
                onWorkoutSaved={() => {}}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'strength' && <StrengthRecords />}

            {currentTab === 'history' && <HistoryView />}

            {currentTab === 'progress' && <ProgressDashboard />}

            {currentTab === 'plans' && (
              <SubscriptionPlans onOpenExpertModal={() => setIsExpertModalOpen(true)} />
            )}

            {currentTab === 'admin' && (
              <AdminPanel
                onNavigate={handleNavigate}
                onOpenAuthModal={handleOpenAuthModal}
              />
            )}
          </main>

          <footer className="bg-[#17191C] py-6 text-center text-xs text-zinc-400 pb-28 md:pb-8 border-t border-[#2A2E35]">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-athletic uppercase text-white tracking-wider">
                  FIT<span className="text-[#E53935]">TRACK</span>
                </span>
                <span className="text-zinc-600">•</span>
                <span className="italic text-zinc-400">"Discipline beats motivation. Track the work. Trust the process."</span>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-athletic uppercase">
                <button
                  onClick={() => setIsExpertModalOpen(true)}
                  className="text-red-400 hover:text-red-300 font-bold hover:underline flex items-center gap-1.5 transition cursor-pointer"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-[#E53935]" />
                  WhatsApp Support: +91 7206125905
                </button>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onNavigateToPlans={() => handleNavigate('plans')}
      />

      <ExpertContactModal
        isOpen={isExpertModalOpen}
        onClose={() => setIsExpertModalOpen(false)}
      />
    </div>
  );
}

export default App;
