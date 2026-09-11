import fs from 'fs';
import path from 'path';
import {
  User,
  UserProfile,
  Food,
  FoodLog,
  Exercise,
  Workout,
  PersonalRecord,
  DailyMetric,
  SubscriptionTier,
  SubscriptionInfo,
  ProgressiveOverloadRecommendation,
  DailyMealPlan,
  WorkoutSplitPlan,
  MuscleGroup,
  PaymentOrder,
  UpiPaymentSubmission
} from '../src/types';
import { STARTER_FOODS } from './foodData';

interface DatabaseSchema {
  users: User[];
  profiles: Record<string, UserProfile>;
  foods: Food[];
  foodLogs: FoodLog[];
  favoriteFoods?: Record<string, string[]>; // userId -> array of foodIds
  exercises: Exercise[];
  workouts: Workout[];
  personalRecords: PersonalRecord[];
  dailyMetrics: DailyMetric[];
  subscriptions: Record<string, SubscriptionInfo>;
  orders?: PaymentOrder[];
  upiSubmissions?: UpiPaymentSubmission[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Comprehensive Food Database with 320+ Indian & Global items
const INITIAL_FOODS: Food[] = STARTER_FOODS;

// Initial Exercises
const INITIAL_EXERCISES: Exercise[] = [
  { id: 'ex-1', name: 'Bench Press', category: 'Chest', equipment: 'Barbell', primaryMuscle: 'Pectoralis Major', instructions: 'Retract scapulae, arch back slightly, lower barbell smoothly to mid-chest, press upwards driving with legs.' },
  { id: 'ex-2', name: 'Incline Bench Press', category: 'Chest', equipment: 'Barbell', primaryMuscle: 'Upper Pectoralis', instructions: 'Set bench to 30-45 degrees, lower bar to upper chest and drive upwards in a controlled line.' },
  { id: 'ex-3', name: 'Squat', category: 'Legs', equipment: 'Barbell', primaryMuscle: 'Quadriceps, Glutes', instructions: 'Feet shoulder-width apart, brace core, descend until hip crease is below parallel, drive up through mid-foot.' },
  { id: 'ex-4', name: 'Deadlift', category: 'Back', equipment: 'Barbell', primaryMuscle: 'Hamstrings, Glutes, Erector Spinae', instructions: 'Hips back, bar over mid-foot, lock lats, push floor away and stand tall with full hip extension.' },
  { id: 'ex-5', name: 'Romanian Deadlift', category: 'Legs', equipment: 'Barbell', primaryMuscle: 'Hamstrings, Gluteus Maximus', instructions: 'Hinge hips back with slight knee bend, lower barbell along shins feeling deep stretch, squeeze glutes to return.' },
  { id: 'ex-6', name: 'Leg Press', category: 'Legs', equipment: 'Machine', primaryMuscle: 'Quadriceps, Glutes', instructions: 'Place feet shoulder width, lower sled with control without rounding lower back, press up smoothly.' },
  { id: 'ex-7', name: 'Leg Extension', category: 'Legs', equipment: 'Machine', primaryMuscle: 'Quadriceps', instructions: 'Extend knees fully, pause at top peak contraction for a second, lower slowly.' },
  { id: 'ex-8', name: 'Leg Curl', category: 'Legs', equipment: 'Machine', primaryMuscle: 'Hamstrings', instructions: 'Curl weight towards glutes, hold for 1 second, control the eccentric release.' },
  { id: 'ex-9', name: 'Lat Pulldown', category: 'Back', equipment: 'Cable', primaryMuscle: 'Latissimus Dorsi', instructions: 'Grip bar slightly wider than shoulders, pull to upper chest driving elbows down and back.' },
  { id: 'ex-10', name: 'Barbell Row', category: 'Back', equipment: 'Barbell', primaryMuscle: 'Upper Back, Rhomboids, Lats', instructions: 'Hinge forward at 45 degrees, pull barbell into lower ribcage squeezing shoulder blades.' },
  { id: 'ex-11', name: 'Seated Cable Row', category: 'Back', equipment: 'Cable', primaryMuscle: 'Middle Back, Lats, Rhomboids', instructions: 'Keep torso upright with slight natural arch, pull handle towards abdomen driving elbows back.' },
  { id: 'ex-12', name: 'Shoulder Press', category: 'Shoulders', equipment: 'Barbell', primaryMuscle: 'Anterior Deltoid', instructions: 'Stand tall with core tight, press barbell overhead without hyperextending lower back.' },
  { id: 'ex-13', name: 'Lateral Raise', category: 'Shoulders', equipment: 'Dumbbell', primaryMuscle: 'Lateral Deltoid', instructions: 'Raise dumbbells in scapular plane with elbows slightly bent up to shoulder level.' },
  { id: 'ex-14', name: 'Bicep Curl', category: 'Arms', equipment: 'Dumbbell', primaryMuscle: 'Biceps Brachii', instructions: 'Keep upper arms pinned to torso, curl weight upwards squeezing at peak contraction.' },
  { id: 'ex-15', name: 'Hammer Curl', category: 'Arms', equipment: 'Dumbbell', primaryMuscle: 'Brachialis, Brachioradialis', instructions: 'Hold dumbbells with neutral palms-facing grip, curl upwards strictly without swinging.' },
  { id: 'ex-16', name: 'Tricep Pushdown', category: 'Arms', equipment: 'Cable', primaryMuscle: 'Triceps Brachii', instructions: 'Lock elbows by your sides, extend arms downward fully flexing triceps at the bottom.' },
  { id: 'ex-17', name: 'Overhead Tricep Extension', category: 'Arms', equipment: 'Cable', primaryMuscle: 'Triceps Long Head', instructions: 'Extend arms overhead with elbows stationary, achieving maximum stretch and contraction.' },
  { id: 'ex-18', name: 'Calf Raise', category: 'Legs', equipment: 'Machine', primaryMuscle: 'Gastrocnemius, Soleus', instructions: 'Lower heels below platform for full stretch, push through balls of feet and hold at peak.' }
];

const INITIAL_USER: User = {
  id: 'user-demo',
  email: 'athlete@fittrack.com',
  name: 'Aman Sharma',
  role: 'user',
  createdAt: new Date().toISOString()
};

const INITIAL_ADMIN: User = {
  id: 'user-admin',
  email: 'admin@fittrack.com',
  name: 'Coach Vikram (Admin)',
  role: 'admin',
  createdAt: new Date().toISOString()
};

const INITIAL_PROFILE: UserProfile = {
  id: 'prof-demo',
  userId: 'user-demo',
  name: 'Aman Sharma',
  age: 26,
  gender: 'Male',
  heightCm: 178,
  weightKg: 74.5,
  fitnessGoal: 'Build Muscle',
  activityLevel: 'Moderately Active',
  dietPreference: 'Non-Vegetarian',
  foodBudget: 'Moderate',
  targetCalories: 2450,
  targetProtein: 160,
  targetCarbs: 265,
  targetFat: 68,
  waterTargetMl: 3500,
  updatedAt: new Date().toISOString()
};

// Helper for dates
const getPastDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const TODAY = new Date().toISOString().split('T')[0];

const INITIAL_WORKOUTS: Workout[] = [
  {
    id: 'w-1',
    userId: 'user-demo',
    name: 'Push Hypertrophy',
    date: getPastDateStr(4),
    durationMinutes: 55,
    notes: 'Felt solid energy. Great pump on bench.',
    totalVolumeKg: 6420,
    prsAchieved: ['Bench Press'],
    sets: [
      { id: 'ws-1', exerciseId: 'ex-1', exerciseName: 'Bench Press', setNumber: 1, weightKg: 60, reps: 10 },
      { id: 'ws-2', exerciseId: 'ex-1', exerciseName: 'Bench Press', setNumber: 2, weightKg: 65, reps: 8 },
      { id: 'ws-3', exerciseId: 'ex-1', exerciseName: 'Bench Press', setNumber: 3, weightKg: 70, reps: 6, isPR: true },
      { id: 'ws-4', exerciseId: 'ex-6', exerciseName: 'Shoulder Press', setNumber: 1, weightKg: 40, reps: 10 },
      { id: 'ws-5', exerciseId: 'ex-6', exerciseName: 'Shoulder Press', setNumber: 2, weightKg: 42.5, reps: 8 },
      { id: 'ws-6', exerciseId: 'ex-9', exerciseName: 'Tricep Pushdown', setNumber: 1, weightKg: 25, reps: 12 },
      { id: 'ws-7', exerciseId: 'ex-9', exerciseName: 'Tricep Pushdown', setNumber: 2, weightKg: 27.5, reps: 10 }
    ]
  },
  {
    id: 'w-2',
    userId: 'user-demo',
    name: 'Pull & Back Power',
    date: getPastDateStr(2),
    durationMinutes: 50,
    notes: 'Focused on lat squeeze. Grip held up well.',
    totalVolumeKg: 7800,
    prsAchieved: ['Deadlift'],
    sets: [
      { id: 'ws-8', exerciseId: 'ex-3', exerciseName: 'Deadlift', setNumber: 1, weightKg: 100, reps: 6 },
      { id: 'ws-9', exerciseId: 'ex-3', exerciseName: 'Deadlift', setNumber: 2, weightKg: 115, reps: 5 },
      { id: 'ws-10', exerciseId: 'ex-3', exerciseName: 'Deadlift', setNumber: 3, weightKg: 120, reps: 4, isPR: true },
      { id: 'ws-11', exerciseId: 'ex-4', exerciseName: 'Lat Pulldown', setNumber: 1, weightKg: 55, reps: 10 },
      { id: 'ws-12', exerciseId: 'ex-4', exerciseName: 'Lat Pulldown', setNumber: 2, weightKg: 60, reps: 8 },
      { id: 'ws-13', exerciseId: 'ex-8', exerciseName: 'Bicep Curl', setNumber: 1, weightKg: 14, reps: 10 },
      { id: 'ws-14', exerciseId: 'ex-8', exerciseName: 'Bicep Curl', setNumber: 2, weightKg: 14, reps: 9 }
    ]
  }
];

const INITIAL_PRS: PersonalRecord[] = [
  {
    id: 'pr-1',
    userId: 'user-demo',
    exerciseId: 'ex-1',
    exerciseName: 'Bench Press',
    maxWeightKg: 70,
    maxRepsAtWeight: 6,
    estimated1RM: 81.4,
    achievedAt: getPastDateStr(4),
    previousBestWeightKg: 65,
    previousBestReps: 8,
    totalSessions: 8,
    lastWorkoutDate: getPastDateStr(4)
  },
  {
    id: 'pr-2',
    userId: 'user-demo',
    exerciseId: 'ex-2',
    exerciseName: 'Squat',
    maxWeightKg: 105,
    maxRepsAtWeight: 5,
    estimated1RM: 118.1,
    achievedAt: getPastDateStr(10),
    previousBestWeightKg: 100,
    previousBestReps: 5,
    totalSessions: 7,
    lastWorkoutDate: getPastDateStr(6)
  },
  {
    id: 'pr-3',
    userId: 'user-demo',
    exerciseId: 'ex-3',
    exerciseName: 'Deadlift',
    maxWeightKg: 120,
    maxRepsAtWeight: 4,
    estimated1RM: 130.8,
    achievedAt: getPastDateStr(2),
    previousBestWeightKg: 110,
    previousBestReps: 5,
    totalSessions: 6,
    lastWorkoutDate: getPastDateStr(2)
  },
  {
    id: 'pr-4',
    userId: 'user-demo',
    exerciseId: 'ex-6',
    exerciseName: 'Shoulder Press',
    maxWeightKg: 42.5,
    maxRepsAtWeight: 8,
    estimated1RM: 52.7,
    achievedAt: getPastDateStr(4),
    previousBestWeightKg: 40,
    previousBestReps: 8,
    totalSessions: 5,
    lastWorkoutDate: getPastDateStr(4)
  }
];

const INITIAL_FOOD_LOGS: FoodLog[] = [
  {
    id: 'fl-1',
    userId: 'user-demo',
    date: TODAY,
    mealType: 'Breakfast',
    foodId: 'f-26',
    foodName: 'Rolled Oats (Dry)',
    quantity: 1.5,
    servingUnit: '40g scoop',
    calories: 232,
    protein: 8.2,
    carbs: 40.5,
    fat: 4.2,
    loggedAt: `${TODAY}T08:30:00.000Z`
  },
  {
    id: 'fl-2',
    userId: 'user-demo',
    date: TODAY,
    mealType: 'Breakfast',
    foodId: 'f-11',
    foodName: 'Whole Boiled Egg',
    quantity: 3,
    servingUnit: '1 egg (50g)',
    calories: 222,
    protein: 18.9,
    carbs: 1.2,
    fat: 15.0,
    loggedAt: `${TODAY}T08:35:00.000Z`
  },
  {
    id: 'fl-3',
    userId: 'user-demo',
    date: TODAY,
    mealType: 'Lunch',
    foodId: 'f-10',
    foodName: 'Chicken Breast (Grilled/Cooked)',
    quantity: 1.5,
    servingUnit: '100g',
    calories: 247,
    protein: 46.5,
    carbs: 0,
    fat: 5.4,
    loggedAt: `${TODAY}T13:15:00.000Z`
  },
  {
    id: 'fl-4',
    userId: 'user-demo',
    date: TODAY,
    mealType: 'Lunch',
    foodId: 'f-3',
    foodName: 'Boiled White Rice',
    quantity: 1.5,
    servingUnit: '1 bowl (150g)',
    calories: 292,
    protein: 6.1,
    carbs: 63.0,
    fat: 0.7,
    loggedAt: `${TODAY}T13:15:00.000Z`
  },
  {
    id: 'fl-5',
    userId: 'user-demo',
    date: TODAY,
    mealType: 'Lunch',
    foodId: 'f-5',
    foodName: 'Yellow Moong Dal Tadka',
    quantity: 1,
    servingUnit: '1 bowl (180g)',
    calories: 160,
    protein: 9.2,
    carbs: 23.0,
    fat: 3.5,
    loggedAt: `${TODAY}T13:15:00.000Z`
  },
  {
    id: 'fl-6',
    userId: 'user-demo',
    date: TODAY,
    mealType: 'Snacks',
    foodId: 'f-22',
    foodName: 'Banana (Ripe)',
    quantity: 1,
    servingUnit: '1 medium (120g)',
    calories: 105,
    protein: 1.3,
    carbs: 27.0,
    fat: 0.3,
    loggedAt: `${TODAY}T17:00:00.000Z`
  },
  {
    id: 'fl-7',
    userId: 'user-demo',
    date: TODAY,
    mealType: 'Snacks',
    foodId: 'f-27',
    foodName: 'Natural Peanut Butter',
    quantity: 1,
    servingUnit: '1 tbsp (32g)',
    calories: 190,
    protein: 8.0,
    carbs: 7.0,
    fat: 16.0,
    loggedAt: `${TODAY}T17:00:00.000Z`
  }
];

const INITIAL_METRICS: DailyMetric[] = [
  { id: 'm-1', userId: 'user-demo', date: getPastDateStr(6), weightKg: 75.2, waterIntakeMl: 3000 },
  { id: 'm-2', userId: 'user-demo', date: getPastDateStr(5), weightKg: 75.0, waterIntakeMl: 3200 },
  { id: 'm-3', userId: 'user-demo', date: getPastDateStr(4), weightKg: 74.8, waterIntakeMl: 3500 },
  { id: 'm-4', userId: 'user-demo', date: getPastDateStr(3), weightKg: 74.9, waterIntakeMl: 3100 },
  { id: 'm-5', userId: 'user-demo', date: getPastDateStr(2), weightKg: 74.6, waterIntakeMl: 3600 },
  { id: 'm-6', userId: 'user-demo', date: getPastDateStr(1), weightKg: 74.5, waterIntakeMl: 3400 },
  { id: 'm-7', userId: 'user-demo', date: TODAY, weightKg: 74.5, waterIntakeMl: 2200 }
];

const INITIAL_SUBSCRIPTION: SubscriptionInfo = {
  tier: 'PLAN_699',
  tierName: 'COMPLETE TRANSFORMATION',
  priceInr: 699,
  billingCycle: 'monthly',
  startDate: getPastDateStr(15),
  renewalDate: getPastDateStr(-15),
  status: 'active',
  features: [
    'Calorie tracker',
    'Indian food tracking',
    'Custom foods',
    'Workout logging',
    'Strength records & PRs',
    'Workout history',
    'Personalized daily calories & macros',
    'Personalized budget-friendly meal plans',
    'Personalized workout split (Push-Pull-Legs / Bro Split)',
    'Weekly progressive overload recommendations',
    'WhatsApp expert consultation'
  ]
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge starter foods with any custom foods created by user
        let loadedFoods = parsed.foods || [];
        if (loadedFoods.length < STARTER_FOODS.length) {
          const customFoods = loadedFoods.filter((f: Food) => f.isCustom);
          loadedFoods = [...STARTER_FOODS, ...customFoods];
        }

        let loadedExercises = parsed.exercises || [];
        // Ensure all starter exercises are present
        const existingNames = new Set(loadedExercises.map((e: Exercise) => e.name.toLowerCase()));
        for (const starter of INITIAL_EXERCISES) {
          if (!existingNames.has(starter.name.toLowerCase())) {
            loadedExercises.push(starter);
          }
        }

        return {
          users: parsed.users || [INITIAL_USER, INITIAL_ADMIN],
          profiles: parsed.profiles || { 'user-demo': INITIAL_PROFILE },
          foods: loadedFoods,
          foodLogs: parsed.foodLogs || INITIAL_FOOD_LOGS,
          favoriteFoods: parsed.favoriteFoods || { 'user-demo': ['im-1', 'im-8', 'dy-4', 'ch-2', 'pf-1'] },
          exercises: loadedExercises.length > 0 ? loadedExercises : INITIAL_EXERCISES,
          workouts: parsed.workouts || INITIAL_WORKOUTS,
          personalRecords: parsed.personalRecords || INITIAL_PRS,
          dailyMetrics: parsed.dailyMetrics || INITIAL_METRICS,
          subscriptions: parsed.subscriptions || { 'user-demo': INITIAL_SUBSCRIPTION },
          orders: parsed.orders || [],
          upiSubmissions: parsed.upiSubmissions || []
        };
      }
    } catch (e) {
      console.error('Error loading DB file, fallback to initial state:', e);
    }

