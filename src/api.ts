import {
  User,
  UserProfile,
  Food,
  FoodLog,
  Exercise,
  Workout,
  PersonalRecord,
  DailyMetric,
  SubscriptionInfo,
  SubscriptionTier,
  ProgressiveOverloadRecommendation,
  DailyMealPlan,
  WorkoutSplitPlan,
  PaymentOrder,
  UpiPaymentDetails,
  UpiPaymentSubmission,
  SubmitUtrRequest,
  SubmitUtrResponse
} from './types';

const getHeaders = () => {
  const token = localStorage.getItem('fittrack_token') || 'user-demo';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-user-id': token
  };
};

export const api = {
  // Auth
  async signup(data: any): Promise<{ user: User; profile: UserProfile; subscription: SubscriptionInfo; token: string }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Signup failed');
    }
    return res.json();
  },

  async login(email: string): Promise<{ user: User; profile: UserProfile; subscription: SubscriptionInfo; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User; profile: UserProfile; subscription: SubscriptionInfo }> {
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<{ profile: UserProfile }> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Foods & Logs
  async getFoods(query = '', category = ''): Promise<{ foods: Food[] }> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    const res = await fetch(`/api/foods?${params.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch foods');
    return res.json();
  },

  async createCustomFood(food: Partial<Food>): Promise<{ food: Food }> {
    const res = await fetch('/api/foods', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(food)
    });
    if (!res.ok) throw new Error('Failed to create food');
    return res.json();
  },

  async deleteFood(id: string): Promise<boolean> {
    const res = await fetch(`/api/foods/${id}`, { method: 'DELETE', headers: getHeaders() });
    return res.ok;
  },

  async getFoodLogs(date: string): Promise<{ logs: FoodLog[]; totals: { calories: number; protein: number; carbs: number; fat: number }; targets: UserProfile; remaining: any; date: string }> {
    const res = await fetch(`/api/food-logs?date=${date}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch food logs');
    return res.json();
  },

  async logFood(logData: any): Promise<{ log: FoodLog }> {
    const res = await fetch('/api/food-logs', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(logData)
    });
    if (!res.ok) throw new Error('Failed to log food');
    return res.json();
  },

  async updateFoodLog(id: string, updates: any): Promise<{ log: FoodLog }> {
    const res = await fetch(`/api/food-logs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update food log');
    return res.json();
  },

  async deleteFoodLog(id: string): Promise<boolean> {
    const res = await fetch(`/api/food-logs/${id}`, { method: 'DELETE', headers: getHeaders() });
    return res.ok;
  },

  // Exercises & Workouts
  async getExercises(): Promise<{ exercises: Exercise[] }> {
    const res = await fetch('/api/exercises', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch exercises');
    return res.json();
  },

  async createExercise(exercise: Partial<Exercise>): Promise<{ exercise: Exercise }> {
    const res = await fetch('/api/exercises', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(exercise)
    });
    if (!res.ok) throw new Error('Failed to create exercise');
    return res.json();
  },

  async getWorkouts(): Promise<{ workouts: Workout[] }> {
    const res = await fetch('/api/workouts', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch workouts');
    return res.json();
  },

  async getWorkoutById(id: string): Promise<{ workout: Workout }> {
    const res = await fetch(`/api/workouts/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch workout');
    return res.json();
  },

  async logWorkout(workout: any): Promise<{ workout: Workout; newPRs: PersonalRecord[] }> {
    const res = await fetch('/api/workouts', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(workout)
    });
    if (!res.ok) throw new Error('Failed to log workout');
    return res.json();
  },

  async deleteWorkout(id: string): Promise<boolean> {
    const res = await fetch(`/api/workouts/${id}`, { method: 'DELETE', headers: getHeaders() });
    return res.ok;
  },

  async getWorkoutStats(): Promise<{ stats: any }> {
    const res = await fetch('/api/workout/stats', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch workout stats');
    return res.json();
  },

  // Strength Records & Progress
  async getPersonalRecords(): Promise<{ records: PersonalRecord[] }> {
    const res = await fetch('/api/strength/records', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch PRs');
    return res.json();
  },

  async savePersonalRecord(data: {
    id?: string;
    exerciseId?: string;
    exerciseName: string;
    category?: string;
    maxWeightKg: number;
    maxRepsAtWeight: number;
    achievedAt?: string;
  }): Promise<{ record: PersonalRecord; isNewExercise: boolean; isNewRecord: boolean }> {
    const res = await fetch('/api/strength/records', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to save PR' }));
      throw new Error(err.error || 'Failed to save PR');
    }
    return res.json();
  },

  async deletePersonalRecord(id: string): Promise<boolean> {
    const res = await fetch(`/api/strength/records/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.ok;
  },

  async getStrengthProgression(exerciseId: string, range = '30d'): Promise<{ history: any[]; exerciseId: string; range: string }> {
    const res = await fetch(`/api/strength/progression?exerciseId=${exerciseId}&range=${range}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch progression');
    return res.json();
  },

  // Progressive Overload (₹699)
  async getProgressiveOverload(): Promise<{ recommendations: ProgressiveOverloadRecommendation[] }> {
    const res = await fetch('/api/progressive-overload', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch overload recommendations');
    return res.json();
  },

  // Nutrition Plan (₹299+)
  async getPersonalizedMealPlan(): Promise<{ plan: DailyMealPlan; mealPlan?: DailyMealPlan }> {
    const res = await fetch('/api/nutrition/plan', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch meal plan');
    const data = await res.json();
    return { plan: data.plan, mealPlan: data.plan };
  },

  async getMealPlan(): Promise<{ mealPlan: DailyMealPlan }> {
    const res = await fetch('/api/nutrition/plan', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch meal plan');
    const data = await res.json();
    return { mealPlan: data.plan };
  },

  // Workout Plans (₹449+)
  async getPersonalizedWorkoutPlan(split?: string): Promise<{ plan: WorkoutSplitPlan; workoutSplit?: WorkoutSplitPlan }> {
    const url = split ? `/api/workout/plans?split=${encodeURIComponent(split)}` : '/api/workout/plans';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch workout plan');
    const data = await res.json();
    return { plan: data.plan, workoutSplit: data.plan };
  },

  async getWorkoutSplit(split?: string): Promise<{ workoutSplit: WorkoutSplitPlan }> {
    const url = split ? `/api/workout/plans?split=${encodeURIComponent(split)}` : '/api/workout/plans';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch workout split');
    const data = await res.json();
    return { workoutSplit: data.plan };
  },

  // Subscriptions
  async getSubscription(): Promise<{ subscription: SubscriptionInfo }> {
    const res = await fetch('/api/subscription', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch subscription');
    return res.json();
  },

  async upgradeSubscription(tier: SubscriptionTier): Promise<{ subscription: SubscriptionInfo; message: string }> {
    const res = await fetch('/api/subscription/upgrade', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ tier })
    });
    if (!res.ok) throw new Error('Failed to update subscription');
    return res.json();
  },

  async resetSubscriptionToFree(): Promise<{ subscription: SubscriptionInfo; message: string }> {
    const res = await fetch('/api/subscription/reset-free', {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to reset subscription');
    return res.json();
  },

  // Direct UPI Payment System (mtushar9801@okhdfcbank)
  async getUpiDetails(planTier: SubscriptionTier): Promise<UpiPaymentDetails> {
    const res = await fetch(`/api/payment/upi-details?planTier=${planTier}`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch UPI payment details' }));
      throw new Error(err.error || 'Failed to fetch UPI payment details');
    }
    return res.json();
  },

  async submitUtrPayment(data: SubmitUtrRequest): Promise<SubmitUtrResponse> {
    const res = await fetch('/api/payment/submit-utr', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json().catch(() => ({ success: false, error: 'Network submission error' }));
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to submit UPI UTR for verification');
    }
    return result;
  },

  async getPaymentHistory(): Promise<{ submissions: UpiPaymentSubmission[]; orders?: any[] }> {
    const res = await fetch('/api/payment/history', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch payment history');
    return res.json();
  },

  async getAdminUpiSubmissions(): Promise<{ submissions: UpiPaymentSubmission[] }> {
    const res = await fetch('/api/admin/upi-submissions', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin submissions');
    return res.json();
  },

  async verifyAdminAccess(): Promise<{ authorized: boolean; user?: any; error?: string }> {
    try {
      const res = await fetch('/api/admin/verify-access', { headers: getHeaders() });
      if (!res.ok) return { authorized: false, error: 'Unauthorized' };
      return res.json();
    } catch {
      return { authorized: false, error: 'Network error' };
    }
  },

  async approveAdminUpiSubmission(id: string, adminNotes?: string): Promise<{
    success: boolean;
    submission: UpiPaymentSubmission;
    subscription: SubscriptionInfo;
    message: string;
  }> {
    const res = await fetch(`/api/admin/upi-submissions/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ adminNotes })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Approval failed' }));
      throw new Error(err.error || 'Approval failed');
    }
    return res.json();
  },

  async rejectAdminUpiSubmission(id: string, adminNotes?: string): Promise<{
    success: boolean;
    submission: UpiPaymentSubmission;
    message: string;
  }> {
    const res = await fetch(`/api/admin/upi-submissions/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ adminNotes })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Rejection failed' }));
      throw new Error(err.error || 'Rejection failed');
    }
    return res.json();
  },

  // Metrics
  async getMetrics(): Promise<{ metrics: DailyMetric[] }> {
    const res = await fetch('/api/metrics', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  async updateMetric(data: { date?: string; weightKg?: number; waterIntakeMl?: number; sleepHours?: number }): Promise<{ metric: DailyMetric }> {
    const res = await fetch('/api/metrics', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update metrics');
    return res.json();
  },

  // Admin
  async getAdminUsers(): Promise<{ users: any[] }> {
    const res = await fetch('/api/admin/users', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin users');
    return res.json();
  },

  async getAdminStats(): Promise<{ totalUsers: number; totalFoods: number; totalExercises: number; activeSubscriptions: number }> {
    const res = await fetch('/api/admin/stats', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  // AI Coach
  async getAICoaching(prompt?: string, context?: any): Promise<{ advice: string }> {
    const res = await fetch('/api/ai/coach', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt, context })
    });
    if (!res.ok) throw new Error('AI Coach unavailable');
    return res.json();
  }
};
