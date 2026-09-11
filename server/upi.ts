import { SubscriptionTier, UpiPaymentDetails } from '../src/types';

export const UPI_CONFIG = {
  payeeUpiId: 'mtushar9801@okhdfcbank',
  payeeName: 'FITTRACK',
  plans: {
    PLAN_299: {
      name: 'FITTRACK NUTRITION',
      amountInr: 299,
      description: 'Personalized Indian Nutrition & Macro Planner'
    },
    PLAN_449: {
      name: 'FITTRACK PERFORMANCE',
      amountInr: 449,
      description: 'Workout Splits & Performance Tracking'
    },
    PLAN_699: {
      name: 'FITTRACK ELITE',
      amountInr: 699,
      description: 'Complete Transformation & Progressive Overload AI'
    }
  } as Record<SubscriptionTier, { name: string; amountInr: number; description: string }>
};

/**
 * Generate UPI deep link according to NPCI UPI specification
 * format: upi://pay?pa={UPI_ID}&pn={NAME}&am={AMOUNT}&cu=INR&tn={NOTE}&tr={REF_ID}
 */
export function generateUpiDeepLink(
  planTier: SubscriptionTier,
  customRefId?: string
): UpiPaymentDetails {
  const plan = UPI_CONFIG.plans[planTier];
  if (!plan) {
    throw new Error(`Invalid plan tier: ${planTier}`);
  }

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const upiRefId = customRefId || `FTK${timestamp.toString().slice(-6)}${randomSuffix}`;
  
  const transactionNote = `FITTRACK ${plan.name} (${planTier})`;
  const encodedNote = encodeURIComponent(transactionNote);
  const encodedName = encodeURIComponent(UPI_CONFIG.payeeName);

  // Standard NPCI UPI URI
  const upiDeepLink = `upi://pay?pa=${UPI_CONFIG.payeeUpiId}&pn=${encodedName}&am=${plan.amountInr}&cu=INR&tn=${encodedNote}&tr=${upiRefId}`;

  return {
    upiId: UPI_CONFIG.payeeUpiId,
    payeeName: UPI_CONFIG.payeeName,
    amountInr: plan.amountInr,
    planTier,
    planName: plan.name,
    upiDeepLink,
    upiRefId
  };
}

/**
 * Helper to clean and format user-entered UTR / Transaction ID
 */
export function sanitizeUtr(rawUtr: string): string {
  if (!rawUtr) return '';
  return rawUtr.trim().replace(/\s+/g, '');
}