    const initData: DatabaseSchema = {
      users: [INITIAL_USER, INITIAL_ADMIN],
      profiles: { 'user-demo': INITIAL_PROFILE },
      foods: INITIAL_FOODS,
      foodLogs: INITIAL_FOOD_LOGS,
      favoriteFoods: { 'user-demo': ['im-1', 'im-8', 'dy-4', 'ch-2', 'pf-1'] },
      exercises: INITIAL_EXERCISES,
      workouts: INITIAL_WORKOUTS,
      personalRecords: INITIAL_PRS,
      dailyMetrics: INITIAL_METRICS,
      subscriptions: { 'user-demo': INITIAL_SUBSCRIPTION },
      orders: [],
      upiSubmissions: []
    };
    this.save(initData);
    return initData;
  }

  private save(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db.json:', e);
    }
  }

  public flush() {
    this.save(this.data);
  }

  // --- Users & Profiles ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: User, profile?: Partial<UserProfile>): { user: User; profile: UserProfile } {
    this.data.users.push(user);

    const fullProfile = this.calculateAndSetProfile(user.id, {
      name: user.name,
      age: 25,
      gender: 'Male',
      heightCm: 175,
      weightKg: 70,
      fitnessGoal: 'Build Muscle',
      activityLevel: 'Moderately Active',
      dietPreference: 'Vegetarian',
      foodBudget: 'Moderate',
      ...profile
    });

    this.data.subscriptions[user.id] = {
      tier: 'FREE',
      tierName: 'FREE PLAN',
      priceInr: 0,
      billingCycle: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      renewalDate: 'Never',
      status: 'active',
      features: [
        'Calorie tracker',
        'Indian food tracking',
        'Food logging',
        'Custom foods',
        'Workout logging',
        'Strength records',
        'Personal records',
        'Workout history',
        'Progress tracking',
        'WhatsApp expert contact'
      ]
    };

    this.flush();
    return { user, profile: fullProfile };
  }

  public getProfile(userId: string): UserProfile {
    if (!this.data.profiles[userId]) {
      this.data.profiles[userId] = {
        id: `prof-${userId}`,
        userId,
        name: 'Athlete',
        age: 25,
        gender: 'Male',
        heightCm: 175,
        weightKg: 70,
        fitnessGoal: 'Build Muscle',
        activityLevel: 'Moderately Active',
        dietPreference: 'Vegetarian',
        foodBudget: 'Moderate',
        targetCalories: 2300,
        targetProtein: 140,
        targetCarbs: 260,
        targetFat: 65,
        waterTargetMl: 3000,
        updatedAt: new Date().toISOString()
      };
      this.flush();
    }
    return this.data.profiles[userId];
  }

  public updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const existing = this.getProfile(userId);
    const merged = { ...existing, ...updates };
    return this.calculateAndSetProfile(userId, merged);
  }

  public calculateAndSetProfile(userId: string, input: Partial<UserProfile>): UserProfile {
    const age = input.age || 25;
    const gender = input.gender || 'Male';
    const height = input.heightCm || 175;
    const weight = input.weightKg || 70;
    const goal = input.fitnessGoal || 'Build Muscle';
    const activity = input.activityLevel || 'Moderately Active';
    const diet = input.dietPreference || 'Vegetarian';
    const budget = input.foodBudget || 'Moderate';

    // Mifflin-St Jeor BMR Equation
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === 'Male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const activityMultipliers: Record<string, number> = {
      'Sedentary': 1.2,
      'Lightly Active': 1.375,
      'Moderately Active': 1.55,
      'Very Active': 1.725,
      'Extra Active': 1.9
    };
    const tdee = Math.round(bmr * (activityMultipliers[activity] || 1.55));

    let targetCalories = tdee;
    if (goal === 'Lose Fat') targetCalories = Math.max(1200, Math.round(tdee - 450));
    else if (goal === 'Build Muscle') targetCalories = Math.round(tdee + 300);
    else if (goal === 'Improve Strength') targetCalories = Math.round(tdee + 200);

    // Protein: 1.8g to 2.2g per kg bodyweight
    const proteinFactor = goal === 'Build Muscle' || goal === 'Improve Strength' ? 2.2 : goal === 'Lose Fat' ? 2.0 : 1.8;
    const targetProtein = Math.round(weight * proteinFactor);

    // Fats: 25% of calories
    const targetFat = Math.round((targetCalories * 0.25) / 9);

    // Carbs: Remainder calories / 4
    const remainingCaloriesForCarbs = Math.max(0, targetCalories - (targetProtein * 4) - (targetFat * 9));
    const targetCarbs = Math.round(remainingCaloriesForCarbs / 4);

    const waterTargetMl = Math.round(weight * 40); // 40ml per kg

    const profile: UserProfile = {
      id: `prof-${userId}`,
      userId,
      name: input.name || 'Athlete',
      age,
      gender,
      heightCm: height,
      weightKg: weight,
      fitnessGoal: goal,
      activityLevel: activity,
      dietPreference: diet,
      foodBudget: budget,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      waterTargetMl,
      updatedAt: new Date().toISOString()
    };

    this.data.profiles[userId] = profile;
    this.flush();
    return profile;
  }

  // --- Foods & Food Logs ---
  public getFoods(): Food[] {
    return this.data.foods;
  }

  public addFood(food: Omit<Food, 'id'>): Food {
    const newFood: Food = {
      ...food,
      id: `f-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      isCustom: true
    };
    this.data.foods.push(newFood);
    this.flush();
    return newFood;
  }

  public deleteFood(id: string, userId: string, isAdmin = false): boolean {
    const idx = this.data.foods.findIndex(f => f.id === id);
    if (idx !== -1) {
      const food = this.data.foods[idx];
      if (isAdmin || (food.isCustom && food.createdBy === userId)) {
        this.data.foods.splice(idx, 1);
        this.flush();
        return true;
      }
    }
    return false;
  }

  public getFoodLogs(userId: string, date?: string): FoodLog[] {
    return this.data.foodLogs.filter(fl => fl.userId === userId && (!date || fl.date === date));
  }

  public addFoodLog(log: Omit<FoodLog, 'id' | 'loggedAt'>): FoodLog {
    const newLog: FoodLog = {
      ...log,
      id: `fl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      loggedAt: new Date().toISOString()
    };
    this.data.foodLogs.push(newLog);
    this.flush();
    return newLog;
  }

  public updateFoodLog(id: string, userId: string, updates: Partial<FoodLog>): FoodLog | null {
    const idx = this.data.foodLogs.findIndex(fl => fl.id === id && fl.userId === userId);
    if (idx !== -1) {
      this.data.foodLogs[idx] = {
        ...this.data.foodLogs[idx],
        ...updates
      };
      this.flush();
      return this.data.foodLogs[idx];
    }
    return null;
  }

  public deleteFoodLog(id: string, userId: string): boolean {
    const idx = this.data.foodLogs.findIndex(fl => fl.id === id && fl.userId === userId);
    if (idx !== -1) {
      this.data.foodLogs.splice(idx, 1);
      this.flush();
      return true;
    }
    return false;
  }

  public getFavoriteFoodIds(userId: string): string[] {
    if (!this.data.favoriteFoods) {
      this.data.favoriteFoods = {};
    }
    return this.data.favoriteFoods[userId] || [];
  }

  public toggleFavoriteFood(userId: string, foodId: string): boolean {
    if (!this.data.favoriteFoods) {
      this.data.favoriteFoods = {};
    }
    if (!this.data.favoriteFoods[userId]) {
      this.data.favoriteFoods[userId] = [];
    }

    const list = this.data.favoriteFoods[userId];
    const existsIndex = list.indexOf(foodId);
    let isNowFavorite = false;
    if (existsIndex !== -1) {
      list.splice(existsIndex, 1);
      isNowFavorite = false;
    } else {
      list.push(foodId);
      isNowFavorite = true;
    }
    this.flush();
    return isNowFavorite;
  }

  public getRecentFoods(userId: string, limit = 12): Food[] {
    const userLogs = this.data.foodLogs
      .filter(fl => fl.userId === userId)
      .sort((a, b) => new Date(b.loggedAt || b.date).getTime() - new Date(a.loggedAt || a.date).getTime());

    const seenFoodIds = new Set<string>();
    const recentFoods: Food[] = [];

    for (const log of userLogs) {
      if (!seenFoodIds.has(log.foodId)) {
        seenFoodIds.add(log.foodId);
        const food = this.data.foods.find(f => f.id === log.foodId);
        if (food) {
          recentFoods.push(food);
        }
      }
      if (recentFoods.length >= limit) break;
    }

    return recentFoods;
  }

  // --- Exercises & Workouts ---
  public getExercises(): Exercise[] {
    return this.data.exercises;
  }

  public addExercise(exercise: Omit<Exercise, 'id'>): Exercise {
    const newEx: Exercise = {
      ...exercise,
      id: `ex-${Date.now()}`
    };
    this.data.exercises.push(newEx);
    this.flush();
    return newEx;
  }

  public deleteExercise(id: string): boolean {
    const idx = this.data.exercises.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.data.exercises.splice(idx, 1);
      this.flush();
      return true;
    }
    return false;
  }

  public getWorkouts(userId: string): Workout[] {
    return this.data.workouts
      .filter(w => w.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getWorkoutById(id: string, userId: string): Workout | undefined {
    return this.data.workouts.find(w => w.id === id && w.userId === userId);
  }

  public logWorkout(userId: string, workoutData: Omit<Workout, 'id' | 'userId' | 'prsAchieved' | 'totalVolumeKg'>): { workout: Workout; newPRs: PersonalRecord[] } {
    let totalVolumeKg = 0;
    const newPRs: PersonalRecord[] = [];
    const prsAchievedNames: string[] = [];

    // Calculate volume & check PRs
    const sets = workoutData.sets.map((s, idx) => {
      const vol = (s.weightKg || 0) * (s.reps || 0);
      totalVolumeKg += vol;
      return {
        ...s,
        id: s.id || `ws-${Date.now()}-${idx}`,
        setNumber: s.setNumber || idx + 1
      };
    });

    // Check PR detection for each exercise
    const exerciseSetsMap: Record<string, { exerciseName: string; sets: typeof sets }> = {};
    for (const s of sets) {
      if (!exerciseSetsMap[s.exerciseId]) {
        exerciseSetsMap[s.exerciseId] = { exerciseName: s.exerciseName, sets: [] };
      }
      exerciseSetsMap[s.exerciseId].sets.push(s);
    }

    for (const [exId, data] of Object.entries(exerciseSetsMap)) {
      let maxSetWeight = 0;
      let maxSetReps = 0;

      for (const s of data.sets) {
        if (s.weightKg > maxSetWeight || (s.weightKg === maxSetWeight && s.reps > maxSetReps)) {
          maxSetWeight = s.weightKg;
          maxSetReps = s.reps;
        }
      }

      if (maxSetWeight > 0) {
        // Brzycki 1RM formula: Weight * (36 / (37 - Reps))
        const estimated1RM = Math.round((maxSetWeight * (36 / Math.max(1, 37 - Math.min(30, maxSetReps)))) * 10) / 10;
        
        const existingPRIdx = this.data.personalRecords.findIndex(pr => pr.userId === userId && pr.exerciseId === exId);
        if (existingPRIdx !== -1) {
          const currentPR = this.data.personalRecords[existingPRIdx];
          const isBetterWeight = maxSetWeight > currentPR.maxWeightKg;
          const isBetterRepsAtSameWeight = maxSetWeight === currentPR.maxWeightKg && maxSetReps > currentPR.maxRepsAtWeight;

          if (isBetterWeight || isBetterRepsAtSameWeight) {
            const updatedPR: PersonalRecord = {
              ...currentPR,
              previousBestWeightKg: currentPR.maxWeightKg,
              previousBestReps: currentPR.maxRepsAtWeight,
              maxWeightKg: maxSetWeight,
              maxRepsAtWeight: maxSetReps,
              estimated1RM,
              achievedAt: workoutData.date,
              totalSessions: currentPR.totalSessions + 1,
              lastWorkoutDate: workoutData.date
            };
            this.data.personalRecords[existingPRIdx] = updatedPR;
            newPRs.push(updatedPR);
            prsAchievedNames.push(data.exerciseName);
          } else {
            this.data.personalRecords[existingPRIdx].totalSessions += 1;
            this.data.personalRecords[existingPRIdx].lastWorkoutDate = workoutData.date;
          }
        } else {
          // First time benchmark
          const firstPR: PersonalRecord = {
            id: `pr-${Date.now()}-${exId}`,
            userId,
            exerciseId: exId,
            exerciseName: data.exerciseName,
            maxWeightKg: maxSetWeight,
            maxRepsAtWeight: maxSetReps,
            estimated1RM,
            achievedAt: workoutData.date,
            totalSessions: 1,
            lastWorkoutDate: workoutData.date
          };
          this.data.personalRecords.push(firstPR);
          newPRs.push(firstPR);
          prsAchievedNames.push(data.exerciseName);
        }
      }
    }

    const newWorkout: Workout = {
      ...workoutData,
      id: `w-${Date.now()}`,
      userId,
      totalVolumeKg,
      sets,
      prsAchieved: prsAchievedNames
    };

    this.data.workouts.unshift(newWorkout);
    this.flush();
    return { workout: newWorkout, newPRs };
  }

  public deleteWorkout(id: string, userId: string): boolean {
    const idx = this.data.workouts.findIndex(w => w.id === id && w.userId === userId);
    if (idx !== -1) {
      this.data.workouts.splice(idx, 1);
      this.flush();
      return true;
    }
    return false;
  }

  // --- Strength Records & Charts ---
  public getPersonalRecords(userId: string): PersonalRecord[] {
    return this.data.personalRecords.filter(pr => pr.userId === userId);
  }

  public savePersonalRecord(userId: string, input: {
    id?: string;
    exerciseId?: string;
    exerciseName: string;
    category?: MuscleGroup;
    maxWeightKg: number;
    maxRepsAtWeight: number;
    achievedAt?: string;
  }): { record: PersonalRecord; isNewExercise: boolean; isNewRecord: boolean } {
    const weight = Number(input.maxWeightKg) || 0;
    const reps = Math.max(1, Number(input.maxRepsAtWeight) || 1);
    const dateStr = input.achievedAt || new Date().toISOString().split('T')[0];
    
    // Brzycki 1RM formula: Weight * (36 / (37 - Reps))
    const estimated1RM = Math.round((weight * (36 / Math.max(1, 37 - Math.min(30, reps)))) * 10) / 10;

    let exId = input.exerciseId;
    let isNewExercise = false;

    // Check or create exercise definition
    if (exId) {
      const existingEx = this.data.exercises.find(e => e.id === exId);
      if (!existingEx) {
        exId = undefined;
      }
    }

    if (!exId) {
      const nameMatch = this.data.exercises.find(
        e => e.name.toLowerCase() === input.exerciseName.trim().toLowerCase()
      );
      if (nameMatch) {
        exId = nameMatch.id;
      } else {
        // Create new exercise in registry
        const newEx: Exercise = {
          id: `ex-${Date.now()}`,
          name: input.exerciseName.trim(),
          category: input.category || 'Chest',
          equipment: 'Barbell',
          primaryMuscle: input.category || 'Compound',
          instructions: 'Perform with controlled eccentric cadence and full range of motion.',
          isCustom: true,
          createdBy: userId
        };
        this.data.exercises.push(newEx);
        exId = newEx.id;
        isNewExercise = true;
      }
    }

    const matchedEx = this.data.exercises.find(e => e.id === exId);
    const exName = matchedEx ? matchedEx.name : input.exerciseName.trim();

    // Check existing PR for this user + exercise
    const existingIndex = this.data.personalRecords.findIndex(
      p => p.userId === userId && (p.id === input.id || p.exerciseId === exId)
    );

    let resultRecord: PersonalRecord;
    let isNewRecord = false;

    if (existingIndex !== -1) {
      const existing = this.data.personalRecords[existingIndex];
      const previousBestWeight = existing.maxWeightKg;
      const previousBestReps = existing.maxRepsAtWeight;

      resultRecord = {
        ...existing,
        exerciseId: exId!,
        exerciseName: exName,
        maxWeightKg: weight,
        maxRepsAtWeight: reps,
        estimated1RM,
        achievedAt: dateStr,
        previousBestWeightKg: previousBestWeight !== weight ? previousBestWeight : existing.previousBestWeightKg,
        previousBestReps: previousBestWeight !== weight ? previousBestReps : existing.previousBestReps,
        lastWorkoutDate: dateStr,
        totalSessions: (existing.totalSessions || 1) + 1
      };
      this.data.personalRecords[existingIndex] = resultRecord;
    } else {
      resultRecord = {
        id: input.id || `pr-${Date.now()}-${exId}`,
        userId,
        exerciseId: exId!,
        exerciseName: exName,
        maxWeightKg: weight,
        maxRepsAtWeight: reps,
        estimated1RM,
        achievedAt: dateStr,
        totalSessions: 1,
        lastWorkoutDate: dateStr
      };
      this.data.personalRecords.push(resultRecord);
      isNewRecord = true;
    }

    this.flush();
    return { record: resultRecord, isNewExercise, isNewRecord };
  }

  public deletePersonalRecord(userId: string, id: string): boolean {
    const idx = this.data.personalRecords.findIndex(p => p.id === id && p.userId === userId);
    if (idx !== -1) {
      this.data.personalRecords.splice(idx, 1);
      this.flush();
      return true;
    }
    return false;
  }

  public getStrengthProgression(userId: string, exerciseId: string, timeRange: '7d' | '30d' | '3m' | '6m' | 'all') {
    const userWorkouts = this.getWorkouts(userId);
    let cutoff = new Date(0);
    const now = new Date();

    if (timeRange === '7d') cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (timeRange === '30d') cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (timeRange === '3m') cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    else if (timeRange === '6m') cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const historyPoints: { date: string; weightKg: number; reps: number; volumeKg: number; estimated1RM: number }[] = [];

    for (const w of userWorkouts) {
      const wDate = new Date(w.date);
      if (wDate >= cutoff) {
        const relevantSets = w.sets.filter(s => s.exerciseId === exerciseId);
        if (relevantSets.length > 0) {
          let topWeight = 0;
          let topReps = 0;
          let totalVol = 0;
          for (const s of relevantSets) {
            totalVol += (s.weightKg * s.reps);
            if (s.weightKg > topWeight || (s.weightKg === topWeight && s.reps > topReps)) {
              topWeight = s.weightKg;
              topReps = s.reps;
            }
          }
          const e1RM = Math.round((topWeight * (36 / Math.max(1, 37 - Math.min(30, topReps)))) * 10) / 10;
          historyPoints.push({
            date: w.date,
            weightKg: topWeight,
            reps: topReps,
            volumeKg: totalVol,
            estimated1RM: e1RM
          });
        }
      }
    }

    return historyPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public getWorkoutStats(userId: string) {
    const workouts = this.getWorkouts(userId);
    const prs = this.getPersonalRecords(userId);
    const totalWorkouts = workouts.length;
    let totalSets = 0;
    let totalVolumeKg = 0;
    const exerciseSetCounts: Record<string, number> = {};

    for (const w of workouts) {
      totalVolumeKg += (w.totalVolumeKg || 0);
      for (const s of w.sets) {
        totalSets++;
        exerciseSetCounts[s.exerciseName] = (exerciseSetCounts[s.exerciseName] || 0) + 1;
      }
    }

    let mostTrainedExercise = 'Bench Press';
    let maxCount = 0;
    for (const [exName, count] of Object.entries(exerciseSetCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostTrainedExercise = exName;
      }
    }

    // Calculate workout streak (active days or consecutive workout days/weeks)
    const workoutDates = Array.from(new Set(workouts.map(w => w.date))).sort().reverse();
    let streak = 0;
    if (workoutDates.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // If trained today or yesterday, streak continues
      if (workoutDates[0] === todayStr || workoutDates[0] === yesterdayStr) {
        streak = 1;
        let lastDate = new Date(workoutDates[0]);
        for (let i = 1; i < workoutDates.length; i++) {
          const prevDate = new Date(workoutDates[i]);
          const diffDays = Math.round((lastDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays <= 2) { // Workout within 2 days counts towards workout rhythm
            streak++;
            lastDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayWorkout = workouts.find(w => w.date === todayStr);

    const sortedPRs = [...prs].sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime());
    const latestPR = sortedPRs[0] || null;

    return {
      totalWorkouts,
      workoutStreak: Math.max(streak, totalWorkouts > 0 ? 3 : 0), // fallback minimum active streak for demo if workouts exist
      totalSets,
      totalPRs: prs.length,
      mostTrainedExercise,
      totalVolumeKg,
      todayWorkout: todayWorkout || null,
      latestPR
    };
  }

  // --- Progressive Overload Engine (Plan ₹699) ---
  public getProgressiveOverloadRecommendations(userId: string): ProgressiveOverloadRecommendation[] {
    const workouts = this.getWorkouts(userId);
    const exercises = this.getExercises();
    const recommendations: ProgressiveOverloadRecommendation[] = [];

    for (const ex of exercises) {
      // Find the most recent workout where this exercise was performed
      let lastWorkoutDate = '';
      let topSet: { weightKg: number; reps: number } | null = null;
      let sessionCount = 0;

      for (const w of workouts) {
        const matchingSets = w.sets.filter(s => s.exerciseId === ex.id);
        if (matchingSets.length > 0) {
          sessionCount++;
          if (!topSet) {
            lastWorkoutDate = w.date;
            // Get best working set
            for (const s of matchingSets) {
              if (!topSet || s.weightKg > topSet.weightKg || (s.weightKg === topSet.weightKg && s.reps > topSet.reps)) {
                topSet = { weightKg: s.weightKg, reps: s.reps };
              }
            }
          }
        }
      }

      if (topSet) {
        // Target rep range heuristic: compound vs isolation
        const isCompound = ['Bench Press', 'Squat', 'Deadlift', 'Barbell Row', 'Shoulder Press', 'Leg Press'].includes(ex.name);
        const targetRepTop = isCompound ? 8 : 12;
        const targetRepBottom = isCompound ? 6 : 8;

        let status: 'increase_reps' | 'increase_weight' | 'maintain_refine' = 'increase_reps';
        let recommendedWeightKg = topSet.weightKg;
        let recommendedReps = `${topSet.reps + 1}-${topSet.reps + 2}`;
        let reasoning = '';

        if (topSet.reps >= targetRepTop) {
          // Success hitting upper rep threshold! Overload weight
          status = 'increase_weight';
          const increment = isCompound ? (topSet.weightKg >= 80 ? 5 : 2.5) : 2;
          recommendedWeightKg = topSet.weightKg + increment;
          recommendedReps = `${targetRepBottom} reps`;
          reasoning = `You crushed ${topSet.weightKg}kg for ${topSet.reps} reps (hit your upper target of ${targetRepTop}). Increase weight to ${recommendedWeightKg}kg and target ${targetRepBottom} pristine reps.`;
        } else if (topSet.reps < targetRepBottom) {
          // Performance dipped or too heavy
          status = 'maintain_refine';
          recommendedWeightKg = topSet.weightKg;
          recommendedReps = `${targetRepBottom} reps`;
          reasoning = `You logged ${topSet.weightKg}kg for ${topSet.reps} reps. Maintain ${topSet.weightKg}kg to consolidate strict form and hit at least ${targetRepBottom} reps before adding load.`;
        } else {
          // In the working zone: progress reps first (Double Progression Model)
          status = 'increase_reps';
          recommendedWeightKg = topSet.weightKg;
          const nextRepTarget = Math.min(targetRepTop, topSet.reps + 1);
          recommendedReps = `${nextRepTarget} reps`;
          reasoning = `Previous session: ${topSet.weightKg}kg × ${topSet.reps} reps. Keep weight at ${topSet.weightKg}kg and aim for ${nextRepTarget} controlled reps today.`;
        }

        recommendations.push({
          exerciseId: ex.id,
          exerciseName: ex.name,
          previousWeightKg: topSet.weightKg,
          previousReps: topSet.reps,
          targetRepRange: `${targetRepBottom}-${targetRepTop}`,
          recommendedWeightKg,
          recommendedReps,
          status,
          reasoning,
          lastWorkoutDate
        });
      }
    }

    return recommendations;
  }

  // --- Personalized Meal Plan Engine (Plan ₹299+) ---
  public getPersonalizedMealPlan(userId: string): DailyMealPlan {
    const profile = this.getProfile(userId);
    const pref = profile.dietPreference || 'Vegetarian';
    const budget = profile.foodBudget || 'Moderate';
    const totalCals = profile.targetCalories || 2300;
    const proteinTarget = profile.targetProtein || 140;

    // Build tailored Indian meals
    let breakfastItems = [];
    let lunchItems = [];
    let snackItems = [];
    let dinnerItems = [];

    if (pref === 'Non-Vegetarian') {
      breakfastItems = [
        { name: 'Whole Boiled Eggs (3) + 2 Egg Whites', portion: '5 eggs total', calories: 256, protein: 26, carbs: 1.5, fat: 15, costInr: 35, prepTip: 'Boil for 8 mins, season with black pepper & rock salt.' },
        { name: 'Rolled Oats with Cinnamon & Milk', portion: '50g oats + 200ml milk', calories: 310, protein: 13, carbs: 45, fat: 8, costInr: 25, prepTip: 'Cook in low flame for 4 minutes.' }
      ];
      lunchItems = [
        { name: 'Grilled Chicken Breast Breast Fillet', portion: '150g cooked', calories: 248, protein: 46, carbs: 0, fat: 5.5, costInr: 70, prepTip: 'Marinate in curd, ginger-garlic, turmeric, and roast on pan.' },
        { name: 'Steamed Rice / Roti', portion: '2 Rotis or 1.5 Bowl Rice', calories: 210, protein: 6, carbs: 44, fat: 1.5, costInr: 15 },
        { name: 'Fresh Cucumber Salad & Curd', portion: '1 bowl', calories: 95, protein: 5, carbs: 8, fat: 4, costInr: 18 }
      ];
      snackItems = [
        { name: 'Sprouted Moong Chaat / Peanut Butter Toast', portion: '1 bowl / 2 slices', calories: 240, protein: 12, carbs: 32, fat: 8, costInr: 20 },
        { name: 'Black Coffee or Green Tea', portion: '1 cup', calories: 5, protein: 0.5, carbs: 0.5, fat: 0, costInr: 5 }
      ];
      dinnerItems = [
        { name: 'Chicken Curry or Egg Curry (Light Ghee)', portion: '1 bowl (120g chicken/3 eggs)', calories: 260, protein: 32, carbs: 8, fat: 10, costInr: 60 },
        { name: 'Whole Wheat Roti', portion: '2 rotis', calories: 208, protein: 7, carbs: 40, fat: 1.6, costInr: 10 },
        { name: 'Yellow Dal / Sambar', portion: '1 small bowl', calories: 120, protein: 7, carbs: 18, fat: 2.5, costInr: 15 }
      ];
    } else if (pref === 'Eggitarian') {
      breakfastItems = [
        { name: 'Masala Scrambled Eggs (Bhurji - 3 eggs)', portion: '3 eggs + onion, tomato, chilies', calories: 250, protein: 20, carbs: 4, fat: 16, costInr: 25 },
        { name: 'Whole Wheat Toast / Chapati', portion: '2 pieces', calories: 180, protein: 6, carbs: 34, fat: 1.5, costInr: 12 }
      ];
      lunchItems = [
        { name: 'Rajma / Chole Curry', portion: '1 large bowl (250g)', calories: 280, protein: 15, carbs: 40, fat: 6, costInr: 30 },
        { name: 'Jeera Rice / Roti', portion: '1 bowl', calories: 200, protein: 4.5, carbs: 42, fat: 1, costInr: 12 },
        { name: 'Paneer Cubes (Light Sauteed)', portion: '60g', calories: 160, protein: 11, carbs: 2, fat: 12, costInr: 25 }
      ];
      snackItems = [
        { name: 'Boiled Egg Whites (4) with Chaat Masala', portion: '4 whites', calories: 68, protein: 14.5, carbs: 0.8, fat: 0.4, costInr: 24 },
        { name: 'Roasted Chana (Bengal Gram)', portion: '40g', calories: 150, protein: 8, carbs: 22, fat: 2.5, costInr: 10 }
      ];
      dinnerItems = [
        { name: 'Egg Curry (2 Whole Eggs + 2 Whites)', portion: '1 bowl', calories: 230, protein: 22, carbs: 6, fat: 12, costInr: 28 },
        { name: 'Whole Wheat Phulka', portion: '2 rotis', calories: 208, protein: 7, carbs: 40, fat: 1.6, costInr: 10 },
        { name: 'Mixed Veggie Stir Fry', portion: '1 bowl', calories: 90, protein: 3, carbs: 12, fat: 3, costInr: 15 }
      ];
    } else {
      // Vegetarian (Paneer, Soya, Dals, Sprouts, Curd, Oats)
      breakfastItems = [
        { name: 'Paneer & Besan Cheela (Pancakes)', portion: '2 cheelas with 75g paneer', calories: 340, protein: 22, carbs: 28, fat: 16, costInr: 35, prepTip: 'Grind oats & besan, fold in crumbled paneer & green chilies.' },
        { name: 'Curd / Buttermilk (Chaas)', portion: '1 glass (200ml)', calories: 90, protein: 6, carbs: 8, fat: 3.5, costInr: 12 }
      ];
      lunchItems = [
        { name: 'Soya Chunks Curry (Nutrela)', portion: '50g dry chunks cooked in tomato gravy', calories: 210, protein: 28, carbs: 18, fat: 2.5, costInr: 15, prepTip: 'Boil chunks for 5 mins, squeeze water thoroughly, cook in spices.' },
        { name: 'Brown Rice / Roti', portion: '2 rotis or 1.5 bowl rice', calories: 210, protein: 7, carbs: 42, fat: 1.5, costInr: 12 },
        { name: 'Thick Moong/Arhar Dal', portion: '1 bowl', calories: 150, protein: 9, carbs: 22, fat: 3, costInr: 14 }
      ];
      snackItems = [
        { name: 'Roasted Peanuts & Roasted Chana Mix', portion: '45g mix', calories: 215, protein: 11, carbs: 18, fat: 11, costInr: 12 },
        { name: 'Fresh Seasonal Fruit (Apple or Banana)', portion: '1 piece', calories: 95, protein: 1, carbs: 24, fat: 0.2, costInr: 15 }
      ];
      dinnerItems = [
        { name: 'Paneer Bhurji / Low-fat Tofu Gravy', portion: '120g paneer/tofu', calories: 290, protein: 22, carbs: 6, fat: 20, costInr: 45 },
        { name: 'Whole Wheat Chapati', portion: '2 rotis', calories: 208, protein: 7, carbs: 40, fat: 1.6, costInr: 10 },
        { name: 'Palak / Veggie Soup', portion: '1 bowl', calories: 75, protein: 3, carbs: 9, fat: 2, costInr: 15 }
      ];
    }

    const calcMealTotals = (items: typeof breakfastItems) => ({
      totalCalories: items.reduce((sum, i) => sum + i.calories, 0),
      totalProtein: items.reduce((sum, i) => sum + i.protein, 0)
    });

    return {
      dietPreference: pref,
      budget,
      targetCalories: totalCals,
      targetProtein: proteinTarget,
      targetCarbs: profile.targetCarbs || 260,
      targetFat: profile.targetFat || 65,
      meals: [
        { mealType: 'Breakfast', title: 'Power Breakfast', items: breakfastItems, ...calcMealTotals(breakfastItems) },
        { mealType: 'Lunch', title: 'Anabolic High-Protein Lunch', items: lunchItems, ...calcMealTotals(lunchItems) },
        { mealType: 'Snacks', title: 'Pre-Workout & Sustained Fuel', items: snackItems, ...calcMealTotals(snackItems) },
        { mealType: 'Dinner', title: 'Muscle Recovery Dinner', items: dinnerItems, ...calcMealTotals(dinnerItems) }
      ],
      expertNutritionTips: [
        'Distribute protein evenly across 3-4 meals to maximize Muscle Protein Synthesis (MPS).',
        'Consume at least 3.5 liters of filtered water daily for intracellular hydration and strength output.',
        'Keep sodium consistent and prioritize whole, unrefined complex carbohydrates around training times.',
        `Tailored specifically for ${pref} diet and ₹${budget} budget bracket.`
      ]
    };
  }

  // --- Personalized Workout Split Engine (Plan ₹449+) ---
  public getPersonalizedWorkoutPlan(userId: string, splitType?: 'Full Body' | 'Upper / Lower' | 'Push Pull Legs' | 'Bro Split'): WorkoutSplitPlan {
    const profile = this.getProfile(userId);
    const chosenSplit = splitType || (profile.fitnessGoal === 'Build Muscle' ? 'Push Pull Legs' : 'Upper / Lower');

    if (chosenSplit === 'Push Pull Legs') {
      return {
        split: 'Push Pull Legs',
        daysPerWeek: 5,
        goal: profile.fitnessGoal,
        experience: 'Intermediate',
        equipment: 'Commercial Gym',
        days: [
          {
            dayName: 'Day 1 — Push (Chest, Front Delts, Triceps)',
            focus: 'Hypertrophy & Horizontal Press Strength',
            exercises: [
              { exerciseName: 'Bench Press', category: 'Chest', sets: 4, repRange: '6-8 reps', restSec: 150, instructions: 'Arch upper back, lock shoulder blades, control eccentric descent.' },
              { exerciseName: 'Shoulder Press', category: 'Shoulders', sets: 3, repRange: '8-10 reps', restSec: 120, instructions: 'Brace abdominal wall, press straight overhead.' },
              { exerciseName: 'Dumbbell Press', category: 'Chest', sets: 3, repRange: '10-12 reps', restSec: 90, instructions: 'Deep stretch at the bottom, squeeze chest at peak.' },
              { exerciseName: 'Lateral Raise', category: 'Shoulders', sets: 4, repRange: '12-15 reps', restSec: 60, instructions: 'Lead with elbows, controlled tempo, no momentum.' },
              { exerciseName: 'Tricep Pushdown', category: 'Arms', sets: 3, repRange: '10-12 reps', restSec: 60, instructions: 'Keep elbows tucked tightly by side, flex hard at extension.' }
            ]
          },
          {
            dayName: 'Day 2 — Pull (Lats, Upper Back, Rear Delts, Biceps)',
            focus: 'Vertical & Horizontal Back Thickness',
            exercises: [
              { exerciseName: 'Deadlift', category: 'Back', sets: 3, repRange: '4-6 reps', restSec: 180, instructions: 'Drive floor away, lock glutes and lats firmly at top.' },
              { exerciseName: 'Lat Pulldown', category: 'Back', sets: 4, repRange: '8-10 reps', restSec: 90, instructions: 'Drive elbows down to waist pockets, arch chest towards bar.' },
              { exerciseName: 'Barbell Row', category: 'Back', sets: 3, repRange: '8-10 reps', restSec: 90, instructions: 'Hinge at 45 degrees, row bar into navel.' },
              { exerciseName: 'Bicep Curl', category: 'Arms', sets: 3, repRange: '10-12 reps', restSec: 60, instructions: 'Full supination at top, 2 second slow negative.' }
            ]
          },
          {
            dayName: 'Day 3 — Legs & Abs (Quads, Hamstrings, Calves)',
            focus: 'Quad Overload & Posterior Chain Balance',
            exercises: [
              { exerciseName: 'Squat', category: 'Legs', sets: 4, repRange: '6-8 reps', restSec: 180, instructions: 'Brace core with 360 breathing, hit parallel depth smoothly.' },
              { exerciseName: 'Leg Press', category: 'Legs', sets: 3, repRange: '10-12 reps', restSec: 120, instructions: 'Keep lower back glued to pad, don’t lock knees violently.' },
              { exerciseName: 'Leg Curl', category: 'Legs', sets: 3, repRange: '10-12 reps', restSec: 75, instructions: 'Controlled eccentric, squeeze hamstrings at peak bend.' },
              { exerciseName: 'Leg Extension', category: 'Legs', sets: 3, repRange: '12-15 reps', restSec: 60, instructions: 'Pause 1 second at top extension for maximum quad pump.' }
            ]
          },
          {
            dayName: 'Day 4 — Rest / Active Recovery',
            focus: 'Mobility, 8k Steps, Hydration & Tissue Repair',
            exercises: []
          },
          {
            dayName: 'Day 5 — Upper Power & Weak Points',
            focus: 'Shoulders, Upper Chest & Arm Density',
            exercises: [
              { exerciseName: 'Dumbbell Press', category: 'Chest', sets: 4, repRange: '8-10 reps', restSec: 120, instructions: 'Slight 30-degree incline for clavicular upper pec emphasis.' },
              { exerciseName: 'Lat Pulldown', category: 'Back', sets: 3, repRange: '10-12 reps', restSec: 90, instructions: 'Neutral grip attachment for deep lat stretch.' },
              { exerciseName: 'Lateral Raise', category: 'Shoulders', sets: 4, repRange: '15 reps', restSec: 45, instructions: 'Constant tension without dropping at bottom.' },
              { exerciseName: 'Bicep Curl', category: 'Arms', sets: 3, repRange: '10 reps', restSec: 60, instructions: 'Strict form against wall or preacher bench.' },
              { exerciseName: 'Tricep Pushdown', category: 'Arms', sets: 3, repRange: '12 reps', restSec: 60, instructions: 'Overhead or rope extension for long head tricep.' }
            ]
          }
        ]
      };
    }

    if (chosenSplit === 'Bro Split') {
      return {
        split: 'Bro Split',
        daysPerWeek: 5,
        goal: profile.fitnessGoal,
        experience: 'Intermediate',
        equipment: 'Commercial Gym',
        days: [
          {
            dayName: 'Day 1 — Chest Annihilation',
            focus: 'Heavy Flat/Incline Pressing & Cable Pec Isolation',
            exercises: [
              { exerciseName: 'Bench Press', category: 'Chest', sets: 4, repRange: '6-8 reps', restSec: 150, instructions: 'Plant feet, squeeze shoulder blades together, power through sticking point.' },
              { exerciseName: 'Incline Bench Press', category: 'Chest', sets: 4, repRange: '8-10 reps', restSec: 120, instructions: 'Control barbell descent to upper chest shelf.' },
              { exerciseName: 'Dumbbell Press', category: 'Chest', sets: 3, repRange: '10-12 reps', restSec: 90, instructions: 'Flat dumbbell pressing with full pectoral stretch at base.' },
              { exerciseName: 'Lateral Raise', category: 'Shoulders', sets: 3, repRange: '15 reps', restSec: 60, instructions: 'Burnout set for delts.' }
            ]
          },
          {
            dayName: 'Day 2 — Back & Traps Thickness',
            focus: 'Vertical Lat Width & Heavy Row Density',
            exercises: [
              { exerciseName: 'Deadlift', category: 'Back', sets: 4, repRange: '4-6 reps', restSec: 180, instructions: 'Reset breath at bottom of every rep. Drive hips through.' },
              { exerciseName: 'Barbell Row', category: 'Back', sets: 4, repRange: '8-10 reps', restSec: 90, instructions: 'Pull elbows back past torso, pause for 1 second.' },
              { exerciseName: 'Lat Pulldown', category: 'Back', sets: 4, repRange: '10-12 reps', restSec: 90, instructions: 'Lean back slightly and squeeze lower lats.' },
              { exerciseName: 'Seated Cable Row', category: 'Back', sets: 3, repRange: '12 reps', restSec: 75, instructions: 'Strict torso angle with maximal scapular retraction.' }
            ]
          },
          {
            dayName: 'Day 3 — Shoulder Boulder Day',
            focus: 'Anterior, Lateral & Rear Deltoid Complete Development',
            exercises: [
              { exerciseName: 'Shoulder Press', category: 'Shoulders', sets: 4, repRange: '6-8 reps', restSec: 120, instructions: 'Overhead barbell or heavy dumbbell pressing.' },
              { exerciseName: 'Lateral Raise', category: 'Shoulders', sets: 5, repRange: '12-15 reps', restSec: 60, instructions: 'Strict side lateral raises with thumbs slightly down.' },
              { exerciseName: 'Barbell Row', category: 'Back', sets: 3, repRange: '12 reps', restSec: 75, instructions: 'Wide grip rear delt face pulls or high rows.' }
            ]
          },
          {
            dayName: 'Day 4 — Leg Day Demolition',
            focus: 'Heavy Squats, Posterior Chain & Calves',
            exercises: [
              { exerciseName: 'Squat', category: 'Legs', sets: 5, repRange: '6-8 reps', restSec: 180, instructions: 'Descend to full depth, drive out of the hole with powerful quads.' },
              { exerciseName: 'Romanian Deadlift', category: 'Legs', sets: 4, repRange: '8-10 reps', restSec: 120, instructions: 'Push hips back until hamstrings are fully loaded.' },
              { exerciseName: 'Leg Press', category: 'Legs', sets: 3, repRange: '12-15 reps', restSec: 90, instructions: 'High volume leg press with controlled negative.' },
              { exerciseName: 'Calf Raise', category: 'Legs', sets: 4, repRange: '15-20 reps', restSec: 60, instructions: 'Deep stretch at bottom, hard squeeze at top.' }
            ]
          },
          {
            dayName: 'Day 5 — Arms Hypertrophy (Biceps & Triceps)',
            focus: 'Antagonistic Arm Supersets & Peak Contraction',
            exercises: [
              { exerciseName: 'Bicep Curl', category: 'Arms', sets: 4, repRange: '8-10 reps', restSec: 75, instructions: 'Strict barbell or dumbbell curls.' },
              { exerciseName: 'Tricep Pushdown', category: 'Arms', sets: 4, repRange: '10-12 reps', restSec: 60, instructions: 'Rope pushdown with flare at bottom.' },
              { exerciseName: 'Hammer Curl', category: 'Arms', sets: 3, repRange: '10-12 reps', restSec: 60, instructions: 'Brachialis thickness with heavy dumbbells.' },
              { exerciseName: 'Overhead Tricep Extension', category: 'Arms', sets: 3, repRange: '12 reps', restSec: 60, instructions: 'Long head stretch behind neck.' }
            ]
          }
        ]
      };
    }

    if (chosenSplit === 'Full Body') {
      return {
        split: 'Full Body',
        daysPerWeek: 3,
        goal: profile.fitnessGoal,
        experience: 'Beginner',
        equipment: 'Commercial Gym',
        days: [
          {
            dayName: 'Workout A — Full Body Foundation',
            focus: 'Squat, Flat Press & Vertical Pull',
            exercises: [
              { exerciseName: 'Squat', category: 'Legs', sets: 4, repRange: '6-8 reps', restSec: 150, instructions: 'Solid core brace, controlled descent.' },
              { exerciseName: 'Bench Press', category: 'Chest', sets: 3, repRange: '8-10 reps', restSec: 120, instructions: 'Retract shoulder blades, steady rhythm.' },
              { exerciseName: 'Lat Pulldown', category: 'Back', sets: 3, repRange: '10-12 reps', restSec: 90, instructions: 'Drive elbows down to hips.' },
              { exerciseName: 'Lateral Raise', category: 'Shoulders', sets: 3, repRange: '15 reps', restSec: 60, instructions: 'Lead with elbows.' },
              { exerciseName: 'Bicep Curl', category: 'Arms', sets: 2, repRange: '12 reps', restSec: 60, instructions: 'Strict squeeze at top.' }
            ]
          },
          {
            dayName: 'Workout B — Full Body Strength & Hinge',
            focus: 'Deadlift, Overhead Press & Horizontal Row',
            exercises: [
              { exerciseName: 'Deadlift', category: 'Back', sets: 3, repRange: '5 reps', restSec: 180, instructions: 'Tight lats, neutral spine throughout.' },
              { exerciseName: 'Shoulder Press', category: 'Shoulders', sets: 3, repRange: '8-10 reps', restSec: 90, instructions: 'Overhead drive with tight glutes.' },
              { exerciseName: 'Barbell Row', category: 'Back', sets: 3, repRange: '8-10 reps', restSec: 90, instructions: '45-degree hinge row.' },
              { exerciseName: 'Leg Press', category: 'Legs', sets: 3, repRange: '10-12 reps', restSec: 90, instructions: 'Controlled quad overload.' },
              { exerciseName: 'Tricep Pushdown', category: 'Arms', sets: 2, repRange: '12 reps', restSec: 60, instructions: 'Full lock at bottom.' }
            ]
          },
          {
            dayName: 'Workout C — Full Body Hypertrophy & Arms',
            focus: 'Leg Press, Incline Press, Rows & Arm Focus',
            exercises: [
              { exerciseName: 'Incline Bench Press', category: 'Chest', sets: 3, repRange: '8-10 reps', restSec: 120, instructions: 'Upper pectoral shelf targeting.' },
              { exerciseName: 'Romanian Deadlift', category: 'Legs', sets: 3, repRange: '10-12 reps', restSec: 90, instructions: 'Hamstring stretch with hip hinge.' },
              { exerciseName: 'Seated Cable Row', category: 'Back', sets: 3, repRange: '10-12 reps', restSec: 90, instructions: 'Drive elbows back, chest high.' },
              { exerciseName: 'Hammer Curl', category: 'Arms', sets: 3, repRange: '12 reps', restSec: 60, instructions: 'Neutral grip forearm & bicep power.' },
              { exerciseName: 'Calf Raise', category: 'Legs', sets: 3, repRange: '15 reps', restSec: 60, instructions: 'Peak stretch and contraction.' }
            ]
          }
        ]
      };
    }
    // Default Upper / Lower split
    return {
      split: chosenSplit,
      daysPerWeek: 4,
      goal: profile.fitnessGoal,
      experience: 'Beginner',
      equipment: 'Commercial Gym',
      days: [
        {
          dayName: 'Day 1 — Upper Body A',
          focus: 'Horizontal Press & Upper Back Strength',
          exercises: [
            { exerciseName: 'Bench Press', category: 'Chest', sets: 3, repRange: '8-10 reps', restSec: 120, instructions: 'Firm foot drive, smooth controlled bar path.' },
            { exerciseName: 'Barbell Row', category: 'Back', sets: 3, repRange: '8-10 reps', restSec: 90, instructions: 'Pull to sternum, squeeze mid traps.' },
            { exerciseName: 'Shoulder Press', category: 'Shoulders', sets: 3, repRange: '10 reps', restSec: 90, instructions: 'Strict standing press.' },
            { exerciseName: 'Bicep Curl', category: 'Arms', sets: 3, repRange: '12 reps', restSec: 60, instructions: 'Controlled tempo.' }
          ]
        },
        {
          dayName: 'Day 2 — Lower Body A',
          focus: 'Squat & Posterior Chain',
          exercises: [
            { exerciseName: 'Squat', category: 'Legs', sets: 4, repRange: '6-8 reps', restSec: 150, instructions: 'Deep squat with full midfoot balance.' },
            { exerciseName: 'Leg Curl', category: 'Legs', sets: 3, repRange: '10-12 reps', restSec: 75, instructions: 'Control the stretch.' },
            { exerciseName: 'Leg Press', category: 'Legs', sets: 3, repRange: '12 reps', restSec: 90, instructions: 'Deep range without rounding pelvis.' }
          ]
        },
        {
          dayName: 'Day 3 — Rest & Mobility',
          focus: 'Recovery and light cardio',
          exercises: []
        },
        {
          dayName: 'Day 4 — Upper Body B',
          focus: 'Vertical Pull & Shoulder Width',
          exercises: [
            { exerciseName: 'Lat Pulldown', category: 'Back', sets: 4, repRange: '8-10 reps', restSec: 90, instructions: 'Pull bar to collarbone.' },
            { exerciseName: 'Dumbbell Press', category: 'Chest', sets: 3, repRange: '10-12 reps', restSec: 90, instructions: 'Incline bench dumbbell press.' },
            { exerciseName: 'Lateral Raise', category: 'Shoulders', sets: 4, repRange: '12-15 reps', restSec: 60, instructions: 'Strict deltoid isolation.' },
            { exerciseName: 'Tricep Pushdown', category: 'Arms', sets: 3, repRange: '12 reps', restSec: 60, instructions: 'Full lock at bottom.' }
          ]
        },
        {
          dayName: 'Day 5 — Lower Body B & Deadlifts',
          focus: 'Deadlift & Quad Pump',
          exercises: [
            { exerciseName: 'Deadlift', category: 'Back', sets: 3, repRange: '5 reps', restSec: 180, instructions: 'Explosive drive from floor.' },
            { exerciseName: 'Leg Extension', category: 'Legs', sets: 3, repRange: '12-15 reps', restSec: 60, instructions: 'Full quad squeeze at top.' },
            { exerciseName: 'Leg Press', category: 'Legs', sets: 3, repRange: '10-12 reps', restSec: 90, instructions: 'Heavy volume.' }
          ]
        }
      ]
    };
  }

  // --- Subscriptions & Feature Gating ---
  public getSubscription(userId: string): SubscriptionInfo {
    if (!this.data.subscriptions[userId]) {
      this.data.subscriptions[userId] = {
        tier: 'FREE',
        tierName: 'FREE',
        priceInr: 0,
        billingCycle: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        renewalDate: 'Lifetime',
        status: 'active',
        features: [
          'Calorie tracker',
          'Indian food database',
          'Food logging',
          'Custom foods',
          'Water tracker',
          'Workout logging',
          'Strength records',
          'Workout history',
          'Personal records',
          'Progress tracking',
          'WhatsApp expert contact'
        ]
      };
      this.flush();
    }
    return this.data.subscriptions[userId];
  }

  public setSubscription(userId: string, tier: SubscriptionTier, paymentDetails?: { paymentId?: string; orderId?: string }): SubscriptionInfo {
    const tierMeta: Record<SubscriptionTier, { name: string; price: number; features: string[] }> = {
      FREE: {
        name: 'FREE',
        price: 0,
        features: [
          'Calorie tracker',
          'Indian food database',
          'Food logging',
          'Custom foods',
          'Water tracker',
          'Workout logging',
          'Strength records',
          'Workout history',
          'Personal records',
          'Progress tracking',
          'WhatsApp expert contact'
        ]
      },
      PLAN_299: {
        name: 'FITTRACK NUTRITION',
        price: 299,
        features: [
          'Everything in FREE',
          'Personalized daily calorie target',
          'Personalized protein target',
          'Personalized carbs target',
          'Personalized fat target',
          'Goal-based daily macros',
          'Personalized meal recommendations',
          'Budget-based meal planning',
          'Diet-preference based meals',
          'Vegetarian / non-vegetarian options',
          'Daily nutrition guidance'
        ]
      },
      PLAN_449: {
        name: 'FITTRACK PERFORMANCE',
        price: 449,
        features: [
          'Everything in ₹299',
          'Personalized workout splits',
          'Weekly training schedule',
          'Goal-based exercise selection',
          'Sets and reps recommendations',
          'Rest period recommendations',
          'Equipment-based workout plans',
          'Experience-based workout plans'
        ]
      },
      PLAN_699: {
        name: 'FITTRACK ELITE',
        price: 699,
        features: [
          'Everything in ₹449',
          'Progressive overload system',
          'Exercise selection guidance',
          'Weight recommendations',
          'Rep recommendations',
          'Weekly progression guidance',
          'Strength progression analysis',
          'Workout performance recommendations',
          'Complete training guidance'
        ]
      }
    };

    const target = tierMeta[tier] || tierMeta.FREE;
    const renewal = new Date();
    renewal.setMonth(renewal.getMonth() + 1);

    const updated: SubscriptionInfo = {
      tier,
      tierName: target.name,
      priceInr: target.price,
      billingCycle: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      renewalDate: renewal.toISOString().split('T')[0],
      status: 'active',
      features: target.features,
      lastPaymentId: paymentDetails?.paymentId,
      lastOrderId: paymentDetails?.orderId
    };

    this.data.subscriptions[userId] = updated;
    this.flush();
    return updated;
  }

  // --- Payment Orders & Verification ---
  public createPaymentOrder(order: PaymentOrder): PaymentOrder {
    if (!this.data.orders) {
      this.data.orders = [];
    }
    this.data.orders.push(order);
    this.flush();
    return order;
  }

  public getPaymentOrder(orderId: string): PaymentOrder | undefined {
    if (!this.data.orders) {
      this.data.orders = [];
    }
    return this.data.orders.find(o => o.id === orderId);
  }

  public updatePaymentOrder(orderId: string, updates: Partial<PaymentOrder>): PaymentOrder | undefined {
    if (!this.data.orders) {
      this.data.orders = [];
    }
    const idx = this.data.orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      this.data.orders[idx] = {
        ...this.data.orders[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.flush();
      return this.data.orders[idx];
    }
    return undefined;
  }

  public getUserPaymentOrders(userId: string): PaymentOrder[] {
    if (!this.data.orders) {
      this.data.orders = [];
    }
    return this.data.orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- Direct UPI Payment Submissions ---
  public createUpiSubmission(sub: UpiPaymentSubmission): UpiPaymentSubmission {
    if (!this.data.upiSubmissions) {
      this.data.upiSubmissions = [];
    }
    this.data.upiSubmissions.unshift(sub);
    this.flush();
    return sub;
  }

  public getUserUpiSubmissions(userId: string): UpiPaymentSubmission[] {
    if (!this.data.upiSubmissions) {
      this.data.upiSubmissions = [];
    }
    return this.data.upiSubmissions
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  public getAllUpiSubmissions(): UpiPaymentSubmission[] {
    if (!this.data.upiSubmissions) {
      this.data.upiSubmissions = [];
    }
    return [...this.data.upiSubmissions].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  public getUpiSubmission(id: string): UpiPaymentSubmission | undefined {
    if (!this.data.upiSubmissions) {
      this.data.upiSubmissions = [];
    }
    return this.data.upiSubmissions.find(s => s.id === id);
  }

  public updateUpiSubmission(id: string, updates: Partial<UpiPaymentSubmission>): UpiPaymentSubmission | undefined {
    if (!this.data.upiSubmissions) {
      this.data.upiSubmissions = [];
    }
    const idx = this.data.upiSubmissions.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.upiSubmissions[idx] = {
        ...this.data.upiSubmissions[idx],
        ...updates
      };
      this.flush();
      return this.data.upiSubmissions[idx];
    }
    return undefined;
  }

  public approveUpiSubmission(id: string, adminNotes?: string): { submission: UpiPaymentSubmission; subscription: SubscriptionInfo } | null {
    const sub = this.getUpiSubmission(id);
    if (!sub) return null;

    sub.status = 'approved';
    sub.verifiedAt = new Date().toISOString();
    if (adminNotes) {
      sub.adminNotes = adminNotes;
    }

    // Activate the subscription for the user
    const updatedSub = this.setSubscription(sub.userId, sub.planTier, {
      paymentId: sub.utr,
      orderId: sub.upiRefId || sub.id
    });

    this.flush();
    return { submission: sub, subscription: updatedSub };
  }

  public rejectUpiSubmission(id: string, adminNotes?: string): UpiPaymentSubmission | null {
    const sub = this.getUpiSubmission(id);
    if (!sub) return null;

    sub.status = 'rejected';
    sub.verifiedAt = new Date().toISOString();
    if (adminNotes) {
      sub.adminNotes = adminNotes;
    }

    this.flush();
    return sub;
  }

  // --- Metrics (Weight & Water) ---
  public getMetrics(userId: string): DailyMetric[] {
    return this.data.dailyMetrics.filter(m => m.userId === userId);
  }

  public logMetric(userId: string, date: string, weightKg?: number, waterIntakeMl?: number): DailyMetric {
    const existingIdx = this.data.dailyMetrics.findIndex(m => m.userId === userId && m.date === date);
    if (existingIdx !== -1) {
      const existing = this.data.dailyMetrics[existingIdx];
      if (weightKg !== undefined) existing.weightKg = weightKg;
      if (waterIntakeMl !== undefined) existing.waterIntakeMl = waterIntakeMl;
      this.flush();
      return existing;
    } else {
      const newMetric: DailyMetric = {
        id: `m-${Date.now()}`,
        userId,
        date,
        weightKg,
        waterIntakeMl: waterIntakeMl || 0
      };
      this.data.dailyMetrics.push(newMetric);
      this.flush();
      return newMetric;
    }
  }

  // --- Admin Stats & Data ---
  public getAllUsers() {
    return this.data.users.map(u => ({
      ...u,
      profile: this.data.profiles[u.id],
      subscription: this.data.subscriptions[u.id] || { tier: 'FREE', tierName: 'FREE PLAN' },
      totalWorkouts: this.data.workouts.filter(w => w.userId === u.id).length,
      totalFoodLogs: this.data.foodLogs.filter(f => f.userId === u.id).length
    }));
  }
}

export const db = new Database();
