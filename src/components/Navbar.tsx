import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Dumbbell,
  Flame,
  UtensilsCrossed,
  TrendingUp,
  Award,
  Calendar,
  Crown,
  MessageCircle,
  User,
  LogOut,
  Shield,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { SubscriptionTier } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenExpertModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'signup' | 'profile') => void;
  isPhoneMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenExpertModal,
  onOpenAuthModal,
  isPhoneMode = false
}) => {
  const { user, profile, subscription, logout, changeSubscriptionTier } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getTierBadge = (tier?: SubscriptionTier) => {
    switch (tier) {
      case 'PLAN_699':
        return { label: '₹699 ELITE', shortLabel: 'ELITE', color: 'border-red-600 bg-red-950 text-red-300' };
      case 'PLAN_449':
        return { label: '₹449 PERFORMANCE', shortLabel: '₹449', color: 'border-red-700 bg-[#22232a] text-red-400' };
      case 'PLAN_299':
        return { label: '₹299 NUTRITION', shortLabel: '₹299', color: 'border-zinc-700 bg-[#22232a] text-red-400' };
      default:
        return { label: 'FREE ATHLETE', shortLabel: 'FREE', color: 'border-zinc-700 bg-[#1e2026] text-zinc-300' };
    }
  };

  const badge = getTierBadge(subscription?.tier);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Flame },
    { id: 'food', label: 'Food Tracker', icon: UtensilsCrossed },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'strength', label: 'Strength & PRs', icon: Award },
    { id: 'history', label: 'History', icon: Calendar },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'plans', label: 'My Plan', icon: Crown }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2A2E35] bg-[#17191C] shadow-lg">
      <div className="w-full px-3 sm:px-4">
        <div className="flex h-13 sm:h-14 items-center justify-between gap-2">
          {/* Brand Logo - Compact and strictly within mobile bounds */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              id="brand-logo-btn"
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2 text-left group cursor-pointer flex-shrink-0"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E53935] text-white shadow-md group-hover:bg-red-600 transition flex-shrink-0">
                <Dumbbell className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div className="flex-shrink-0">
                <span className="text-base sm:text-lg font-bold tracking-wider text-white font-athletic flex items-center leading-none">
                  FIT<span className="text-[#E53935]">TRACK</span>
                </span>
                <span className="block text-[8px] uppercase tracking-widest text-zinc-400 font-semibold mt-0.5">
                  Peak Performance
                </span>
              </div>
            </button>

            {/* Desktop-Only Navigation Links (Hidden on Mobile & Phone Frame Mode) */}
            {!isPhoneMode && (
              <nav className="hidden lg:flex items-center gap-1 flex-shrink-0 ml-4">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}-btn`}
                      onClick={() => setCurrentTab(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-athletic uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#E53935] text-white shadow-md'
                          : 'text-zinc-300 hover:text-white hover:bg-[#202328]'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {user?.role === 'admin' && (
                  <button
                    id="nav-admin-btn"
                    onClick={() => setCurrentTab('admin')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-athletic uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                      currentTab === 'admin'
                        ? 'bg-red-700 text-white'
                        : 'text-zinc-300 hover:text-red-400 hover:bg-[#202328]'
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5 text-[#E53935]" />
                    <span>Admin</span>
                  </button>
                )}
              </nav>
            )}
          </div>

          {/* Right Action Controls: Compact, touch-friendly, no overlap */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Quick Tier Pill for instant Plan upgrade / view */}
            <button
              id="header-tier-badge-btn"
              onClick={() => setCurrentTab('plans')}
              className="inline-flex items-center gap-1 rounded-lg border border-[#E53935]/80 bg-red-950/70 text-red-200 px-2 py-1 text-[10px] font-bold font-athletic uppercase tracking-wider transition hover:bg-red-900 cursor-pointer flex-shrink-0"
              title="Click to view subscription plans"
            >
              <Crown className="h-3 w-3 text-[#E53935]" />
              <span>{badge.shortLabel}</span>
            </button>

            {/* Mobile & Desktop Profile Button */}
            {user ? (
              <div className="relative flex-shrink-0">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#202328] px-2 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#E53935] font-bold text-white text-[10px] uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-athletic uppercase font-bold text-[11px] tracking-wider max-w-[70px] truncate hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    id="user-profile-dropdown"
                    className="absolute right-0 mt-2 w-60 rounded-2xl border border-zinc-700 bg-[#202328] p-2 shadow-2xl z-50 text-zinc-100"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="border-b border-zinc-800 p-2.5">
                      <p className="text-xs font-bold text-white uppercase font-athletic">{user.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase font-athletic border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        id="dropdown-edit-profile-btn"
                        onClick={() => onOpenAuthModal('profile')}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                      >
                        <User className="h-3.5 w-3.5 text-[#E53935]" />
                        <span>Profile & Macro Targets</span>
                      </button>

                      <button
                        id="dropdown-my-plans-btn"
                        onClick={() => setCurrentTab('plans')}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                      >
                        <Crown className="h-3.5 w-3.5 text-[#E53935]" />
                        <span>Subscription Plans</span>
                      </button>

                      <button
                        id="dropdown-expert-btn"
                        onClick={onOpenExpertModal}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-[#E53935]" />
                        <span>Talk to Coach on WhatsApp</span>
                      </button>

                      {user.role === 'admin' && (
                        <button
                          id="dropdown-admin-center-btn"
                          onClick={() => setCurrentTab('admin')}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold font-athletic uppercase text-amber-400 bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/50 hover:text-amber-300 transition my-1 cursor-pointer"
                        >
                          <Shield className="h-3.5 w-3.5 text-amber-400" />
                          <span>Admin Payment Center</span>
                        </button>
                      )}

                      <button
                        id="dropdown-logout-btn"
                        onClick={logout}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950/50 hover:text-red-300 transition mt-1 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-sign-in-btn"
                onClick={() => onOpenAuthModal('login')}
                className="flex items-center gap-1 rounded-lg bg-[#E53935] px-2.5 py-1 text-xs font-bold font-athletic uppercase tracking-wider text-white hover:bg-red-600 transition shadow-md cursor-pointer flex-shrink-0"
              >
                <User className="h-3 w-3" />
                <span>PROFILE</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
