import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import heroGymImage from '../assets/images/gym_hero_athlete_1788767158952.jpg';
import quoteGymImage from '../assets/images/gym_motivation_card_1788767176568.jpg';
import {
  Flame,
  Dumbbell,
  TrendingUp,
  Droplets,
  Scale,
  Award,
  Plus,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  Clock,
  HeartPulse
} from 'lucide-react';
import { FoodLog, Workout, PersonalRecord, DailyMetric } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenExpertModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'signup' | 'profile') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenExpertModal, onOpenAuthModal }) => {
  const { profile, subscription } = useAuth();
  const [foodData, setFoodData] = useState<{
    logs: FoodLog[];
    totals: { calories: number; protein: number; carbs: number; fat: number };
    targets: any;
    remaining: any;
  }>({
    logs: [],
    totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    targets: null,
    remaining: { calories: 0, protein: 0, carbs: 0, fat: 0 }
  });

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const [workoutStreak, setWorkoutStreak] = useState<number>(4);
  const [todayWater, setTodayWater] = useState<number>(2200);
  const [currentWeight, setCurrentWeight] = useState<number>(profile?.weightKg || 74.5);
  const [isLoggingWeight, setIsLoggingWeight] = useState<boolean>(false);
  const [weightInput, setWeightInput] = useState<string>(String(profile?.weightKg || 74.5));
  const [aiTip, setAiTip] = useState<string>('Keep your protein high and stay consistent with progressive overload.');

  const todayStr = new Date().toISOString().split('T')[0];

  const loadDashboardData = async () => {
    try {
      const [fLogs, wList, prList, mList, sData] = await Promise.all([
        api.getFoodLogs(todayStr),
        api.getWorkouts(),
        api.getPersonalRecords(),
        api.getMetrics(),
        api.getWorkoutStats().catch(() => ({ stats: null }))
      ]);

      setFoodData(fLogs);
      setWorkouts(wList.workouts);
      setPrs(prList.records);
      setMetrics(mList.metrics);

      if (sData?.stats?.workoutStreak !== undefined) {
        setWorkoutStreak(sData.stats.workoutStreak);
      }

      const todayMetric = mList.metrics.find((m: DailyMetric) => m.date === todayStr);
      if (todayMetric) {
        setTodayWater(todayMetric.waterIntakeMl || 0);
        if (todayMetric.weightKg) setCurrentWeight(todayMetric.weightKg);
      }
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    }
  };

  useEffect(() => {
    loadDashboardData();
    if (profile?.weightKg) {
      setCurrentWeight(profile.weightKg);
      setWeightInput(String(profile.weightKg));
    }
  }, [profile]);

  const handleAddWater = async (amount: number) => {
    const newTotal = todayWater + amount;
    setTodayWater(newTotal);
    try {
      await api.updateMetric({ date: todayStr, waterIntakeMl: newTotal });
    } catch (e) {
      console.error('Water update failed:', e);
    }
  };

  const handleSaveWeight = async () => {
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 30 && val < 250) {
      setCurrentWeight(val);
      setIsLoggingWeight(false);
      try {
        await api.updateMetric({ date: todayStr, weightKg: val });
        await api.updateProfile({ weightKg: val });
      } catch (e) {
        console.error('Weight update failed:', e);
      }
    }
  };

  // Calculations
  const targetCals = profile?.targetCalories || 2300;
  const targetProtein = profile?.targetProtein || 160;
  const targetCarbs = profile?.targetCarbs || 250;
  const targetFat = profile?.targetFat || 70;
  const waterTarget = profile?.waterTargetMl || 3500;

  const currentCals = foodData.totals.calories;
  const currentProtein = foodData.totals.protein;
  const currentCarbs = foodData.totals.carbs;
  const currentFat = foodData.totals.fat;

  const calPercent = Math.min(100, Math.round((currentCals / targetCals) * 100));
  const proteinPercent = Math.min(100, Math.round((currentProtein / targetProtein) * 100));
  const carbsPercent = Math.min(100, Math.round((currentCarbs / targetCarbs) * 100));
  const fatPercent = Math.min(100, Math.round((currentFat / targetFat) * 100));
  const waterPercent = Math.min(100, Math.round((todayWater / waterTarget) * 100));

  const todaysWorkout = workouts.find(w => w.date === todayStr);
  const latestPR = prs.length > 0 ? prs[0] : null;

  return (
    <div id="fittrack-dashboard-view" className="space-y-6 pb-12">
      {/* Large Full-Width Fitness Hero Banner with Professional Athlete Photography */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2A2E35] bg-[#202328] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[260px] items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 p-4 sm:p-8 z-10 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#E53935]" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#E53935] font-athletic">
                Athlete Motivation & Discipline
              </span>
            </div>
            <h1 className="mt-1.5 sm:mt-2 text-xl sm:text-3xl lg:text-4xl font-extrabold font-athletic tracking-wide text-white uppercase leading-tight">
              "DISCIPLINE BEATS MOTIVATION."
            </h1>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-zinc-300 font-medium max-w-xl leading-relaxed">
              Track the work. Trust the process. Small progress every single day builds the body and the mindset.
            </p>

            {/* Hero Action Buttons - Responsive touch-friendly on mobile */}
            <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
              <button
                id="dashboard-action-log-food-btn"
                onClick={() => onNavigate('food')}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#E53935] px-4 py-2.5 text-xs font-bold font-athletic uppercase tracking-wider text-white shadow-lg hover:bg-red-600 transition cursor-pointer w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 stroke-[3] text-white" />
                <span>+ LOG FOOD</span>
              </button>

              <button
                id="dashboard-action-start-workout-btn"
                onClick={() => onNavigate('workout')}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#202328] border border-[#E53935] px-4 py-2.5 text-xs font-bold font-athletic uppercase tracking-wider text-white hover:bg-[#2A2E35] transition shadow-md cursor-pointer w-full sm:w-auto"
              >
                <Dumbbell className="h-4 w-4 text-[#E53935]" />
                <span>START WORKOUT</span>
              </button>

              <button
                id="dashboard-action-view-progress-btn"
                onClick={() => onNavigate('progress')}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#202328] border border-zinc-700 px-4 py-2.5 text-xs font-bold font-athletic uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-[#2A2E35] transition cursor-pointer w-full sm:w-auto"
              >
                <TrendingUp className="h-4 w-4 text-[#E53935]" />
                <span>VIEW PROGRESS</span>
              </button>
            </div>
          </div>

          {/* Hero Right Image - High Quality Gym Athlete Photo */}
          <div className="lg:col-span-5 h-48 sm:h-64 lg:h-full relative overflow-hidden bg-[#17191C]">
            <img
              src={heroGymImage}
              alt="Athlete training with weights in dark gym"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Main Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Progress Ring Card */}
        <div id="card-calories" className="relative overflow-hidden rounded-2xl border border-[#2A2E35] bg-[#202328] p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-athletic">
              CALORIES
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-950/80 border border-red-900 text-[#E53935]">
              <Flame className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-athletic text-white">
              {currentCals.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-zinc-400">
              / {targetCals.toLocaleString()} kcal
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-semibold text-zinc-300 mb-1">
              <span>{calPercent}% consumed</span>
              <span className="text-red-400 font-bold">{Math.max(0, targetCals - currentCals)} kcal left</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#17191C] overflow-hidden border border-zinc-700/60">
              <div
                className="h-full rounded-full bg-[#E53935] transition-all duration-500"
                style={{ width: `${calPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Protein Card */}
        <div id="card-protein" className="relative overflow-hidden rounded-2xl border border-[#2A2E35] bg-[#202328] p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-athletic">
              PROTEIN
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-950/80 border border-red-900 text-[#E53935]">
              <Zap className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-athletic text-[#E53935]">
              {currentProtein}g
            </span>
            <span className="text-xs font-medium text-zinc-400">
              / {targetProtein} g
            </span>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-semibold text-zinc-300 mb-1">
              <span>{proteinPercent}% target</span>
              <span className="text-zinc-400">{Math.max(0, Math.round(targetProtein - currentProtein))}g remaining</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#17191C] overflow-hidden border border-zinc-700/60">
              <div
                className="h-full rounded-full bg-[#E53935] transition-all duration-500"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Carbohydrates Card */}
        <div id="card-carbs" className="relative overflow-hidden rounded-2xl border border-[#2A2E35] bg-[#202328] p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-athletic">
              CARBS
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2A2E35] border border-zinc-700 text-zinc-300">
              <Target className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-athletic text-white">
              {currentCarbs}g
            </span>
            <span className="text-xs font-medium text-zinc-400">
              / {targetCarbs} g
            </span>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-semibold text-zinc-300 mb-1">
              <span>{carbsPercent}% target</span>
              <span className="text-zinc-400">{Math.max(0, Math.round(targetCarbs - currentCarbs))}g left</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#17191C] overflow-hidden border border-zinc-700/60">
              <div
                className="h-full rounded-full bg-[#E53935] transition-all duration-500"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Fats Card */}
        <div id="card-fats" className="relative overflow-hidden rounded-2xl border border-[#2A2E35] bg-[#202328] p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-athletic">
              FATS
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2A2E35] border border-zinc-700 text-zinc-300">
              <HeartPulse className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-athletic text-white">
              {currentFat}g
            </span>
            <span className="text-xs font-medium text-zinc-400">
              / {targetFat} g
            </span>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-semibold text-zinc-300 mb-1">
              <span>{fatPercent}% target</span>
              <span className="text-zinc-400">{Math.max(0, Math.round(targetFat - currentFat))}g left</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#17191C] overflow-hidden border border-zinc-700/60">
              <div
                className="h-full rounded-full bg-[#E53935] transition-all duration-500"
                style={{ width: `${fatPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row (Hydration, Weight, Streak) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Water & Hydration Card */}
        <div id="card-water-intake" className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-athletic flex items-center gap-1.5">
                <Droplets className="h-4 w-4 text-[#E53935]" />
                WATER INTAKE
              </span>
              <span className="text-xs font-bold text-[#E53935] font-athletic">
                {todayWater} / {waterTarget} ml
              </span>
            </div>

            <div className="mt-3 h-2.5 w-full rounded-full bg-[#17191C] overflow-hidden border border-zinc-700/60">
              <div
                className="h-full rounded-full bg-[#E53935] transition-all duration-500"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              id="water-add-250-btn"
              onClick={() => handleAddWater(250)}
              className="flex-1 rounded-xl bg-[#2A2E35] hover:bg-zinc-700 py-2 text-xs font-bold font-athletic uppercase text-zinc-200 transition border border-zinc-700 cursor-pointer"
            >
              +250 ml
            </button>
            <button
              id="water-add-500-btn"
              onClick={() => handleAddWater(500)}
              className="flex-1 rounded-xl bg-[#2A2E35] hover:bg-zinc-700 py-2 text-xs font-bold font-athletic uppercase text-zinc-200 transition border border-zinc-700 cursor-pointer"
            >
              +500 ml
            </button>
          </div>
        </div>

        {/* Current Weight & Bodyweight Logger */}
        <div id="card-body-weight" className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-athletic flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-[#E53935]" />
              BODY WEIGHT
            </span>
            <span className="text-[10px] font-semibold uppercase text-red-300 bg-red-950/80 px-2 py-0.5 rounded-md border border-red-900">
              {profile?.fitnessGoal || 'Build Muscle'}
            </span>
          </div>

          <div className="mt-2">
            {isLoggingWeight ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  id="dashboard-weight-input"
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                  className="w-24 rounded-lg bg-[#2A2E35] border border-[#E53935] px-2.5 py-1 text-sm font-bold text-white focus:outline-none"
                  autoFocus
                />
                <button
                  id="dashboard-save-weight-btn"
                  onClick={handleSaveWeight}
                  className="rounded-lg bg-[#E53935] px-3 py-1 text-xs font-bold text-white uppercase font-athletic cursor-pointer hover:bg-red-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsLoggingWeight(false)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold font-athletic text-white">
                  {currentWeight} <span className="text-sm font-normal text-zinc-400">kg</span>
                </span>
                <button
                  id="dashboard-log-weight-btn"
                  onClick={() => setIsLoggingWeight(true)}
                  className="text-xs font-bold uppercase text-[#E53935] hover:text-red-400 hover:underline font-athletic cursor-pointer"
                >
                  Log Today
                </button>
              </div>
            )}
          </div>

          <p className="mt-2 text-[11px] text-zinc-400">
            Target daily calories auto-calibrated to {targetCals} kcal.
          </p>
        </div>

        {/* Streaks Card */}
        <div id="card-streaks" className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-5 shadow-md flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-950/80 border border-red-900 text-[#E53935]">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-zinc-400 font-athletic">Workout Streak</span>
                <span className="text-lg font-bold font-athletic text-white">{workoutStreak} Days Active</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2A2E35] border border-zinc-700 text-zinc-300">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-zinc-400 font-athletic">Nutrition Streak</span>
                <span className="text-lg font-bold font-athletic text-white">6 Days Logged</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xl font-bold font-athletic text-[#E53935]">92%</span>
            <span className="block text-[10px] text-zinc-400 uppercase font-athletic">Weekly Adherence</span>
          </div>
        </div>
      </div>

      {/* Today's Workout & Latest Personal Record Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Workout Preview */}
        <div id="card-today-workout" className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-6 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2E35]">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-[#E53935]" />
              <h2 className="text-lg font-bold uppercase font-athletic tracking-wide text-white">
                TODAY'S WORKOUT
              </h2>
            </div>
            {todaysWorkout ? (
              <span className="rounded-md bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-xs font-bold text-red-400 font-athletic uppercase flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#E53935]" /> Completed
              </span>
            ) : (
              <span className="rounded-md bg-red-950/80 border border-red-900 px-2.5 py-0.5 text-xs font-bold text-red-300 font-athletic uppercase">
                Pending Session
              </span>
            )}
          </div>

          {todaysWorkout ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-athletic">{todaysWorkout.name}</h4>
                  <p className="text-xs text-zinc-400">{todaysWorkout.sets.length} total sets • {todaysWorkout.totalVolumeKg} kg volume</p>
                </div>
                <button
                  onClick={() => onNavigate('history')}
                  className="text-xs font-bold text-[#E53935] hover:text-red-400 hover:underline font-athletic uppercase flex items-center gap-1 cursor-pointer"
                >
                  View Details <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-1.5 pt-2">
                {todaysWorkout.sets.slice(0, 3).map((s, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-1.5 px-3 rounded-lg bg-[#2A2E35] border border-zinc-700 text-zinc-200">
                    <span className="font-medium text-zinc-200">{s.exerciseName} (Set {s.setNumber})</span>
                    <span className="font-bold text-red-400">{s.weightKg} kg × {s.reps} reps</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center py-6 text-center">
              <p className="text-sm text-zinc-200 font-medium">
                Push Hypertrophy / Upper Power scheduled for today.
              </p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Log your working sets, monitor rest periods, and auto-check for new Personal Records.
              </p>
              <button
                id="dashboard-start-todays-session-btn"
                onClick={() => onNavigate('workout')}
                className="mt-4 flex items-center gap-2 rounded-xl bg-[#E53935] px-5 py-2.5 text-xs font-bold font-athletic uppercase tracking-wider text-white shadow-md hover:bg-red-600 transition cursor-pointer"
              >
                <Dumbbell className="h-4 w-4" />
                <span>START LOGGING WORKOUT</span>
              </button>
            </div>
          )}
        </div>

        {/* Personal Records Highlight */}
        <div id="card-latest-pr" className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2E35]">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#E53935]" />
                <h2 className="text-lg font-bold uppercase font-athletic tracking-wide text-white">
                  PERSONAL RECORDS (PRS)
                </h2>
              </div>
              <button
                onClick={() => onNavigate('strength')}
                className="text-xs font-bold text-[#E53935] hover:text-red-400 hover:underline font-athletic uppercase flex items-center gap-1 cursor-pointer"
              >
                All Records <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {latestPR ? (
              <div className="mt-4 rounded-xl border border-red-900/60 bg-[#251b1e] p-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#E53935]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400 font-athletic">
                    🔥 BENCHMARK PEAK
                  </span>
                </div>
                <h4 className="mt-2 text-xl font-bold font-athletic text-white">
                  {latestPR.exerciseName}
                </h4>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-2xl font-bold font-athletic text-[#E53935]">
                    {latestPR.maxWeightKg} kg × {latestPR.maxRepsAtWeight} reps
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    (Est. 1RM: {latestPR.estimated1RM} kg)
                  </span>
                </div>
                {latestPR.previousBestWeightKg && (
                  <p className="mt-2 text-xs text-zinc-400">
                    Previous Best: {latestPR.previousBestWeightKg} kg × {latestPR.previousBestReps} reps • Progress: <span className="text-red-400 font-bold">+{Math.round((latestPR.maxWeightKg - latestPR.previousBestWeightKg) * 10) / 10} kg</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-zinc-400">
                Log your first workout to establish baseline strength records!
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#2A2E35] border border-zinc-700 p-3 text-xs text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#E53935]" />
              Plan Tier: <strong className="text-white font-athletic">{subscription?.tierName || 'FREE ATHLETE'}</strong>
            </span>
            <button
              onClick={() => onNavigate('plans')}
              className="text-[#E53935] hover:text-red-400 font-bold font-athletic uppercase hover:underline cursor-pointer"
            >
              Manage & Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Daily Gym Ethos & Motivational Fitness Photo Card */}
      <div id="card-gym-ethos" className="rounded-2xl border border-[#2A2E35] bg-[#202328] overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-5 h-48 md:h-auto relative overflow-hidden bg-[#17191C]">
          <img
            src={quoteGymImage}
            alt="Hardcore Gym Training Knurled Barbell"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#E53935]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#E53935] font-athletic">
                IRON ETHOS & CONSISTENCY
              </span>
            </div>
            <h3 className="mt-2 text-xl sm:text-2xl font-bold font-athletic uppercase text-white tracking-wide">
              "When you feel like quitting, remember why you started."
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              Every repetition, every set, and every clean meal compounds into unstoppable momentum. 
              The iron never lies to you. 200 lbs will always be 200 lbs.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-[#2A2E35] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 font-athletic uppercase font-bold text-zinc-400">
              <span className="flex items-center gap-1 text-red-400">
                <Target className="h-3.5 w-3.5 text-[#E53935]" /> Zero Excuses
              </span>
              <span className="text-zinc-600">•</span>
              <span>1% Better Daily</span>
            </div>
            <button
              onClick={() => onNavigate('workout')}
              className="rounded-xl bg-[#E53935] hover:bg-red-600 text-white text-xs font-bold font-athletic uppercase tracking-wider px-4 py-2 transition shadow-md cursor-pointer"
            >
              Crush Today's Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
