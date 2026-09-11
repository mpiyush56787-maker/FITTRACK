import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  Crown,
  Check,
  Dumbbell,
  UtensilsCrossed,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Award,
  Receipt,
  RotateCcw,
  ShieldCheck,
  X,
  Smartphone
} from 'lucide-react';
import { SubscriptionTier, MealPlan, WorkoutSplit, ProgressiveOverloadRecommendation, PaymentOrder, SubscriptionInfo, UpiPaymentSubmission } from '../types';
import { PremiumUpgradeModal, UpgradeModalConfig } from './PremiumUpgradeModal';
import { UPIPaymentModal } from './UPIPaymentModal';
import fitnessPlansBannerImage from '../assets/images/fitness_plans_banner_1788768000276.jpg';

interface SubscriptionPlansProps {
  onOpenExpertModal: () => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onOpenExpertModal }) => {
  const { profile, subscription, changeSubscriptionTier } = useAuth();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [workoutSplit, setWorkoutSplit] = useState<WorkoutSplit | null>(null);
  const [overloadList, setOverloadList] = useState<ProgressiveOverloadRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'plans' | 'mealPlan' | 'workoutSplit' | 'overload'>('plans');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedSplitType, setSelectedSplitType] = useState<'Push Pull Legs' | 'Upper / Lower' | 'Bro Split' | 'Full Body'>('Push Pull Legs');

  // Gating Modal State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeConfig, setUpgradeConfig] = useState<UpgradeModalConfig | null>(null);

  // UPI Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentTier, setSelectedPaymentTier] = useState<SubscriptionTier>('PLAN_299');

  // Payment History State
  const [paymentHistoryModalOpen, setPaymentHistoryModalOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<UpiPaymentSubmission[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const currentTier = subscription?.tier || 'FREE';

  const loadTierFeatures = async () => {
    try {
      if (currentTier !== 'FREE') {
        const mpRes = await api.getMealPlan().catch(() => ({ mealPlan: null }));
        if (mpRes?.mealPlan) setMealPlan(mpRes.mealPlan);
      } else {
        setMealPlan(null);
      }

      if (currentTier === 'PLAN_449' || currentTier === 'PLAN_699') {
        const wsRes = await api.getWorkoutSplit(selectedSplitType).catch(() => ({ workoutSplit: null }));
        if (wsRes?.workoutSplit) setWorkoutSplit(wsRes.workoutSplit);
      } else {
        setWorkoutSplit(null);
      }

      if (currentTier === 'PLAN_699') {
        const poRes = await api.getProgressiveOverload().catch(() => ({ recommendations: [] }));
        if (poRes?.recommendations) setOverloadList(poRes.recommendations);
      } else {
        setOverloadList([]);
      }
    } catch (e) {
      console.error('Failed to load plan features:', e);
    }
  };

  useEffect(() => {
    loadTierFeatures();
  }, [subscription, profile, selectedSplitType]);

  const handleOpenPayment = (tier: SubscriptionTier) => {
    setSelectedPaymentTier(tier);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (updated: SubscriptionInfo) => {
    await changeSubscriptionTier(updated.tier);
    await loadTierFeatures();
    if (updated.tier === 'PLAN_299') {
      setActiveTab('mealPlan');
    } else if (updated.tier === 'PLAN_449') {
      setActiveTab('workoutSplit');
    } else if (updated.tier === 'PLAN_699') {
      setActiveTab('overload');
    }
  };

  const handleResetToFree = async () => {
    setIsUpgrading(true);
    try {
      await api.resetSubscriptionToFree();
      await changeSubscriptionTier('FREE');
      await loadTierFeatures();
      setActiveTab('plans');
    } catch (e) {
      console.error('Reset to free failed:', e);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleOpenPaymentHistory = async () => {
    setPaymentHistoryModalOpen(true);
    setIsLoadingHistory(true);
    try {
      const res = await api.getPaymentHistory();
      setPaymentHistory((res.submissions || res.orders || []) as any);
    } catch (e) {
      console.error('Failed to load payment history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleOpenLockedModal = (tier: SubscriptionTier, name: string, desc: string) => {
    setUpgradeConfig({
      requiredTier: tier,
      featureName: name,
      featureDescription: desc
    });
    setUpgradeModalOpen(true);
  };

  const planOptions: {
    tier: SubscriptionTier;
    name: string;
    price: string;
    period: string;
    badge?: string;
    isHighlighted?: boolean;
    description: string;
    features: string[];
  }[] = [
    {
      tier: 'FREE',
      name: 'FREE',
      price: '₹0',
      period: 'forever',
      description: 'Essential core tools for tracking workouts, food, and PR milestones.',
      features: [
        'Calorie tracker & daily logging',
        'Indian food database (100+ verified items)',
        'Strength logging & workout history',
        'Personal record milestones',
        'WhatsApp direct expert contact'
      ]
    },
    {
      tier: 'PLAN_299',
      name: 'NUTRITION',
      price: '₹299',
      period: '/month',
      badge: 'NUTRITION FOCUS',
      description: 'Personalized daily calories, macro targets, and budget-based meal recommendations.',
      features: [
        'Personalized daily calories and macros',
        'Protein, carbs and fat targets',
        'Budget-based meal recommendations',
        'Diet-preference based meal plans',
        'Vegetarian / Non-Veg / Eggitarian options',
        'Everything in FREE plan'
      ]
    },
    {
      tier: 'PLAN_449',
      name: 'PERFORMANCE',
      price: '₹449',
      period: '/month',
      badge: 'MOST POPULAR',
      description: 'Personalized workout splits, weekly training schedules, sets & rep recommendations.',
      features: [
        'Everything in ₹299 plan',
        'Personalized workout splits',
        'Push/Pull/Legs, Upper/Lower, Bro Split and Full Body options',
        'Goal-based weekly training schedule',
        'Sets, reps and rest period recommendations'
      ]
    },
    {
      tier: 'PLAN_699',
      name: 'ELITE',
      price: '₹699',
      period: '/month',
      badge: 'COMPLETE SYSTEM',
      isHighlighted: true,
      description: 'Progressive overload guidance, exercise weight/rep recommendations & transformation intelligence.',
      features: [
        'Everything in ₹449 plan',
        'Progressive overload guidance',
        'Exercise, weight and rep recommendations',
        'Progress tracking and upgrade guidance',
        'Double-progression calculation engine'
      ]
    }
  ];

  const hasNutritionPlan = currentTier !== 'FREE';
  const hasWorkoutSplit = currentTier === 'PLAN_449' || currentTier === 'PLAN_699';
  const hasElite = currentTier === 'PLAN_699';

  return (
    <div id="subscription-plans-view" className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2E35] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#E53935] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E53935] font-athletic">
              FITTRACK Memberships & Coaching
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase font-athletic tracking-wide text-white flex items-center gap-2.5 mt-1">
            <Crown className="h-7 w-7 text-[#E53935]" />
            TRAINING & NUTRITION TIERS
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Unlock calibrated Indian meal plans, custom workout schedules, and double-progression weight overload intelligence.
          </p>
        </div>

        {/* View Switcher if unlocked */}
        <div className="flex flex-wrap items-center gap-1 bg-[#202328] border border-[#2A2E35] rounded-xl p-1">
          <button
            id="tab-view-all-plans"
            onClick={() => setActiveTab('plans')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-athletic uppercase transition cursor-pointer ${
              activeTab === 'plans' ? 'bg-[#E53935] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All 4 Plans
          </button>
          <button
            id="tab-view-meal-plan"
            onClick={() => {
              if (!hasNutritionPlan) {
                handleOpenLockedModal('PLAN_299', 'Personalized Indian Meal Plan', 'Unlock custom daily calories, macros, and budget-optimized Indian recipes.');
              } else {
                setActiveTab('mealPlan');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-athletic uppercase transition cursor-pointer ${
              activeTab === 'mealPlan'
                ? 'bg-[#E53935] text-white shadow-xs'
                : hasNutritionPlan
                ? 'text-zinc-300 hover:text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            <span>Nutrition {hasNutritionPlan ? '✓' : '🔒'}</span>
          </button>
          <button
            id="tab-view-workout-split"
            onClick={() => {
              if (!hasWorkoutSplit) {
                handleOpenLockedModal('PLAN_449', 'Personalized Workout Splits', 'Unlock customized training splits, exercise targeting, and sets & reps recommendations.');
              } else {
                setActiveTab('workoutSplit');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-athletic uppercase transition cursor-pointer ${
              activeTab === 'workoutSplit'
                ? 'bg-[#E53935] text-white shadow-xs'
                : hasWorkoutSplit
                ? 'text-zinc-300 hover:text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Dumbbell className="h-3.5 w-3.5" />
            <span>Workout Plan {hasWorkoutSplit ? '✓' : '🔒'}</span>
          </button>
          <button
            id="tab-view-overload-engine"
            onClick={() => {
              if (!hasElite) {
                handleOpenLockedModal('PLAN_699', 'Progressive Overload Intelligence', 'Unlock intelligent weight & rep recommendations based on your verified workout history.');
              } else {
                setActiveTab('overload');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-athletic uppercase transition cursor-pointer ${
              activeTab === 'overload'
                ? 'bg-[#E53935] text-white shadow-xs'
                : hasElite
                ? 'text-zinc-300 hover:text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Overload AI {hasElite ? '✓' : '🔒'}</span>
          </button>
        </div>
      </div>

      {/* Premium Membership Banner with high quality photography */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2A2E35] bg-[#202328] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[200px] items-center">
          <div className="lg:col-span-7 p-6 sm:p-7 z-10 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#E53935]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#E53935] font-athletic">
                ELEVATE YOUR ATHLETIC PERFORMANCE
              </span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold font-athletic tracking-wide text-white uppercase">
              ELITE COACHING & PERIODIZED PROTOCOLS
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-300 font-medium max-w-lg leading-relaxed">
              Unlock calibrated Indian macro targets, structured workout splits, and automated progressive overload guidance.
            </p>
          </div>
          <div className="lg:col-span-5 h-48 sm:h-56 lg:h-full relative overflow-hidden bg-[#17191C]">
            <img
              src={fitnessPlansBannerImage}
              alt="Elite fitness training and nutrition plans"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Launch-Ready Membership Status Banner */}
      <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-4 text-xs text-zinc-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/80 border border-red-900 text-[#E53935] shrink-0">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-white font-athletic uppercase text-sm">
                Active Membership: {subscription?.tierName || 'FREE ATHLETE'}
              </strong>
              <span className="h-2 w-2 rounded-full bg-[#E53935] animate-pulse" />
            </div>
            <span className="text-zinc-400 text-[11px] block mt-0.5">
              {currentTier === 'FREE'
                ? 'Standard athlete tracking. Upgrade via direct UPI to unlock meal plans, split routines & overload engine.'
                : `Verified FITTRACK membership active. Renews: ${subscription?.renewalDate || 'In 30 days'}`}
            </span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0 w-full sm:w-auto">
          <button
            id="view-payment-receipts-btn"
            type="button"
            onClick={handleOpenPaymentHistory}
            className="flex items-center gap-1.5 bg-[#2A2E35] hover:bg-zinc-700 px-3 py-2 rounded-xl border border-zinc-700 text-xs font-athletic uppercase font-bold text-zinc-200 transition cursor-pointer"
          >
            <Receipt className="h-3.5 w-3.5 text-red-400" />
            <span>UPI Submissions & Receipts</span>
          </button>

          {currentTier !== 'FREE' && (
            <button
              id="reset-to-free-plan-btn"
              type="button"
              onClick={handleResetToFree}
              disabled={isUpgrading}
              className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-2 rounded-xl border border-zinc-700 text-[11px] font-athletic uppercase font-medium text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              title="Reset membership to Free to test initial purchases again"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset to Free</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'plans' && (
        <>
          {/* WhatsApp Direct Coach Promotion Card */}
          <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-4 sm:p-6 shadow-md text-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E53935] text-white mt-1 sm:mt-0">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider font-athletic block">
                  Free Direct Fitness Consultation (Included in all tiers)
                </span>
                <h3 className="text-base sm:text-xl font-bold font-athletic uppercase text-white">
                  NEED GUIDANCE? TALK TO EXPERT ON WHATSAPP
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Available for all lifters: Ask training questions, clarify diet doubts, or get plan recommendations at <strong className="text-white underline">+91 7206125905</strong>.
                </p>
              </div>
            </div>

            <button
              id="plans-page-whatsapp-btn"
              onClick={onOpenExpertModal}
              className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-[#E53935] px-4 py-3 font-bold font-athletic text-xs uppercase text-white hover:bg-red-600 transition shadow-md cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              <span>CHAT WITH COACH (+91 7206125905)</span>
            </button>
          </div>

          {/* Pricing 4-Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {planOptions.map(plan => {
              const isCurrent = currentTier === plan.tier;

              // Rank logic to determine button action and copy
              const tierRanks: Record<SubscriptionTier, number> = {
                FREE: 0,
                PLAN_299: 1,
                PLAN_449: 2,
                PLAN_699: 3
              };

              const currentRank = tierRanks[currentTier];
              const targetRank = tierRanks[plan.tier];
              const isIncludedInHigher = currentRank > targetRank && plan.tier !== 'FREE';

              return (
                <div
                  key={plan.tier}
                  id={`plan-card-${plan.tier}`}
                  className={`relative flex flex-col justify-between rounded-2xl border p-6 transition shadow-md ${
                    isCurrent
                      ? 'border-[#E53935] bg-[#202328] ring-2 ring-[#E53935]'
                      : plan.isHighlighted
                      ? 'border-[#E53935] bg-[#202328] text-white ring-1 ring-[#E53935]'
                      : 'border-[#2A2E35] bg-[#202328] text-white'
                  }`}
                >
                  {/* Badge: If current, show athletic RED CURRENT PLAN badge; else show plan.badge */}
                  {isCurrent ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-0.5 text-[10px] font-bold font-athletic uppercase tracking-wider shadow-sm bg-[#E53935] text-white">
                      CURRENT PLAN
                    </span>
                  ) : plan.badge ? (
                    <span
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-0.5 text-[10px] font-bold font-athletic uppercase tracking-wider shadow-sm ${
                        plan.isHighlighted || plan.badge === 'MOST POPULAR'
                          ? 'bg-[#E53935] text-white'
                          : 'bg-[#2A2E35] text-zinc-200 border border-zinc-700'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  ) : null}

                  <div>
                    <h3 className="text-lg font-bold font-athletic uppercase mt-1 text-white">
                      {plan.name}
                    </h3>
                    <p className="text-xs mt-1 min-h-[36px] text-zinc-400">{plan.description}</p>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold font-athletic text-white">{plan.price}</span>
                      <span className="text-xs font-medium text-zinc-400">{plan.period}</span>
                    </div>

                    {/* Feature Checklist */}
                    <div className="mt-6 space-y-2.5 border-t pt-4 border-[#2A2E35]">
                      {plan.features.map((feat, idx) => {
                        const isHeader = feat.startsWith('Everything in');
                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-2.5 text-xs ${
                              isHeader
                                ? 'font-bold text-[#E53935] uppercase font-athletic py-0.5'
                                : 'text-zinc-300'
                            }`}
                          >
                            <Check className={`h-4 w-4 shrink-0 mt-0.5 ${isHeader ? 'text-[#E53935] font-bold' : 'text-[#E53935]'}`} />
                            <span>{feat}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#2A2E35]">
                    {isCurrent ? (
                      <button
                        id={`btn-current-${plan.tier}`}
                        disabled
                        className="w-full rounded-xl bg-[#E53935] py-3 text-center text-xs font-bold font-athletic uppercase tracking-wider text-white shadow-md flex items-center justify-center gap-1.5 cursor-default"
                      >
                        <Check className="h-4 w-4 stroke-[2.5]" />
                        <span>CURRENT ACTIVE PLAN</span>
                      </button>
                    ) : isIncludedInHigher ? (
                      <button
                        id={`btn-included-${plan.tier}`}
                        disabled
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 py-3 text-center text-xs font-bold font-athletic uppercase tracking-wider text-zinc-400 cursor-default"
                      >
                        INCLUDED IN YOUR PLAN
                      </button>
                    ) : plan.tier === 'FREE' ? (
                      <button
                        id={`select-tier-${plan.tier}-btn`}
                        onClick={handleResetToFree}
                        disabled={isUpgrading}
                        className="w-full rounded-xl border border-zinc-700 bg-[#2A2E35] hover:bg-zinc-700 py-3 text-xs font-bold font-athletic uppercase tracking-wider text-zinc-300 hover:text-white transition shadow-sm cursor-pointer"
                      >
                        Reset to Free Athlete
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <button
                          id={`buy-plan-${plan.tier}-btn`}
                          onClick={() => handleOpenPayment(plan.tier)}
                          className="w-full rounded-xl bg-[#E53935] hover:bg-red-600 py-3 text-xs font-bold font-athletic uppercase tracking-wider text-white transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
                        >
                          <Smartphone className="h-4 w-4" />
                          <span>PAY {plan.price} VIA UPI</span>
                        </button>
                        <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-400 font-athletic uppercase">
                          <span>Instant UPI • GPay, PhonePe, Paytm</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Unlocked Meal Plan Tab */}
      {activeTab === 'mealPlan' && (
        <div className="space-y-6">
          {!hasNutritionPlan ? (
            <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-8 text-center max-w-xl mx-auto space-y-4 shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/80 border border-red-900 text-[#E53935]">
                <UtensilsCrossed className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold font-athletic uppercase text-white">
                Personalized Indian Meal Plan is Locked
              </h3>
              <p className="text-xs text-zinc-400">
                This feature is included in FITTRACK Nutrition (₹299/month), FITTRACK Performance (₹449/month), and FITTRACK Elite (₹699/month).
              </p>
              <button
                id="unlock-mealplan-btn"
                onClick={() => handleOpenPayment('PLAN_299')}
                className="rounded-xl bg-[#E53935] px-6 py-3 text-xs font-bold font-athletic uppercase text-white hover:bg-red-600 transition font-bold shadow-md cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <span>BUY PLAN — ₹299/MO (NUTRITION)</span>
              </button>
            </div>
          ) : mealPlan ? (
            <div className="space-y-6">
              {/* Meal Plan Overview */}
              <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2E35]">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] font-athletic">
                      Personalized Nutrition Protocol (₹299+ Feature)
                    </span>
                    <h2 className="text-2xl font-bold font-athletic uppercase text-white mt-1">
                      {profile?.fitnessGoal} Indian Nutrition Plan
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Preference: <strong className="text-zinc-200">{mealPlan.dietPreference}</strong> • Food Budget:{' '}
                      <strong className="text-[#E53935]">{mealPlan.budget}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-xl bg-[#2A2E35] border border-zinc-700 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Calories</span>
                      <strong className="text-sm sm:text-base font-bold font-athletic text-[#E53935]">{mealPlan.targetCalories} kcal</strong>
                    </div>
                    <div className="rounded-xl bg-[#2A2E35] border border-zinc-700 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Protein</span>
                      <strong className="text-sm sm:text-base font-bold font-athletic text-white">{mealPlan.targetProtein}g</strong>
                    </div>
                    <div className="rounded-xl bg-[#2A2E35] border border-zinc-700 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Carbs</span>
                      <strong className="text-sm sm:text-base font-bold font-athletic text-zinc-300">{mealPlan.targetCarbs}g</strong>
                    </div>
                    <div className="rounded-xl bg-[#2A2E35] border border-zinc-700 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Fat</span>
                      <strong className="text-sm sm:text-base font-bold font-athletic text-zinc-300">{mealPlan.targetFat}g</strong>
                    </div>
                  </div>
                </div>

                {/* Structured Meals */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mealPlan.meals.map((meal, idx) => (
                    <div key={idx} className="rounded-xl border border-[#2A2E35] bg-[#2A2E35] p-4">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-700">
                        <h4 className="text-sm font-bold uppercase font-athletic text-[#E53935]">
                          {meal.mealType} — {meal.title}
                        </h4>
                        <span className="text-xs font-bold font-athletic text-white">
                          {meal.totalCalories} kcal • {meal.totalProtein}g Protein
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {meal.items.map((item, iIdx) => (
                          <div key={iIdx} className="rounded-lg bg-[#202328] p-2.5 border border-zinc-700 shadow-xs">
                            <div className="flex justify-between items-start text-xs">
                              <div>
                                <span className="font-bold text-white uppercase font-athletic block">{item.name}</span>
                                <span className="text-zinc-400 text-[11px]">{item.portion}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[#E53935] font-bold font-athletic">{item.protein}g P</span>
                                <span className="text-zinc-400 text-[10px] block">{item.calories} kcal</span>
                              </div>
                            </div>
                            {item.prepTip && (
                              <p className="mt-1 text-[10px] text-zinc-400 italic">
                                Tip: {item.prepTip}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl bg-[#2A2E35] border border-[#2A2E35] p-4 text-xs text-zinc-300 space-y-2">
                  <div className="flex items-center gap-2 text-[#E53935] font-bold uppercase font-athletic">
                    <Sparkles className="h-4 w-4" />
                    <span>Daily Nutrition Guidance & Strategy</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                    {mealPlan.expertNutritionTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#E53935] shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 bg-[#202328] p-6 rounded-xl border border-[#2A2E35]">Generating meal plan...</div>
          )}
        </div>
      )}

      {/* Unlocked Workout Split Tab */}
      {activeTab === 'workoutSplit' && (
        <div className="space-y-6">
          {!hasWorkoutSplit ? (
            <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-8 text-center max-w-xl mx-auto space-y-4 shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/80 border border-red-900 text-[#E53935]">
                <Dumbbell className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold font-athletic uppercase text-white">
                Personalized Workout Split is Locked
              </h3>
              <p className="text-xs text-zinc-400">
                This feature is included in FITTRACK Performance (₹449/month) and FITTRACK Elite (₹699/month).
              </p>
              <button
                id="unlock-workoutsplit-btn"
                onClick={() => handleOpenPayment('PLAN_449')}
                className="rounded-xl bg-[#E53935] px-6 py-3 text-xs font-bold font-athletic uppercase text-white hover:bg-red-600 transition font-bold shadow-md cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <span>BUY PLAN — ₹449/MO (PERFORMANCE)</span>
              </button>
            </div>
          ) : workoutSplit ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2E35]">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] font-athletic">
                      Custom Training Schedule (₹449+ Feature)
                    </span>
                    <h2 className="text-2xl font-bold font-athletic uppercase text-white mt-1">
                      {workoutSplit.split} Training Schedule
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Frequency: <strong className="text-zinc-200">{workoutSplit.daysPerWeek} Days/Week</strong> • Equipment:{' '}
                      <strong className="text-[#E53935]">{workoutSplit.equipment}</strong> • Level:{' '}
                      <strong className="text-zinc-200">{workoutSplit.experience}</strong>
                    </p>
                  </div>

                  {/* Split Type Selector */}
                  <div className="flex items-center gap-1.5 bg-[#2A2E35] border border-zinc-700 p-1 rounded-xl">
                    {(['Push Pull Legs', 'Upper / Lower'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSplitType(s)}
                        className={`px-3 py-1.5 text-xs font-bold font-athletic uppercase rounded-lg transition cursor-pointer ${
                          selectedSplitType === s ? 'bg-[#E53935] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days and Routines */}
                <div className="mt-6 space-y-4">
                  {workoutSplit.days?.map((day, idx) => (
                    <div key={idx} className="rounded-xl border border-[#2A2E35] bg-[#2A2E35] p-4">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-700">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase font-athletic text-white bg-[#E53935] px-2 py-0.5 rounded">
                            {day.dayName.split('—')[0].trim()}
                          </span>
                          <h4 className="text-sm font-bold uppercase font-athletic text-white">
                            {day.dayName.split('—')[1] || day.dayName}
                          </h4>
                        </div>
                        <span className="text-xs text-zinc-400 font-medium">{day.focus}</span>
                      </div>

                      {day.exercises.length === 0 ? (
                        <p className="text-xs text-zinc-400 mt-3 italic bg-[#202328] p-3 rounded-lg border border-zinc-700">
                          Active Rest & Muscle Recovery — Focus on 8,000 steps, stretching, hydration & sleep.
                        </p>
                      ) : (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {day.exercises.map((ex, exI) => (
                            <div key={exI} className="rounded-lg bg-[#202328] p-3 text-xs border border-zinc-700 shadow-xs">
                              <div className="flex justify-between items-start">
                                <strong className="text-white font-athletic uppercase block">{ex.exerciseName}</strong>
                                <span className="text-[#E53935] font-bold font-athletic text-[11px]">{ex.sets} sets × {ex.repRange}</span>
                              </div>
                              <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
                                <span>Rest: <strong className="text-zinc-200">{ex.restSec}s</strong></span>
                                <span className="text-zinc-500">{ex.category}</span>
                              </div>
                              {ex.instructions && (
                                <p className="text-[10px] text-zinc-400 mt-1 italic line-clamp-2">
                                  Cue: {ex.instructions}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 bg-[#202328] p-6 rounded-xl border border-[#2A2E35]">Loading workout split...</div>
          )}
        </div>
      )}

      {/* Unlocked Progressive Overload Engine (₹699) */}
      {activeTab === 'overload' && (
        <div className="space-y-6">
          {!hasElite ? (
            <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-8 text-center max-w-xl mx-auto space-y-4 shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/80 border border-red-900 text-[#E53935]">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold font-athletic uppercase text-white">
                Progressive Overload Intelligence is Locked
              </h3>
              <p className="text-xs text-zinc-400">
                This feature is included in FITTRACK Elite (₹699/month). It computes verified double-progression targets, next-session weight increments, and rep thresholds from your actual logged sets.
              </p>
              <button
                id="unlock-overload-btn"
                onClick={() => handleOpenPayment('PLAN_699')}
                className="rounded-xl bg-[#E53935] px-6 py-3 text-xs font-bold font-athletic uppercase text-white hover:bg-red-600 transition shadow-md font-bold cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <span>BUY PLAN — ₹699/MO (ELITE)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2E35]">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] font-athletic">
                      Elite Progressive Overload Intelligence (₹699 Exclusive)
                    </span>
                    <h2 className="text-2xl font-bold font-athletic uppercase text-white mt-1">
                      Double-Progression & Increment Analysis
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Computed automatically from your logged sets. Use these exact weights and reps in your next session to guarantee continuous progressive overload.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-red-950/80 border border-red-900 px-3 py-1.5 rounded-xl">
                    <Award className="h-4 w-4 text-[#E53935]" />
                    <span className="text-xs font-bold uppercase font-athletic text-red-400">
                      {overloadList.length} Exercises Tracked
                    </span>
                  </div>
                </div>

                {/* Overload Recommendations Grid */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overloadList.map(rec => (
                    <div
                      key={rec.exerciseId}
                      className="rounded-xl border border-[#2A2E35] bg-[#2A2E35] p-4 transition shadow-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-700">
                        <h4 className="text-sm font-bold uppercase font-athletic text-white">
                          {rec.exerciseName}
                        </h4>
                        <span
                          className={`text-[10px] font-bold uppercase font-athletic px-2 py-0.5 rounded ${
                            rec.status === 'increase_weight'
                              ? 'bg-[#E53935] text-white font-bold'
                              : rec.status === 'increase_reps'
                              ? 'bg-[#202328] text-zinc-200 font-bold border border-zinc-700'
                              : 'bg-[#202328] text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {rec.status === 'increase_weight'
                            ? 'OVERLOAD WEIGHT'
                            : rec.status === 'increase_reps'
                            ? 'PUSH FOR REPS'
                            : 'CONSOLIDATE FORM'}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-lg bg-[#202328] p-2.5 border border-zinc-700 shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Previous Best</span>
                          <span className="text-white font-bold font-athletic text-sm">
                            {rec.previousWeightKg}kg × {rec.previousReps} reps
                          </span>
                        </div>

                        <div className="rounded-lg bg-[#281c1e] p-2.5 border border-red-900 shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-red-400 block">Next Target</span>
                          <span className="text-[#E53935] font-bold font-athletic text-sm">
                            {rec.recommendedWeightKg}kg × {rec.recommendedReps}
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-zinc-300 bg-[#202328] p-2.5 rounded-lg border border-zinc-700 shadow-xs">
                        {rec.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature Gating Modal */}
      <PremiumUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        config={upgradeConfig}
        onNavigateToPlans={() => {
          setUpgradeModalOpen(false);
          setActiveTab('plans');
        }}
        onProceedToPayment={tier => handleOpenPayment(tier)}
      />

      {/* Direct UPI Payment Modal */}
      <UPIPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        planTier={selectedPaymentTier}
        onSubmissionComplete={async (submission) => {
          // Keep submission in state and reload history
          try {
            const res = await api.getPaymentHistory();
            setPaymentHistory((res.submissions || res.orders || []) as any);
          } catch (err) {
            console.error('Failed to refresh payment history:', err);
          }
        }}
      />

      {/* UPI Payment Submissions & History Modal */}
      {paymentHistoryModalOpen && (
        <div
          id="payment-history-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xs overflow-y-auto"
          onClick={() => setPaymentHistoryModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#202328] border border-[#2A2E35] rounded-2xl shadow-2xl p-5 text-white max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2E35]">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-red-500" />
                <div>
                  <h3 className="text-base font-bold font-athletic uppercase text-white">
                    UPI Payment History &amp; Status
                  </h3>
                  <p className="text-[11px] text-zinc-400">Direct transfers to mtushar9801@okhdfcbank</p>
                </div>
              </div>
              <button
                id="close-payment-history-btn"
                type="button"
                onClick={() => setPaymentHistoryModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Submissions List */}
            <div className="mt-4 space-y-3 overflow-y-auto pr-1 flex-1">
              {isLoadingHistory ? (
                <div className="py-8 text-center text-zinc-400 text-xs font-athletic uppercase">
                  Loading payment records...
                </div>
              ) : paymentHistory.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-zinc-300 font-athletic uppercase">
                    No UPI submissions found yet
                  </p>
                  <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                    When you transfer via UPI and submit your 12-digit UTR, the verification status and bank details will appear here.
                  </p>
                </div>
              ) : (
                paymentHistory.map((item: any, idx: number) => {
                  const isUpi = Boolean(item.utr);
                  const isPending = item.status === 'verification_pending' || item.status === 'pending';
                  const isApproved = item.status === 'approved' || item.status === 'paid';
                  const isRejected = item.status === 'rejected' || item.status === 'failed';
                  const amount = item.amountInr || (item.amount > 1000 ? item.amount / 100 : item.amount);

                  return (
                    <div
                      key={item.id || item.orderId || idx}
                      className="p-3.5 rounded-xl bg-[#17191C] border border-[#2A2E35] text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-athletic uppercase text-white">
                          {item.planName || item.planTier}
                        </span>
                        <span
                          className={`text-[10px] font-bold font-athletic uppercase px-2 py-0.5 rounded border ${
                            isApproved
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                              : isPending
                              ? 'bg-amber-950/80 text-amber-400 border-amber-600/50'
                              : isRejected
                              ? 'bg-red-950/80 text-red-400 border-red-700/60'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {isPending ? 'Verification Pending' : isApproved ? 'Approved & Active' : 'Rejected'}
                        </span>
                      </div>

                      <div className="flex justify-between text-zinc-400 text-[11px] font-athletic">
                        <span>Amount</span>
                        <span className="text-emerald-400 font-bold font-athletic text-xs">₹{amount}</span>
                      </div>

                      {item.utr && (
                        <div className="flex justify-between text-zinc-400 text-[11px] font-athletic">
                          <span>UTR / Ref No.</span>
                          <span className="font-mono text-zinc-200 text-xs font-bold">{item.utr}</span>
                        </div>
                      )}

                      {item.upiRefId && (
                        <div className="flex justify-between text-zinc-400 text-[11px] font-athletic">
                          <span>Tracking Ref</span>
                          <span className="font-mono text-zinc-400 text-[10px]">{item.upiRefId}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-zinc-400 text-[11px] font-athletic">
                        <span>Payee UPI</span>
                        <span className="font-mono text-zinc-300 text-[11px]">mtushar9801@okhdfcbank</span>
                      </div>

                      {item.adminNotes && (
                        <div className="text-[11px] p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-300">
                          <strong className="text-zinc-400">Admin Note: </strong>
                          {item.adminNotes}
                        </div>
                      )}

                      <div className="flex justify-between text-zinc-500 text-[10px] pt-1.5 border-t border-[#2A2E35]">
                        <span>Submitted</span>
                        <span>{new Date(item.submittedAt || item.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
