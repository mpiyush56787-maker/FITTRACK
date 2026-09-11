export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export type FitnessGoal = 'Lose Fat' | 'Build Muscle' | 'Maintain Weight' | 'Improve Strength';
export type ActivityLevel = 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extra Active';
export type DietPreference = 'Vegetarian' | 'Non-Vegetarian' | 'Eggitarian' | 'Vegan';
export type Gender = 'Male' | 'Female' | 'Other';

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  dietPreference: DietPreference;
  foodBudget?: 'Budget Friendly' | 'Moderate' | 'Flexible';
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  waterTargetMl: number;
  updatedAt: string;
}

export type FoodCategory =
  | 'Indian Meals'
  | 'Indian Snacks'
  | 'Fruits'
  | 'Vegetables'
  | 'Dairy'
  | 'Eggs'
  | 'Chicken'
  | 'Fish'
  | 'Rice'
  | 'Bread'
  | 'Protein Foods'
  | 'Beverages'
  | 'Packaged Foods'
  | 'Fast Food'
  | 'Indian Staples'
  | 'Protein Sources'
  | 'Dairy & Milk'
  | 'Fruits & Veggies'
  | 'Grains & Oats'
  | 'Packaged & Global'
  | 'Custom';

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  servingSize?: string;
  servingUnit: string;
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  isCustom?: boolean;
  createdBy?: string;
  verified?: boolean;
  isFavorite?: boolean;
  sampleDataNotice?: string;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';

export interface FoodLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  foodId: string;
  foodName: string;
  quantity: number; // multiplier of servingUnit
  servingSize?: string;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
}

export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';
export type Equipment = 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight';

export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup;
  equipment: Equipment;
  primaryMuscle: string;
  instructions?: string;
  isCustom?: boolean;
  createdBy?: string;
}

export interface WorkoutSet {
  id: string;
  workoutId?: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  isWarmup?: boolean;
  isPR?: boolean;
  notes?: string;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  notes?: string;
  sets: WorkoutSet[];
  totalVolumeKg: number;
  prsAchieved: string[];
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  maxWeightKg: number;
  maxRepsAtWeight: number;
  estimated1RM: number;
  achievedAt: string;
  previousBestWeightKg?: number;
  previousBestReps?: number;
  totalSessions: number;
  lastWorkoutDate: string;
}

export interface DailyMetric {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weightKg?: number;
  waterIntakeMl: number;
  sleepHours?: number;
  calorieIntake?: number;
  proteinGrams?: number;
  notes?: string;
}

export type SubscriptionTier = 'FREE' | 'PLAN_299' | 'PLAN_449' | 'PLAN_699';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  tierName: string;
  priceInr: number;
  billingCycle: 'monthly';
  startDate: string;
  renewalDate: string;
  status: 'active' | 'trial';
  features: string[];
  lastPaymentId?: string;
  lastOrderId?: string;
}

export interface UpiPaymentDetails {
  upiId: string;
  payeeName: string;
  amountInr: number;
  planTier: SubscriptionTier;
  planName: string;
  upiDeepLink: string;
  upiRefId: string;
}

export interface UpiPaymentSubmission {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planTier: SubscriptionTier;
  planName: string;
  amountInr: number;
  payeeUpiId: string;
  payeeName: string;
  utr: string;
  status: 'verification_pending' | 'approved' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
  adminNotes?: string;
  upiRefId?: string;
  userNotes?: string;
}

export interface SubmitUtrRequest {
  planTier: SubscriptionTier;
  amountInr: number;
  utr: string;
  upiRefId?: string;
  notes?: string;
}

export interface SubmitUtrResponse {
  success: boolean;
  submission: UpiPaymentSubmission;
  message: string;
}

// PaymentOrder compatibility interface for stored orders/submissions
export interface PaymentOrder {
  id: string;
  userId: string;
  planTier: SubscriptionTier;
  planName: string;
  amountInr: number;
  status: 'verification_pending' | 'approved' | 'rejected' | 'created' | 'paid' | 'failed';
  utr?: string;
  payeeUpiId?: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}


export interface ProgressiveOverloadRecommendation {
  exerciseId: string;
  exerciseName: string;
  previousWeightKg: number;
  previousReps: number;
  targetRepRange: string;
  recommendedWeightKg: number;
  recommendedReps: string;
  status: 'increase_reps' | 'increase_weight' | 'maintain_refine';
  reasoning: string;
  lastWorkoutDate: string;
}

export interface MealPlanItem {
  name: string;
  portion?: string;
  serving?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  costInr?: number;
  prepTip?: string;
}

export interface DailyMealPlan {
  title?: string;
  dietPreference: DietPreference;
  budget: string;
  budgetNotes?: string;
  dailyCalories?: number;
  dailyProteinGrams?: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  meals: {
    mealType: MealType;
    timing?: string;
    title: string;
    calories?: number;
    protein?: number;
    items: MealPlanItem[];
    totalCalories: number;
    totalProtein: number;
  }[];
  expertNutritionTips: string[];
}

export type MealPlan = DailyMealPlan;

export interface WorkoutSplitPlan {
  title?: string;
  splitType?: string;
  split?: 'Full Body' | 'Upper / Lower' | 'Push Pull Legs' | 'Bro Split';
  daysPerWeek: number;
  goal?: FitnessGoal;
  experience?: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment?: 'Commercial Gym' | 'Dumbbells Only' | 'Home Gym';
  progressiveOverloadRules?: string;
  schedule?: {
    day: string;
    name: string;
    focus: string;
    exercises: {
      name: string;
      targetSets: string;
      notes?: string;
    }[];
  }[];
  days?: {
    dayName: string;
    focus: string;
    exercises: {
      exerciseName: string;
      category: string;
      sets: number;
      repRange: string;
      restSec: number;
      instructions: string;
    }[];
  }[];
}

export type WorkoutSplit = WorkoutSplitPlan;

export interface StrengthChartPoint {
  date: string;
  weightKg: number;
  reps: number;
  volumeKg: number;
  estimated1RM: number;
}
