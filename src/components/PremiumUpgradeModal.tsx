import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Crown,
  Lock,
  X,
  Check,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { SubscriptionTier } from '../types';

export interface UpgradeModalConfig {
  requiredTier: SubscriptionTier;
  featureName: string;
  featureDescription?: string;
  benefits?: string[];
}

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: UpgradeModalConfig | null;
  onNavigateToPlans?: () => void;
  onProceedToPayment?: (tier: SubscriptionTier) => void;
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  config,
  onNavigateToPlans,
  onProceedToPayment
}) => {
  const { changeSubscriptionTier } = useAuth();
  const [isProcessing, setIsProcessing] = React.useState(false);

  if (!isOpen || !config) return null;

  const getTierMeta = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'PLAN_299':
        return {
          name: 'FITTRACK NUTRITION',
          price: '₹299',
          period: '/month',
          badge: 'NUTRITION EXCELLENCE',
          btnBg: 'bg-[#E53935] hover:bg-red-600 text-white',
          headline: 'This feature is included in FITTRACK Nutrition.',
          bulletPoints: [
            'Personalized daily calorie & macro targets',
            'Tailored protein, carbs, and fat breakdown',
            'Goal-based Indian meal recommendations',
            'Budget-based grocery & meal planning',
            'Vegetarian, Eggitarian & Non-Veg options'
          ]
        };
      case 'PLAN_449':
        return {
          name: 'FITTRACK PERFORMANCE',
          price: '₹449',
          period: '/month',
          badge: 'MOST POPULAR',
          btnBg: 'bg-[#E53935] hover:bg-red-600 text-white',
          headline: 'This feature is included in FITTRACK Performance.',
          bulletPoints: [
            'Everything in ₹299 Nutrition Plan',
            'Personalized workout splits (PPL / Upper-Lower / Bro Split)',
            'Weekly training schedule calibrated to your goal',
            'Sets, reps & rest period recommendations',
            'Equipment & experience-based customization'
          ]
        };
      case 'PLAN_699':
      default:
        return {
          name: 'FITTRACK ELITE',
          price: '₹699',
          period: '/month',
          badge: 'ULTIMATE TRANSFORMATION',
          btnBg: 'bg-[#2A2E35] hover:bg-zinc-800 border border-[#E53935] text-white',
          headline: 'This feature is included in FITTRACK Elite.',
          bulletPoints: [
            'Everything in ₹449 Performance Plan',
            'Intelligent Progressive Overload recommendation engine',
            'Guided exercise selection & weight increment rules',
            'Rep range targeting & strength progression analysis',
            'Complete transformation & periodized training guidance'
          ]
        };
    }
  };

  const meta = getTierMeta(config.requiredTier);

  const handleQuickUpgrade = async () => {
    if (onProceedToPayment) {
      onClose();
      onProceedToPayment(config.requiredTier);
      return;
    }

    setIsProcessing(true);
    try {
      await changeSubscriptionTier(config.requiredTier);
      onClose();
    } catch (e) {
      console.error('Quick upgrade error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="premium-upgrade-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg my-8 rounded-2xl border border-[#2A2E35] bg-[#202328] p-6 sm:p-8 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          id="close-upgrade-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-lg p-1.5 text-zinc-400 hover:bg-[#2A2E35] hover:text-white transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Lock / Tier Icon Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-950/80 border border-red-900 text-[#E53935]">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E53935] font-athletic block">
              Premium Tier Requirement
            </span>
            <h2 className="text-xl font-bold font-athletic uppercase text-white">
              {config.featureName}
            </h2>
          </div>
        </div>

        {/* Plan Explanation Banner */}
        <div className="mt-5 rounded-xl border border-red-900 bg-[#2A2E35] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider font-athletic text-[#E53935]">
              {meta.badge}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-athletic text-white">{meta.price}</span>
              <span className="text-xs text-zinc-400">{meta.period}</span>
            </div>
          </div>
          <p className="text-sm font-bold font-athletic text-white uppercase mt-2">
            {meta.headline}
          </p>
          {config.featureDescription && (
            <p className="text-xs text-zinc-300 mt-1">
              {config.featureDescription}
            </p>
          )}
        </div>

        {/* Features Checklist */}
        <div className="mt-5 space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-athletic block">
            What's included in {meta.name}:
          </span>
          {meta.bulletPoints.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
              <Check className="h-4 w-4 shrink-0 text-[#E53935] mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Security & Instant Activation Guarantee */}
        <div className="mt-5 rounded-xl bg-[#2A2E35] border border-zinc-700 p-3 text-[11px] text-zinc-300 flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-[#E53935] shrink-0 mt-0.5" />
          <span>
            <strong className="text-white">Instant Access:</strong> Upgrading unlocks all {meta.name} routines, personalized meal recommendations, and strength guidance immediately on your account.
          </span>
        </div>

        {/* Upgrade Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            id="modal-quick-upgrade-btn"
            onClick={handleQuickUpgrade}
            disabled={isProcessing}
            className={`w-full flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold font-athletic text-xs uppercase tracking-wider transition shadow-sm cursor-pointer ${meta.btnBg} disabled:opacity-50`}
          >
            <Smartphone className="h-4 w-4" />
            <span>{isProcessing ? 'Updating...' : `Pay ${meta.price} via UPI`}</span>
          </button>

          {onNavigateToPlans && (
            <button
              id="modal-view-all-plans-btn"
              onClick={() => {
                onClose();
                onNavigateToPlans();
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-xl border border-zinc-700 bg-[#2A2E35] text-zinc-200 hover:bg-zinc-700 text-xs font-bold font-athletic uppercase tracking-wider transition text-center cursor-pointer"
            >
              View All Plans
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
