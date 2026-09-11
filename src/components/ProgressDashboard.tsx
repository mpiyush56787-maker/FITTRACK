import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  TrendingUp,
  Scale,
  Flame,
  Dumbbell,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DailyMetric, Workout } from '../types';

export const ProgressDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  // Quick Daily Metric Input
  const [todayWeight, setTodayWeight] = useState(String(profile?.weightKg || 74.5));
  const [todaySleep, setTodaySleep] = useState('7.5');
  const [todayWater, setTodayWater] = useState('3000');
  const [saveStatus, setSaveStatus] = useState('');

  const loadData = async () => {
    try {
      const [mRes, wRes] = await Promise.all([api.getMetrics(), api.getWorkouts()]);
      setMetrics(mRes.metrics);
      setWorkouts(wRes.workouts);
    } catch (e) {
      console.error('Failed to load progress data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveDailyMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      await api.updateMetric({
        date: todayStr,
        weightKg: parseFloat(todayWeight),
        sleepHours: parseFloat(todaySleep),
        waterIntakeMl: parseInt(todayWater)
      });
      setSaveStatus('Metrics logged successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to save metric:', err);
    }
  };

  // Prepare chart data
  const chartData = metrics.slice(-14).map(m => ({
    date: m.date.slice(5),
    weight: m.weightKg || profile?.weightKg || 74.5,
    calories: m.calorieIntake || profile?.targetCalories || 2300,
    targetCalories: profile?.targetCalories || 2300,
    protein: m.proteinGrams || profile?.targetProtein || 160,
    sleep: m.sleepHours || 7.5,
    water: (m.waterIntakeMl || 2500) / 1000
  }));

  const workoutVolumeData = workouts.slice(-10).map(w => ({
    date: w.date.slice(5),
    name: w.name,
    volume: w.totalVolumeKg,
    sets: w.sets.length
  }));

  return (
    <div id="progress-dashboard-view" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase font-athletic tracking-wide text-white flex items-center gap-2.5">
            <TrendingUp className="h-7 w-7 text-red-500" />
            PROGRESS & HEALTH ANALYTICS
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Analyze physical body composition, calorie adherence, and training volume progression.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#1a1b20] border border-zinc-800 rounded-xl p-1">
          {(['7d', '30d', 'all'] as const).map(tr => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`px-3 py-1 text-xs font-bold font-athletic uppercase rounded-lg transition cursor-pointer ${
                timeRange === tr
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tr === '7d' ? '7 Days' : tr === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Metric Check-in Card */}
      <div className="rounded-2xl border border-zinc-800 bg-[#1a1b20] p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-bold uppercase font-athletic tracking-wider text-white flex items-center gap-2">
            <Scale className="h-4 w-4 text-red-500" />
            TODAY'S PHYSICAL CHECK-IN
          </h3>
          {saveStatus && <span className="text-xs font-bold text-red-500">{saveStatus}</span>}
        </div>

        <form onSubmit={handleSaveDailyMetric} className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase font-athletic text-zinc-400">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={todayWeight}
              onChange={e => setTodayWeight(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#22232a] px-3 py-2 text-xs font-bold text-white focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase font-athletic text-zinc-400">
              Sleep (Hours)
            </label>
            <input
              type="number"
              step="0.5"
              value={todaySleep}
              onChange={e => setTodaySleep(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#22232a] px-3 py-2 text-xs font-bold text-white focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase font-athletic text-zinc-400">
              Water (ml)
            </label>
            <input
              type="number"
              step="100"
              value={todayWater}
              onChange={e => setTodayWater(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#22232a] px-3 py-2 text-xs font-bold text-white focus:border-red-600 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-red-600 py-2 text-xs font-bold font-athletic uppercase text-white hover:bg-red-700 transition shadow-xs cursor-pointer"
            >
              Log Today's Metrics
            </button>
          </div>
        </form>
      </div>

      {/* Chart 1: Weight Progression & Calorie Consistency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Trend Chart */}
        <div className="rounded-2xl border border-zinc-800 bg-[#1a1b20] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold uppercase font-athletic text-white">
                BODY WEIGHT TRAJECTORY
              </h4>
              <p className="text-xs text-zinc-400">Goal: {profile?.fitnessGoal || 'Build Muscle'}</p>
            </div>
            <Scale className="h-5 w-5 text-red-500" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} />
                <YAxis stroke="#a1a1aa" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} unit=" kg" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1b20',
                    borderColor: '#3f3f46',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#DC2626"
                  strokeWidth={3}
                  dot={{ fill: '#DC2626', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Caloric Adherence vs Target */}
        <div className="rounded-2xl border border-zinc-800 bg-[#1a1b20] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold uppercase font-athletic text-white">
                CALORIC INTAKE VS TARGET
              </h4>
              <p className="text-xs text-zinc-400">Daily Target: {profile?.targetCalories || 2300} kcal</p>
            </div>
            <Flame className="h-5 w-5 text-red-500" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} />
                <YAxis stroke="#a1a1aa" fontSize={11} unit=" kcal" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1b20',
                    borderColor: '#3f3f46',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)'
                  }}
                />
                <Bar dataKey="calories" name="Consumed (kcal)" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="targetCalories" name="Target" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 2: Total Workout Volume Progression */}
      <div className="rounded-2xl border border-zinc-800 bg-[#1a1b20] p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold uppercase font-athletic text-white">
              WORKOUT VOLUME LOAD OVER TIME (KG)
            </h4>
            <p className="text-xs text-zinc-400">Calculated as Σ (Weight × Reps) per completed session</p>
          </div>
          <Dumbbell className="h-5 w-5 text-red-500" />
        </div>

        <div className="h-64 w-full pt-2">
          {workoutVolumeData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-zinc-500">
              No workout volume logs available yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workoutVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} />
                <YAxis stroke="#a1a1aa" fontSize={11} unit=" kg" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1b20',
                    borderColor: '#3f3f46',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)'
                  }}
                />
                <Bar dataKey="volume" name="Session Volume (kg)" fill="#DC2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
