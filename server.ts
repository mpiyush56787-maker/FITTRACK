import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db';
import { GoogleGenAI } from '@google/genai';
import {
  generateUpiDeepLink,
  sanitizeUtr,
  UPI_CONFIG
} from './server/upi';
import { SubscriptionTier, UpiPaymentSubmission } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for session/token simulation via header or query
const getUserIdFromReq = (req: express.Request): string => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return (req.headers['x-user-id'] as string) || 'user-demo';
};

// Security middleware: Ensure caller has verified administrative role
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userId = getUserIdFromReq(req);
  const user = db.findUserById(userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access Denied: Administrative privileges required. Normal user accounts are strictly forbidden from accessing this resource.'
    });
  }
  next();
};

// ============================================
// AUTH & PROFILE ENDPOINTS
// ============================================

app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, age, gender, heightCm, weightKg, fitnessGoal, activityLevel, dietPreference, foodBudget } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'admin@fittrack.com') {
      return res.status(400).json({ error: 'This is the reserved administrative account. Please use Sign In.' });
    }

    const existing = db.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      name,
      role: 'user' as const,
      createdAt: new Date().toISOString()
    };

    const { user, profile } = db.createUser(newUser, {
      name,
      age: Number(age) || 25,
      gender: gender || 'Male',
      heightCm: Number(heightCm) || 175,
      weightKg: Number(weightKg) || 70,
      fitnessGoal: fitnessGoal || 'Build Muscle',
      activityLevel: activityLevel || 'Moderately Active',
      dietPreference: dietPreference || 'Vegetarian',
      foodBudget: foodBudget || 'Moderate'
    });

    const subscription = db.getSubscription(user.id);

    return res.json({
      token: user.id,
      user,
      profile,
      subscription
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Signup failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = db.findUserByEmail(cleanEmail);
    if (!user) {
      if (cleanEmail === 'admin@fittrack.com') {
        user = db.findUserById('user-admin');
      } else {
        const created = db.createUser({
          id: `user-${Date.now()}`,
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          role: 'user',
          createdAt: new Date().toISOString()
        });
        user = created.user;
      }
    }

    const profile = db.getProfile(user!.id);
    const subscription = db.getSubscription(user!.id);

    return res.json({
      token: user!.id,
      user,
      profile,
      subscription
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const userId = getUserIdFromReq(req);
  const user = db.findUserById(userId) || db.findUserById('user-demo');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const profile = db.getProfile(user.id);
  const subscription = db.getSubscription(user.id);
  return res.json({ user, profile, subscription });
});

app.put('/api/auth/profile', (req, res) => {
  const userId = getUserIdFromReq(req);
  try {
    const updated = db.updateProfile(userId, req.body);
    return res.json({ profile: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Profile update failed' });
  }
});

// ============================================
// FOODS & FOOD LOGS ENDPOINTS
// ============================================

app.get('/api/foods', (req, res) => {
  const userId = getUserIdFromReq(req);
  const query = ((req.query.q as string) || '').toLowerCase().trim();
  const category = (req.query.category as string) || '';
  const filterFavorite = req.query.favorites === 'true';
  const filterRecent = req.query.recents === 'true';
  
  let foods = db.getFoods();
  const favoriteIds = new Set(db.getFavoriteFoodIds(userId));

  if (filterRecent) {
    foods = db.getRecentFoods(userId, 20);
  }

  if (category && category !== 'All') {
    foods = foods.filter(f => f.category === category);
  }

  if (filterFavorite) {
    foods = foods.filter(f => favoriteIds.has(f.id));
  }

  if (query) {
    foods = foods.filter(f => 
      f.name.toLowerCase().includes(query) || 
      f.category.toLowerCase().includes(query) ||
      (f.servingUnit && f.servingUnit.toLowerCase().includes(query))
    );
  }

  const enrichedFoods = foods.map(f => ({
    ...f,
    isFavorite: favoriteIds.has(f.id)
  }));

  return res.json({ foods: enrichedFoods, totalCount: enrichedFoods.length });
});

app.get('/api/foods/favorites', (req, res) => {
  const userId = getUserIdFromReq(req);
  const favoriteIds = new Set(db.getFavoriteFoodIds(userId));
  const foods = db.getFoods()
    .filter(f => favoriteIds.has(f.id))
    .map(f => ({ ...f, isFavorite: true }));
  return res.json({ foods });
});

app.get('/api/foods/recents', (req, res) => {
  const userId = getUserIdFromReq(req);
  const favoriteIds = new Set(db.getFavoriteFoodIds(userId));
  const recents = db.getRecentFoods(userId, 15).map(f => ({
    ...f,
    isFavorite: favoriteIds.has(f.id)
  }));
  return res.json({ foods: recents });
});

app.post('/api/foods/:id/favorite', (req, res) => {
  const userId = getUserIdFromReq(req);
  const isFavorite = db.toggleFavoriteFood(userId, req.params.id);
  return res.json({ success: true, isFavorite, foodId: req.params.id });
});

app.post('/api/foods', (req, res) => {
  const userId = getUserIdFromReq(req);
  try {
    const { name, category, servingUnit, servingGrams, calories, protein, carbs, fat, fiber } = req.body;
    if (!name || calories === undefined) {
      return res.status(400).json({ error: 'Food name and calories are required' });
    }

    const created = db.addFood({
      name,
      category: category || 'Custom',
      servingUnit: servingUnit || '100g',
      servingGrams: Number(servingGrams) || 100,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      isCustom: true,
      createdBy: userId,
      verified: false
    });

    return res.json({ food: created });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to add custom food' });
  }
});

app.delete('/api/foods/:id', (req, res) => {
  const userId = getUserIdFromReq(req);
  const user = db.findUserById(userId);
  const isAdmin = user?.role === 'admin';
  const success = db.deleteFood(req.params.id, userId, isAdmin);
  if (success) {
    return res.json({ success: true });
  }
  return res.status(403).json({ error: 'Cannot delete this food item' });
});

app.get('/api/food-logs', (req, res) => {
  const userId = getUserIdFromReq(req);
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const logs = db.getFoodLogs(userId, date);

  // Calculate daily totals
  const totals = logs.reduce(
    (acc, log) => {
      acc.calories += log.calories;
      acc.protein += log.protein;
      acc.carbs += log.carbs;
      acc.fat += log.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Round totals
  totals.calories = Math.round(totals.calories);
  totals.protein = Math.round(totals.protein * 10) / 10;
  totals.carbs = Math.round(totals.carbs * 10) / 10;
  totals.fat = Math.round(totals.fat * 10) / 10;

  const profile = db.getProfile(userId);
  const remaining = {
    calories: Math.max(0, profile.targetCalories - totals.calories),
    protein: Math.max(0, Math.round((profile.targetProtein - totals.protein) * 10) / 10),
    carbs: Math.max(0, Math.round((profile.targetCarbs - totals.carbs) * 10) / 10),
    fat: Math.max(0, Math.round((profile.targetFat - totals.fat) * 10) / 10)
  };

  return res.json({ logs, totals, targets: profile, remaining, date });
});

app.post('/api/food-logs', (req, res) => {
  const userId = getUserIdFromReq(req);
  try {
    const { date, mealType, foodId, foodName, quantity, servingUnit, calories, protein, carbs, fat } = req.body;
    if (!foodName || !mealType) {
      return res.status(400).json({ error: 'Food and meal type required' });
    }

    const log = db.addFoodLog({
      userId,
      date: date || new Date().toISOString().split('T')[0],
      mealType,
      foodId: foodId || `f-custom-${Date.now()}`,
      foodName,
      quantity: Number(quantity) || 1,
      servingUnit: servingUnit || 'serving',
      calories: Math.round(Number(calories) * (Number(quantity) || 1)),
      protein: Math.round(Number(protein) * (Number(quantity) || 1) * 10) / 10,
      carbs: Math.round(Number(carbs) * (Number(quantity) || 1) * 10) / 10,
      fat: Math.round(Number(fat) * (Number(quantity) || 1) * 10) / 10
    });

    return res.json({ log });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to log food' });
  }
});

app.put('/api/food-logs/:id', (req, res) => {
  const userId = getUserIdFromReq(req);
  try {
    const { mealType, quantity, servingUnit, calories, protein, carbs, fat } = req.body;
    const updates: any = {};
    if (mealType !== undefined) updates.mealType = mealType;
    if (quantity !== undefined) updates.quantity = Number(quantity);
    if (servingUnit !== undefined) updates.servingUnit = servingUnit;
    if (calories !== undefined) updates.calories = Math.round(Number(calories));
    if (protein !== undefined) updates.protein = Math.round(Number(protein) * 10) / 10;
    if (carbs !== undefined) updates.carbs = Math.round(Number(carbs) * 10) / 10;
    if (fat !== undefined) updates.fat = Math.round(Number(fat) * 10) / 10;

    const updated = db.updateFoodLog(req.params.id, userId, updates);
    if (updated) {
      return res.json({ log: updated });
    }
    return res.status(404).json({ error: 'Food log not found' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update food log' });
  }
});

app.delete('/api/food-logs/:id', (req, res) => {
  const userId = getUserIdFromReq(req);
  const success = db.deleteFoodLog(req.params.id, userId);
  return res.json({ success });
});

// ============================================
// EXERCISES & WORKOUTS ENDPOINTS
// ============================================

app.get('/api/exercises', (req, res) => {
  const exercises = db.getExercises();
  return res.json({ exercises });
});

app.post('/api/exercises', (req, res) => {
  const userId = getUserIdFromReq(req);
  try {
    const { name, category, equipment, primaryMuscle, instructions } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Exercise name and muscle category required' });
    }

    const ex = db.addExercise({
      name,
      category,
      equipment: equipment || 'Barbell',
      primaryMuscle: primaryMuscle || category,
      instructions: instructions || 'Perform with controlled tempo and strict form.',
      isCustom: true,
      createdBy: userId
    });

    return res.json({ exercise: ex });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create exercise' });
  }
});

app.get('/api/workouts', (req, res) => {
  const userId = getUserIdFromReq(req);
  const workouts = db.getWorkouts(userId);
  return res.json({ workouts });
});

app.get('/api/workouts/:id', (req, res) => {
  const userId = getUserIdFromReq(req);
  const workout = db.getWorkoutById(req.params.id, userId);
  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' });
  }
  return res.json({ workout });
});

app.post('/api/workouts', (req, res) => {
  const userId = getUserIdFromReq(req);
  try {
    const { name, date, durationMinutes, notes, sets } = req.body;
    if (!sets || !Array.isArray(sets) || sets.length === 0) {
      return res.status(400).json({ error: 'Workout must contain at least one exercise set' });
    }

    const result = db.logWorkout(userId, {
      name: name || 'Athletic Training Session',
      date: date || new Date().toISOString().split('T')[0],
      durationMinutes: Number(durationMinutes) || 45,
      notes: notes || '',
      sets
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to log workout' });
  }
});

app.delete('/api/workouts/:id', (req, res) => {
  const userId = getUserIdFromReq(req);
  const success = db.deleteWorkout(req.params.id, userId);
  return res.json({ success });
});

app.get('/api/workout/stats', (req, res) => {
  const userId = getUserIdFromReq(req);
  const stats = db.getWorkoutStats(userId);
  return res.json({ stats });
});

// ============================================
// STRENGTH & PERSONAL RECORDS
// ============================================

app.get('/api/strength/records', (req, res) => {
  const userId = getUserIdFromReq(req);
  const records = db.getPersonalRecords(userId);
  return res.json({ records });
});

app.post('/api/strength/records', (req, res) => {
  const userId = getUserIdFromReq(req);
  const { id, exerciseId, exerciseName, category, maxWeightKg, maxRepsAtWeight, achievedAt } = req.body;

  if (!exerciseName || typeof exerciseName !== 'string' || !exerciseName.trim()) {
    return res.status(400).json({ error: 'Exercise name is required' });
  }

  const weight = Number(maxWeightKg);
  const reps = Number(maxRepsAtWeight);

  if (isNaN(weight) || weight <= 0) {
    return res.status(400).json({ error: 'Please enter a valid weight greater than 0 kg' });
  }

  if (isNaN(reps) || reps <= 0) {
    return res.status(400).json({ error: 'Please enter a valid number of reps (minimum 1)' });
  }

  const result = db.savePersonalRecord(userId, {
    id,
    exerciseId,
    exerciseName: exerciseName.trim(),
    category,
    maxWeightKg: weight,
    maxRepsAtWeight: Math.round(reps),
    achievedAt: achievedAt || new Date().toISOString().split('T')[0]
  });

  return res.status(200).json(result);
});

app.delete('/api/strength/records/:id', (req, res) => {
  const userId = getUserIdFromReq(req);
  const success = db.deletePersonalRecord(userId, req.params.id);
  if (success) {
    return res.json({ success: true, message: 'Personal record deleted' });
  }
  return res.status(404).json({ error: 'Record not found' });
});

app.get('/api/strength/progression', (req, res) => {
  const userId = getUserIdFromReq(req);
  const exerciseId = (req.query.exerciseId as string) || 'ex-1';
  const range = (req.query.range as any) || '30d';

  const history = db.getStrengthProgression(userId, exerciseId, range);
  return res.json({ history, exerciseId, range });
});

// ============================================
// PROGRESSIVE OVERLOAD (Plan ₹699)
// ============================================

app.get('/api/progressive-overload', (req, res) => {
  const userId = getUserIdFromReq(req);
  const sub = db.getSubscription(userId);
  
  if (sub.tier !== 'PLAN_699') {
    return res.status(403).json({
      error: 'Upgrade required',
      requiredTier: 'PLAN_699',
      message: 'Progressive Overload intelligence is exclusive to FITTRACK ELITE (₹699/month).'
    });
  }

  const recommendations = db.getProgressiveOverloadRecommendations(userId);
  return res.json({ recommendations });
});

// ============================================
// PERSONALIZED NUTRITION (Plan ₹299+)
// ============================================

app.get('/api/nutrition/plan', (req, res) => {
  const userId = getUserIdFromReq(req);
  const sub = db.getSubscription(userId);

  if (sub.tier === 'FREE') {
    return res.status(403).json({
      error: 'Upgrade required',
      requiredTier: 'PLAN_299',
      message: 'Personalized Indian nutrition & meal plans require FITTRACK Nutrition (₹299/month) or higher.'
    });
  }

  const plan = db.getPersonalizedMealPlan(userId);
  return res.json({ plan });
});

// ============================================
// PERSONALIZED WORKOUTS (Plan ₹449+)
// ============================================

app.get('/api/workout/plans', (req, res) => {
  const userId = getUserIdFromReq(req);
  const sub = db.getSubscription(userId);

  if (sub.tier === 'FREE' || sub.tier === 'PLAN_299') {
    return res.status(403).json({
      error: 'Upgrade required',
      requiredTier: 'PLAN_449',
      message: 'Custom workout splits and training routines require FITTRACK Performance (₹449/month) or higher.'
    });
  }

  const split = req.query.split as any;
  const plan = db.getPersonalizedWorkoutPlan(userId, split);
  return res.json({ plan });
});

// ============================================
// SUBSCRIPTIONS & FEATURE GATING
// ============================================

app.get('/api/subscription', (req, res) => {
  const userId = getUserIdFromReq(req);
  const subscription = db.getSubscription(userId);
  return res.json({ subscription });
});

app.post('/api/subscription/upgrade', (req, res) => {
  const userId = getUserIdFromReq(req);
  const { tier } = req.body;
  if (!['FREE', 'PLAN_299', 'PLAN_449', 'PLAN_699'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid subscription tier' });
  }

  const updated = db.setSubscription(userId, tier);
  return res.json({
    subscription: updated,
    message: `Plan changed to ${updated.tierName}. Feature access updated successfully!`
  });
});

// Reset subscription to Free (useful for development & user self-reset)
app.post('/api/subscription/reset-free', (req, res) => {
  const userId = getUserIdFromReq(req);
  const updated = db.setSubscription(userId, 'FREE');
  return res.json({
    subscription: updated,
    message: 'Subscription reset to Free athlete membership.'
  });
});

// ============================================
// DIRECT UPI PAYMENT SYSTEM (₹299, ₹449, ₹699)
// ============================================

// 1. Get UPI Payment Details & Deep Link
app.get('/api/payment/upi-details', (req, res) => {
  try {
    const planTier = (req.query.planTier as SubscriptionTier) || 'PLAN_299';
    if (!['PLAN_299', 'PLAN_449', 'PLAN_699'].includes(planTier)) {
      return res.status(400).json({ error: 'Valid plan tier required (PLAN_299, PLAN_449, or PLAN_699)' });
    }

    const details = generateUpiDeepLink(planTier);
    return res.json(details);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate UPI payment details' });
  }
});

// 2. Submit UPI Transaction Reference / UTR
app.post('/api/payment/submit-utr', (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const { planTier, amountInr, utr, upiRefId, notes } = req.body;

    if (!planTier || !['PLAN_299', 'PLAN_449', 'PLAN_699'].includes(planTier)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan selected. Please choose ₹299, ₹449, or ₹699.'
      });
    }

    const cleanUtr = sanitizeUtr(utr || '');
    if (!cleanUtr || cleanUtr.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 12-digit UPI Reference / UTR Transaction ID.'
      });
    }

    const user = db.findUserById(userId);
    const profile = db.getProfile(userId);
    const planMeta = UPI_CONFIG.plans[planTier as SubscriptionTier];

    const submission: UpiPaymentSubmission = {
      id: `upi-sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userEmail: user?.email || 'athlete@fittrack.com',
      userName: profile?.name || user?.name || 'Athlete',
      planTier: planTier as SubscriptionTier,
      planName: planMeta?.name || planTier,
      amountInr: planMeta?.amountInr || Number(amountInr) || 299,
      payeeUpiId: UPI_CONFIG.payeeUpiId,
      payeeName: UPI_CONFIG.payeeName,
      utr: cleanUtr,
      status: 'verification_pending',
      submittedAt: new Date().toISOString(),
      upiRefId: upiRefId || `FTK${Date.now()}`,
      userNotes: notes ? String(notes).trim() : undefined
    };

    const saved = db.createUpiSubmission(submission);

    // Note: Do NOT automatically activate the plan.
    // Plan remains in current state until verification.
    return res.json({
      success: true,
      submission: saved,
      message: 'UTR submitted successfully! Your payment is currently under verification. Premium features will unlock once verified.'
    });
  } catch (err: any) {
    console.error('Error submitting UTR:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to submit payment details'
    });
  }
});

// 3. User UPI Payment History
app.get('/api/payment/history', (req, res) => {
  const userId = getUserIdFromReq(req);
  const submissions = db.getUserUpiSubmissions(userId);
  return res.json({ submissions, orders: submissions });
});

// 4. Admin UPI Submissions List (Admin Only)
app.get('/api/admin/upi-submissions', requireAdmin, (req, res) => {
  const submissions = db.getAllUpiSubmissions();
  return res.json({ submissions });
});

// Admin Verify Access Status
app.get('/api/admin/verify-access', (req, res) => {
  const userId = getUserIdFromReq(req);
  const user = db.findUserById(userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      authorized: false,
      error: 'Unauthorized: Admin privileges required'
    });
  }
  return res.json({
    authorized: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

// 5. Admin Approve UPI Submission & Activate Plan (Admin Only, No Self-Approval)
app.post('/api/admin/upi-submissions/:id/approve', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminUserId = getUserIdFromReq(req);

    const submission = db.getUpiSubmission(id);
    if (!submission) {
      return res.status(404).json({ error: 'Payment submission not found' });
    }

    // Security requirement: Users (including administrators) must never be able to approve their own payments
    if (submission.userId === adminUserId) {
      return res.status(403).json({
        error: 'Security Policy Violation: You cannot approve your own payment submission. Dual-control security policy requires a separate administrator.'
      });
    }

    const verificationNote = adminNotes && String(adminNotes).trim() ? String(adminNotes).trim() : 'Verified against bank statement by administrator';
    const result = db.approveUpiSubmission(id, verificationNote);

    if (!result) {
      return res.status(500).json({ error: 'Failed to approve payment submission' });
    }

    return res.json({
      success: true,
      submission: result.submission,
      subscription: result.subscription,
      message: `Payment verified! ${result.subscription.tierName} plan activated for ${result.submission.userName || 'user'}.`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Approval failed' });
  }
});

// 6. Admin Reject UPI Submission (Admin Only, No Self-Rejection)
app.post('/api/admin/upi-submissions/:id/reject', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminUserId = getUserIdFromReq(req);

    const submission = db.getUpiSubmission(id);
    if (!submission) {
      return res.status(404).json({ error: 'Payment submission not found' });
    }

    // Security requirement: Users cannot self-review their own payments
    if (submission.userId === adminUserId) {
      return res.status(403).json({
        error: 'Security Policy Violation: You cannot process administrative actions on your own payment submission.'
      });
    }

    const rejectionReason = (adminNotes && String(adminNotes).trim()) || 'UTR not verified on bank records';
    const rejected = db.rejectUpiSubmission(id, rejectionReason);

    if (!rejected) {
      return res.status(500).json({ error: 'Failed to reject payment submission' });
    }

    return res.json({
      success: true,
      submission: rejected,
      message: 'Payment submission marked as rejected. Plan remains inactive.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Rejection failed' });
  }
});

// ============================================
// METRICS (WEIGHT & WATER)
// ============================================

app.get('/api/metrics', (req, res) => {
  const userId = getUserIdFromReq(req);
  const metrics = db.getMetrics(userId);
  return res.json({ metrics });
});

app.post('/api/metrics', (req, res) => {
  const userId = getUserIdFromReq(req);
  const { date, weightKg, waterIntakeMl } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];
  const updated = db.logMetric(userId, targetDate, weightKg ? Number(weightKg) : undefined, waterIntakeMl !== undefined ? Number(waterIntakeMl) : undefined);
  return res.json({ metric: updated });
});

// ============================================
// ADMIN PANEL ENDPOINTS (Admin Only)
// ============================================

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = db.getAllUsers();
  return res.json({ users });
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const users = db.getAllUsers();
  const foods = db.getFoods();
  const exercises = db.getExercises();
  const upiSubmissions = db.getAllUpiSubmissions();
  return res.json({
    totalUsers: users.length,
    totalFoods: foods.length,
    totalExercises: exercises.length,
    activeSubscriptions: users.filter(u => u.subscription?.tier !== 'FREE').length,
    totalSubmissions: upiSubmissions.length,
    pendingPayments: upiSubmissions.filter(s => s.status === 'verification_pending').length,
    approvedPayments: upiSubmissions.filter(s => s.status === 'approved').length,
    rejectedPayments: upiSubmissions.filter(s => s.status === 'rejected').length
  });
});

// ============================================
// AI FITNESS COACH (Server-side Gemini)
// ============================================

app.post('/api/ai/coach', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        advice: `Discipline beats motivation. Based on your current training, focus on maintaining strict progressive overload, hitting your daily protein target (at least 1.8g-2.2g per kg bodyweight), and drinking 3.5L+ water.`
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are FITTRACK AI Coach, an elite athletic fitness & nutrition coach.
The user's context: ${JSON.stringify(context || {})}
User question/prompt: ${prompt || 'Give me a personalized workout & nutrition coaching tip for today.'}

Provide a concise, high-impact, science-grounded response with clear actionable cues. Keep tone athletic, motivating, and professional. Max 3 short paragraphs.`
    });

    return res.json({ advice: response.text });
  } catch (err: any) {
    console.error('AI Coach error:', err);
    return res.json({
      advice: 'Stay consistent. Keep tracking your lifts and hitting your target macros every single day.'
    });
  }
});

// ============================================
// VITE & STATIC SERVING
// ============================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FITTRACK Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
