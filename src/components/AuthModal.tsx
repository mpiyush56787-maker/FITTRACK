import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  UserPlus,
  LogIn,
  Dumbbell,
  Sparkles,
  Check,
  Crown,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { FitnessGoal, ActivityLevel, DietPreference, Gender, SubscriptionTier } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'profile';
  onNavigateToPlans?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signup',
  onNavigateToPlans
}) => {
  const { user, profile, subscription, login, signup, updateProfile, changeSubscriptionTier } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'profile'>(initialMode);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [profileTab, setProfileTab] = useState<'metrics' | 'subscription'>('metrics');

  // Form State
  const [name, setName] = useState(profile?.name || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [age, setAge] = useState<number>(profile?.age || 25);
  const [gender, setGender] = useState<Gender>(profile?.gender || 'Male');
  const [heightCm, setHeightCm] = useState<number>(profile?.heightCm || 175);
  const [weightKg, setWeightKg] = useState<number>(profile?.weightKg || 72);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(profile?.fitnessGoal || 'Build Muscle');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel || 'Moderately Active');
  const [dietPreference, setDietPreference] = useState<DietPreference>(profile?.dietPreference || 'Vegetarian');
  const [foodBudget, setFoodBudget] = useState<'Budget Friendly' | 'Moderate' | 'Flexible'>(profile?.foodBudget || 'Moderate');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      if (profile) {
        setName(profile.name || user?.name || '');
        setAge(profile.age || 25);
        setGender(profile.gender || 'Male');
        setHeightCm(profile.heightCm || 175);
        setWeightKg(profile.weightKg || 72);
        setFitnessGoal(profile.fitnessGoal || 'Build Muscle');
        setActivityLevel(profile.activityLevel || 'Moderately Active');
        setDietPreference(profile.dietPreference || 'Vegetarian');
        setFoodBudget(profile.foodBudget || 'Moderate');
      }
      if (user) {
        setEmail(user.email || '');
      }
    }
  }, [isOpen, initialMode, profile, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email) throw new Error('Please provide your email address.');
        await login(email);
      } else if (mode === 'signup') {
        if (!name || !email) throw new Error('Name and email are required.');
        await signup({
          name,
          email,
          age,
          gender,
          heightCm,
          weightKg,
          fitnessGoal,
          activityLevel,
          dietPreference,
          foodBudget
        });
      } else {
        await updateProfile({
          name,
          age,
          gender,
          heightCm,
          weightKg,
          fitnessGoal,
          activityLevel,
          dietPreference,
          foodBudget
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTierDetails = (tier?: SubscriptionTier) => {
    switch (tier) {
      case 'PLAN_299':
        return {
          name: 'FITTRACK NUTRITION',
          price: '₹299/month',
          badge: 'NUTRITION FOCUS',
          status: 'Active Monthly Subscription',
          color: 'text-white border-red-800/60 bg-[#25181a]'
        };
      case 'PLAN_449':
        return {
          name: 'FITTRACK PERFORMANCE',
          price: '₹449/month',
          badge: 'MOST POPULAR',
          status: 'Active Monthly Subscription',
          color: 'text-white border-red-800/60 bg-[#25181a]'
        };
      case 'PLAN_699':
        return {
          name: 'FITTRACK ELITE',
          price: '₹699/month',
          badge: 'ULTIMATE TRANSFORMATION',
          status: 'Active Monthly Subscription',
          color: 'text-white border-red-600 bg-red-950/40'
        };
      case 'FREE':
      default:
        return {
          name: 'FREE',
          price: '₹0/month',
          badge: 'CORE ATHLETE',
          status: 'Active Free Membership',
          color: 'text-zinc-200 border-zinc-700 bg-[#22232a]'
        };
    }
  };

  const currentTierInfo = getTierDetails(subscription?.tier);

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 rounded-2xl border border-zinc-800 bg-[#1a1b20] p-6 md:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-lg p-1.5 text-zinc-400 hover:bg-[#252630] hover:text-white transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-950/70 border border-red-800/60 text-red-500">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-athletic tracking-wide text-white uppercase">
              {mode === 'login' ? 'Sign In to FITTRACK' : mode === 'signup' ? 'Create Athletic Profile' : 'Athlete Profile & Subscription'}
            </h2>
            <p className="text-xs text-zinc-400">
              {mode === 'login'
                ? 'Access your training logs and progress metrics'
                : mode === 'signup'
                ? 'Set your physical metrics to calculate precise macros & calories'
                : 'Manage your body metrics, targets, and active membership tier'}
            </p>
          </div>
        </div>

        {/* Tabs for Login vs Signup (if not editing profile) */}
        {mode !== 'profile' ? (
          <div className="mt-6 flex rounded-xl bg-[#121316] p-1 border border-zinc-800">
            <button
              id="switch-to-signup-tab"
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-xs font-bold font-athletic uppercase rounded-lg transition cursor-pointer ${
                mode === 'signup' ? 'bg-red-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              New Athlete (Sign Up)
            </button>
            <button
              id="switch-to-login-tab"
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold font-athletic uppercase rounded-lg transition cursor-pointer ${
                mode === 'login' ? 'bg-red-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Returning Athlete (Log In)
            </button>
          </div>
        ) : (
          <div className="mt-6 flex rounded-xl bg-[#121316] p-1 border border-zinc-800">
            <button
              id="profile-tab-metrics-btn"
              type="button"
              onClick={() => setProfileTab('metrics')}
              className={`flex-1 py-2 text-xs font-bold font-athletic uppercase rounded-lg transition cursor-pointer ${
                profileTab === 'metrics' ? 'bg-red-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Physical Metrics & Goals
            </button>
            <button
              id="profile-tab-subscription-btn"
              type="button"
              onClick={() => setProfileTab('subscription')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold font-athletic uppercase rounded-lg transition cursor-pointer ${
                profileTab === 'subscription' ? 'bg-red-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Crown className="h-3.5 w-3.5" />
              <span>Subscription Status</span>
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-950/70 border border-red-800/60 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Profile Subscription Tab */}
        {mode === 'profile' && profileTab === 'subscription' ? (
          <div className="mt-6 space-y-5" id="profile-subscription-status-section">
            {/* Current Active Plan Card */}
            <div className={`rounded-2xl border p-5 ${currentTierInfo.color}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider font-athletic bg-[#121316] px-2.5 py-0.5 rounded border border-zinc-700 shadow-xs text-white">
                  {currentTierInfo.badge}
                </span>
                <span className="text-xs font-bold font-athletic uppercase text-red-500 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  {currentTierInfo.status}
                </span>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <h3 className="text-2xl font-bold font-athletic uppercase text-white">
                    {currentTierInfo.name}
                  </h3>
                  <p className="text-xs mt-0.5 text-zinc-300">
                    Plan Price: <strong className="text-white">{currentTierInfo.price}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] block font-athletic uppercase text-zinc-400">Billing Renewal</span>
                  <strong className="text-xs text-white">{subscription?.renewalDate || 'Active'}</strong>
                </div>
              </div>
            </div>

            {/* Plan Benefits Checklist */}
            <div className="rounded-xl bg-[#22232a] border border-zinc-750 p-4 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-athletic block">
                Your Current Plan Benefits & Inclusions:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {subscription?.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                    <Check className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Mode Simulator Quick Switch */}
            <div className="rounded-xl border border-zinc-800 bg-[#22232a] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-athletic flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-red-500" />
                  Switch Membership Tier (Test & Development Mode)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['FREE', 'PLAN_299', 'PLAN_449', 'PLAN_699'] as SubscriptionTier[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={async () => {
                      await changeSubscriptionTier(t);
                    }}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-bold font-athletic uppercase transition cursor-pointer ${
                      subscription?.tier === t
                        ? 'border-red-600 bg-red-600 text-white shadow-xs'
                        : 'border-zinc-700 bg-[#1a1b20] text-zinc-300 hover:text-white hover:border-zinc-500'
                    }`}
                  >
                    {t === 'FREE' ? 'FREE' : t.replace('PLAN_', '₹') + '/mo'}
                  </button>
                ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            {subscription?.tier !== 'PLAN_699' && (
              <button
                id="profile-view-plans-btn"
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToPlans) onNavigateToPlans();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold font-athletic text-xs uppercase tracking-wider text-white shadow-sm hover:bg-red-700 transition cursor-pointer"
              >
                <Crown className="h-4 w-4" />
                <span>Explore & Upgrade Membership Tiers</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'login' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-athletic">
                  Athlete Email Address
                </label>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="athlete@fittrack.com"
                  className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-[#22232a] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
                />
                <p className="mt-2 text-[11px] text-zinc-500">
                  Tip: Enter athlete@fittrack.com for standard demo, or admin@fittrack.com for admin mode.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-athletic">
                      Full Name
                    </label>
                    <input
                      id="signup-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Aman Sharma"
                      className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-[#22232a] px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-athletic">
                        Email Address
                      </label>
                      <input
                        id="signup-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="aman@example.com"
                        className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-[#22232a] px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Physical Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                      Age
                    </label>
                    <input
                      id="profile-age-input"
                      type="number"
                      min="14"
                      max="100"
                      required
                      value={age}
                      onChange={e => setAge(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#22232a] px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                      Height (cm)
                    </label>
                    <input
                      id="profile-height-input"
                      type="number"
                      min="100"
                      max="250"
                      required
                      value={heightCm}
                      onChange={e => setHeightCm(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#22232a] px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                      Weight (kg)
                    </label>
                    <input
                      id="profile-weight-input"
                      type="number"
                      step="0.1"
                      min="30"
                      max="250"
                      required
                      value={weightKg}
                      onChange={e => setWeightKg(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#22232a] px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-athletic mb-1.5">
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Male', 'Female', 'Other'] as Gender[]).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                          gender === g
                            ? 'border-red-600 bg-red-600 text-white font-bold'
                            : 'border-zinc-700 bg-[#22232a] text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fitness Goal */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-athletic mb-1.5">
                    Primary Fitness Goal
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Lose Fat', 'Build Muscle', 'Maintain Weight', 'Improve Strength'] as FitnessGoal[]).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFitnessGoal(g)}
                        className={`py-2.5 px-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          fitnessGoal === g
                            ? 'border-red-600 bg-red-600 text-white font-bold'
                            : 'border-zinc-700 bg-[#22232a] text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        <span>{g}</span>
                        {fitnessGoal === g && <Check className="h-4 w-4 text-white shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Level & Diet Preference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-athletic">
                      Activity Level
                    </label>
                    <select
                      id="profile-activity-select"
                      value={activityLevel}
                      onChange={e => setActivityLevel(e.target.value as ActivityLevel)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-[#22232a] px-3 py-2.5 text-xs text-white focus:border-red-600 focus:outline-none"
                    >
                      <option value="Sedentary">Sedentary (Desk Job)</option>
                      <option value="Lightly Active">Lightly Active (1-2 workouts/wk)</option>
                      <option value="Moderately Active">Moderately Active (3-5 workouts/wk)</option>
                      <option value="Very Active">Very Active (6-7 intense sessions/wk)</option>
                      <option value="Extra Active">Extra Active (Athlete / Physical Job)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-athletic">
                      Diet Preference
                    </label>
                    <select
                      id="profile-diet-select"
                      value={dietPreference}
                      onChange={e => setDietPreference(e.target.value as DietPreference)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-[#22232a] px-3 py-2.5 text-xs text-white focus:border-red-600 focus:outline-none"
                    >
                      <option value="Vegetarian">Vegetarian (Paneer, Dal, Soya)</option>
                      <option value="Non-Vegetarian">Non-Vegetarian (Chicken, Fish, Eggs)</option>
                      <option value="Eggitarian">Eggitarian (Eggs + Veg)</option>
                      <option value="Vegan">Vegan (100% Plant Based)</option>
                    </select>
                  </div>
                </div>

                {/* Food Budget */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-athletic">
                    Monthly Food & Nutrition Budget
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    {(['Budget Friendly', 'Moderate', 'Flexible'] as const).map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setFoodBudget(b)}
                        className={`py-2 px-2 text-center rounded-xl border text-xs font-semibold transition cursor-pointer ${
                          foodBudget === b
                            ? 'border-red-600 bg-red-600 text-white font-bold'
                            : 'border-zinc-700 bg-[#22232a] text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold font-athletic text-sm uppercase tracking-wider text-white shadow-sm hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sign In & Continue</span>
                </>
              ) : mode === 'signup' ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Build Athlete Profile & Calculate Targets</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Update Metrics & Recalculate Macros</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
