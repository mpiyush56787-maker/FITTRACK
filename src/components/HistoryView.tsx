import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Calendar,
  Dumbbell,
  UtensilsCrossed,
  Clock,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { Workout, FoodLog } from '../types';

export const HistoryView: React.FC = () => {
  const [activeHistoryTab, setActiveHistoryTab] = useState<'workouts' | 'nutrition'>('workouts');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [selectedNutritionDate, setSelectedNutritionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dailyFoodData, setDailyFoodData] = useState<{ logs: FoodLog[]; totals: any }>({
    logs: [],
    totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
  });

  const loadWorkouts = async () => {
    try {
      const data = await api.getWorkouts();
      setWorkouts(data.workouts);
      if (data.workouts.length > 0) {
        setExpandedWorkoutId(data.workouts[0].id);
      }
    } catch (e) {
      console.error('Failed to load workouts:', e);
    }
  };

  const loadDailyNutrition = async (date: string) => {
    try {
      const data = await api.getFoodLogs(date);
      setDailyFoodData({ logs: data.logs, totals: data.totals });
    } catch (e) {
      console.error('Failed to load nutrition history:', e);
    }
  };

  useEffect(() => {
    loadWorkouts();
    loadDailyNutrition(selectedNutritionDate);
  }, []);

  useEffect(() => {
    if (activeHistoryTab === 'nutrition') {
      loadDailyNutrition(selectedNutritionDate);
    }
  }, [selectedNutritionDate, activeHistoryTab]);

  return (
    <div id="history-view" className="space-y-6 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase font-athletic tracking-wide text-white flex items-center gap-2.5">
            <Calendar className="h-7 w-7 text-red-600" />
            TRAINING & NUTRITION LOGS
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Complete archives of previous workout sessions, set history, and daily dietary logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#1a1b20] border border-zinc-800 rounded-xl p-1">
          <button
            id="history-workouts-tab-btn"
            onClick={() => setActiveHistoryTab('workouts')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold font-athletic uppercase transition ${
              activeHistoryTab === 'workouts'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Dumbbell className="h-3.5 w-3.5" />
            <span>Workouts ({workouts.length})</span>
          </button>
          <button
            id="history-nutrition-tab-btn"
            onClick={() => setActiveHistoryTab('nutrition')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold font-athletic uppercase transition ${
              activeHistoryTab === 'nutrition'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            <span>Nutrition Logs</span>
          </button>
        </div>
      </div>

      {activeHistoryTab === 'workouts' ? (
        <div className="space-y-4">
          {workouts.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-[#1a1b20] p-8 text-center text-xs text-zinc-400 shadow-md">
              No workouts logged yet. Start a session from the Workout tab!
            </div>
          ) : (
            workouts.map(w => {
              const isExpanded = expandedWorkoutId === w.id;
              return (
                <div
                  key={w.id}
                  id={`workout-history-card-${w.id}`}
                  className="rounded-2xl border border-zinc-800 bg-[#1a1b20] p-5 shadow-md transition"
                >
                  <div
                    onClick={() => setExpandedWorkoutId(isExpanded ? null : w.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/70 border border-red-800/60 text-red-500">
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold uppercase font-athletic tracking-wide text-white">
                          {w.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-red-500" />
                            {w.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-zinc-400" />
                            {w.durationMinutes} mins
                          </span>
                          <span className="font-bold text-red-500">
                            {w.totalVolumeKg.toLocaleString()} kg Volume
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase font-athletic text-zinc-400">
                        {w.sets.length} Sets
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-zinc-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-zinc-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Workout Sets View */}
                  {isExpanded && (
                    <div className="mt-5 border-t border-zinc-800 pt-4 space-y-3">
                      {w.notes && (
                        <div className="rounded-xl bg-[#22232a] p-3 text-xs text-zinc-300 border border-zinc-750">
                          <strong className="text-white uppercase font-athletic text-[11px] block">Notes:</strong>
                          {w.notes}
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-zinc-800 text-[11px] font-bold font-athletic uppercase text-zinc-400">
                              <th className="py-2 px-2">EXERCISE</th>
                              <th className="py-2 px-2 text-center">SET</th>
                              <th className="py-2 px-2">WEIGHT</th>
                              <th className="py-2 px-2">REPS</th>
                              <th className="py-2 px-2">VOLUME</th>
                              <th className="py-2 px-2 text-right">TYPE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800">
                            {w.sets.map((set, idx) => (
                              <tr key={idx} className="hover:bg-[#22232a]/60">
                                <td className="py-2 px-2 font-bold text-white font-athletic uppercase">
                                  {set.exerciseName}
                                </td>
                                <td className="py-2 px-2 text-center text-zinc-400">
                                  {set.setNumber}
                                </td>
                                <td className="py-2 px-2 font-bold text-red-500">
                                  {set.weightKg} kg
                                </td>
                                <td className="py-2 px-2 text-zinc-200">
                                  {set.reps} reps
                                </td>
                                <td className="py-2 px-2 text-zinc-400">
                                  {set.weightKg * set.reps} kg
                                </td>
                                <td className="py-2 px-2 text-right">
                                  {set.isWarmup ? (
                                    <span className="text-[10px] uppercase font-bold text-zinc-300 bg-[#252630] border border-zinc-700 px-2 py-0.5 rounded">
                                      Warmup
                                    </span>
                                  ) : (
                                    <span className="text-[10px] uppercase font-bold text-white bg-red-600 px-2 py-0.5 rounded">
                                      Work
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Nutrition History View */
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#1a1b20] p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                Select Date Archive
              </span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="nutrition-history-date-picker"
                  type="date"
                  value={selectedNutritionDate}
                  onChange={e => setSelectedNutritionDate(e.target.value)}
                  className="rounded-xl border border-zinc-700 bg-[#22232a] px-3 py-2 text-xs font-bold text-white focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-athletic">
              <div>
                <span className="text-zinc-400 uppercase text-[10px] block">Total Calories</span>
                <span className="text-xl font-bold text-red-500">{dailyFoodData.totals.calories} kcal</span>
              </div>
              <div>
                <span className="text-zinc-400 uppercase text-[10px] block">Protein</span>
                <span className="text-xl font-bold text-white">{dailyFoodData.totals.protein}g</span>
              </div>
              <div>
                <span className="text-zinc-400 uppercase text-[10px] block">Carbs</span>
                <span className="text-xl font-bold text-zinc-300">{dailyFoodData.totals.carbs}g</span>
              </div>
              <div>
                <span className="text-zinc-400 uppercase text-[10px] block">Fat</span>
                <span className="text-xl font-bold text-zinc-300">{dailyFoodData.totals.fat}g</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#1a1b20] p-5 shadow-md">
            <h3 className="text-base font-bold uppercase font-athletic tracking-wide text-white pb-3 border-b border-zinc-800">
              Meals Logged for {selectedNutritionDate}
            </h3>

            <div className="mt-4 divide-y divide-zinc-800">
              {dailyFoodData.logs.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400 italic">
                  No food logs recorded for this date.
                </div>
              ) : (
                dailyFoodData.logs.map(l => (
                  <div key={l.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white uppercase font-athletic">{l.foodName}</span>
                        <span className="text-[10px] uppercase font-bold text-zinc-300 bg-[#22232a] border border-zinc-700 px-2 py-0.5 rounded">
                          {l.mealType}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-0.5">
                        {l.quantity} × {l.servingUnit}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold font-athletic text-red-500 text-sm block">
                        {l.calories} kcal
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {l.protein}g P • {l.carbs}g C • {l.fat}g F
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
