import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  Award,
  Flame,
  TrendingUp,
  Dumbbell,
  Calendar,
  Zap,
  Target,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Calculator,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { PersonalRecord, Exercise, MuscleGroup } from '../types';
import strengthBannerImage from '../assets/images/gym_motivation_card_1788767176568.jpg';

export const StrengthRecords: React.FC = () => {
  const { profile } = useAuth();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('ex-1');
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '3m' | '6m' | 'all'>('30d');
  const [progressionData, setProgressionData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'records' | 'calculator'>('records');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingRecordId, setEditingRecordId] = useState<string | undefined>(undefined);
  const [formExerciseId, setFormExerciseId] = useState<string>('');
  const [isCustomExercise, setIsCustomExercise] = useState<boolean>(false);
  const [formExerciseName, setFormExerciseName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<MuscleGroup>('Chest');
  const [formWeightKg, setFormWeightKg] = useState<number>(60);
  const [formReps, setFormReps] = useState<number>(8);
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // 1RM Quick Calculator States
  const [calcWeight, setCalcWeight] = useState<number>(80);
  const [calcReps, setCalcReps] = useState<number>(5);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [recData, exData] = await Promise.all([
        api.getPersonalRecords(),
        api.getExercises()
      ]);
      setRecords(recData.records || []);
      setExercises(exData.exercises || []);

      if (recData.records && recData.records.length > 0) {
        if (!selectedExerciseId || !exData.exercises.some(e => e.id === selectedExerciseId)) {
          setSelectedExerciseId(recData.records[0].exerciseId);
        }
      } else if (exData.exercises && exData.exercises.length > 0 && !selectedExerciseId) {
        setSelectedExerciseId(exData.exercises[0].id);
      }
    } catch (e) {
      console.error('Failed to load strength records:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProgression = async (exId: string, range: any) => {
    if (!exId) return;
    try {
      const data = await api.getStrengthProgression(exId, range);
      setProgressionData(data.history || []);
    } catch (e) {
      console.error('Failed to load progression data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedExerciseId) {
      loadProgression(selectedExerciseId, selectedRange);
    }
  }, [selectedExerciseId, selectedRange]);

  // Estimated 1RM calculator helper (Brzycki formula)
  const calculate1RM = (weight: number, reps: number): number => {
    if (weight <= 0 || reps <= 0) return 0;
    if (reps === 1) return weight;
    return Math.round((weight * (36 / Math.max(1, 37 - Math.min(30, reps)))) * 10) / 10;
  };

  // Open modal in ADD mode
  const handleOpenAddModal = (defaultExerciseId?: string) => {
    setModalMode('add');
    setEditingRecordId(undefined);
    setFormError(null);

    const defaultEx = exercises.find(e => e.id === defaultExerciseId) || exercises[0];
    if (defaultEx && defaultExerciseId !== 'custom') {
      setIsCustomExercise(false);
      setFormExerciseId(defaultEx.id);
      setFormExerciseName(defaultEx.name);
      setFormCategory(defaultEx.category);
      setFormWeightKg(60);
      setFormReps(8);
    } else {
      setIsCustomExercise(true);
      setFormExerciseId('');
      setFormExerciseName('');
      setFormCategory('Chest');
      setFormWeightKg(50);
      setFormReps(10);
    }
    setFormDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  // Open modal in EDIT mode
  const handleOpenEditModal = (pr: PersonalRecord) => {
    setModalMode('edit');
    setEditingRecordId(pr.id);
    setFormError(null);
    setFormExerciseId(pr.exerciseId);
    setFormExerciseName(pr.exerciseName);
    
    const matchedEx = exercises.find(e => e.id === pr.exerciseId);
    setFormCategory(matchedEx ? matchedEx.category : 'Chest');
    setIsCustomExercise(false);
    setFormWeightKg(pr.maxWeightKg);
    setFormReps(pr.maxRepsAtWeight);
    setFormDate(pr.achievedAt || new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  // Submit PR form
  const handleSavePR = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const finalExName = isCustomExercise ? formExerciseName.trim() : (formExerciseName || exercises.find(e => e.id === formExerciseId)?.name || '');
    if (!finalExName) {
      setFormError('Please enter or select an exercise name.');
      return;
    }

    if (!formWeightKg || formWeightKg <= 0) {
      setFormError('Please enter a valid weight greater than 0 kg.');
      return;
    }

    if (!formReps || formReps < 1) {
      setFormError('Please enter a valid number of reps (minimum 1).');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.savePersonalRecord({
        id: editingRecordId,
        exerciseId: isCustomExercise ? undefined : formExerciseId,
        exerciseName: finalExName,
        category: formCategory,
        maxWeightKg: Number(formWeightKg),
        maxRepsAtWeight: Math.round(Number(formReps)),
        achievedAt: formDate
      });

      setIsModalOpen(false);
      setSuccessToast(`Personal Record for "${res.record.exerciseName}" saved!`);
      setTimeout(() => setSuccessToast(null), 4000);

      await loadData();
      if (res.record.exerciseId) {
        setSelectedExerciseId(res.record.exerciseId);
        loadProgression(res.record.exerciseId, selectedRange);
      }
    } catch (err: any) {
      console.error('Error saving PR:', err);
      setFormError(err.message || 'Failed to save Personal Record.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete PR
  const handleDeletePR = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the Personal Record for "${name}"?`)) {
      return;
    }

    try {
      await api.deletePersonalRecord(id);
      setSuccessToast(`Personal Record for "${name}" deleted.`);
      setTimeout(() => setSuccessToast(null), 3000);
      await loadData();
    } catch (err) {
      console.error('Failed to delete PR:', err);
    }
  };

  const selectedExObj = exercises.find(e => e.id === selectedExerciseId) || {
    id: 'ex-1',
    name: 'Bench Press',
    category: 'Chest'
  };
  const currentPR = records.find(r => r.exerciseId === selectedExerciseId);

  const timeFilters: { id: '7d' | '30d' | '3m' | '6m' | 'all'; label: string }[] = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '3m', label: '3 Months' },
    { id: '6m', label: '6 Months' },
    { id: 'all', label: 'All Time' }
  ];

  // Calculated 1RM values for the calculator
  const calc1RM = calculate1RM(calcWeight, calcReps);
  const repMaxTable = [
    { percent: '100%', reps: '1 RM', weight: Math.round(calc1RM * 1.0) },
    { percent: '95%', reps: '2 RM', weight: Math.round(calc1RM * 0.95 * 10) / 10 },
    { percent: '90%', reps: '4 RM', weight: Math.round(calc1RM * 0.90 * 10) / 10 },
    { percent: '85%', reps: '6 RM', weight: Math.round(calc1RM * 0.85 * 10) / 10 },
    { percent: '80%', reps: '8 RM', weight: Math.round(calc1RM * 0.80 * 10) / 10 },
    { percent: '75%', reps: '10 RM', weight: Math.round(calc1RM * 0.75 * 10) / 10 },
    { percent: '70%', reps: '12 RM', weight: Math.round(calc1RM * 0.70 * 10) / 10 }
  ];

  return (
    <div id="strength-records-view" className="space-y-6 pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2.5 rounded-xl border border-red-900 bg-[#202328] px-4 py-3 text-sm font-bold text-white shadow-2xl animate-in fade-in slide-in-from-top-4">
          <Check className="h-5 w-5 text-[#E53935] stroke-[2.5]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Strength & Peak Performance Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2A2E35] bg-[#202328] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[190px] items-center">
          <div className="lg:col-span-7 p-6 sm:p-7 z-10 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#E53935]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#E53935] font-athletic">
                STRENGTH BENCHMARKS & MAX LIFTS
              </span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold font-athletic tracking-wide text-white uppercase">
              MEASURE YOUR POWER & PROGRESSION
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-300 font-medium max-w-lg leading-relaxed">
              Track personal records across compound lifts, monitor 1RM evolution over time, and establish progressive overload benchmarks.
            </p>
          </div>
          <div className="lg:col-span-5 h-48 sm:h-52 lg:h-full relative overflow-hidden bg-[#17191C]">
            <img
              src={strengthBannerImage}
              alt="Athlete strength training with weights"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2E35] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#E53935]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E53935] font-athletic">
              FITTRACK STRENGTH & PERSONAL RECORDS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase font-athletic tracking-wide text-white flex items-center gap-2.5 mt-0.5">
            <Award className="h-7 w-7 text-[#E53935]" />
            PERSONAL RECORDS (PRS)
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Track peak strength benchmarks, edit and log new records, monitor 1RM progression, and calculate rep maxes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="tab-toggle-calculator"
            onClick={() => setActiveTab(activeTab === 'records' ? 'calculator' : 'records')}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold font-athletic uppercase transition cursor-pointer ${
              activeTab === 'calculator'
                ? 'border-[#E53935] bg-[#E53935] text-white shadow-md'
                : 'border-[#2A2E35] bg-[#202328] text-zinc-300 hover:border-zinc-500 hover:text-white'
            }`}
          >
            <Calculator className="h-4 w-4 text-[#E53935]" />
            <span>{activeTab === 'calculator' ? 'View PR Cards' : '1RM Calculator'}</span>
          </button>

          <button
            id="btn-add-new-pr"
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-2 rounded-xl bg-[#E53935] hover:bg-red-600 px-4 py-2 text-xs font-bold font-athletic uppercase text-white shadow-md transition cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>+ Update / Record PR</span>
          </button>

          <span className="rounded-xl border border-red-900/60 bg-red-950/80 px-3.5 py-2 text-xs font-bold font-athletic uppercase text-red-400 shadow-md hidden md:inline-flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-[#E53935]" />
            {records.length} Verified PRs
          </span>
        </div>
      </div>

      {/* 1RM CALCULATOR TOOL SECTION (When active) */}
      {activeTab === 'calculator' && (
        <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-[#2A2E35] pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#E53935]" />
              <h3 className="text-lg font-bold uppercase font-athletic text-white">
                1RM & REP PERCENTAGE CALCULATOR (BRZYCKI FORMULA)
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-medium">Instant formula calculation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input Controls */}
            <div className="space-y-4 rounded-xl bg-[#2A2E35] p-4 border border-zinc-700">
              <div>
                <label className="block text-xs font-bold uppercase font-athletic text-zinc-300 mb-1">
                  Lift Weight (kg)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCalcWeight(Math.max(5, calcWeight - 5))}
                    className="rounded-lg bg-[#202328] border border-zinc-700 px-2.5 py-1.5 font-bold text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={calcWeight}
                    onChange={e => setCalcWeight(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#202328] px-3 py-1.5 text-center text-sm font-bold text-white focus:border-[#E53935] focus:outline-none"
                  />
                  <button
                    onClick={() => setCalcWeight(calcWeight + 5)}
                    className="rounded-lg bg-[#202328] border border-zinc-700 px-2.5 py-1.5 font-bold text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    +5
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase font-athletic text-zinc-300 mb-1">
                  Reps Completed
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCalcReps(Math.max(1, calcReps - 1))}
                    className="rounded-lg bg-[#202328] border border-zinc-700 px-2.5 py-1.5 font-bold text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={calcReps}
                    onChange={e => setCalcReps(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#202328] px-3 py-1.5 text-center text-sm font-bold text-white focus:border-[#E53935] focus:outline-none"
                  />
                  <button
                    onClick={() => setCalcReps(calcReps + 1)}
                    className="rounded-lg bg-[#202328] border border-zinc-700 px-2.5 py-1.5 font-bold text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    +1
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-700 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-athletic block">
                  Estimated One Rep Max (1RM)
                </span>
                <span className="text-3xl font-bold font-athletic text-[#E53935] mt-1 block">
                  {calc1RM} <span className="text-sm text-zinc-400">kg</span>
                </span>
              </div>
            </div>

            {/* Rep Max Table */}
            <div className="md:col-span-2 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-700 text-[11px] font-bold font-athletic uppercase text-zinc-400">
                    <th className="py-2 px-3">INTENSITY</th>
                    <th className="py-2 px-3">ESTIMATED REPS</th>
                    <th className="py-2 px-3 text-right">TARGET WEIGHT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 font-medium">
                  {repMaxTable.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#2A2E35]">
                      <td className="py-2 px-3 font-bold text-white">{item.percent}</td>
                      <td className="py-2 px-3 text-zinc-400">{item.reps}</td>
                      <td className="py-2 px-3 text-right font-bold text-[#E53935] font-athletic text-sm">
                        {item.weight} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Selected Exercise Progression Chart Card */}
      <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-6 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E53935] font-athletic">
                STRENGTH PROGRESSION GRAPH
              </span>
              <span className="text-[10px] bg-[#2A2E35] text-zinc-300 font-bold px-2 py-0.5 rounded border border-zinc-700 uppercase font-athletic">
                {selectedExObj.category}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <select
                id="strength-exercise-dropdown"
                value={selectedExerciseId}
                onChange={e => setSelectedExerciseId(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-[#2A2E35] px-3.5 py-1.5 text-base font-bold text-white font-athletic uppercase focus:border-[#E53935] focus:outline-none shadow-xs cursor-pointer"
              >
                {exercises.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.category})
                  </option>
                ))}
              </select>

              {currentPR && (
                <button
                  id="btn-edit-current-pr"
                  onClick={() => handleOpenEditModal(currentPR)}
                  className="flex items-center gap-1 text-xs font-bold font-athletic uppercase text-red-300 hover:text-white bg-red-950/80 hover:bg-red-900 border border-red-800 rounded-lg px-2.5 py-1.5 transition cursor-pointer"
                  title="Edit this record"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Record</span>
                </button>
              )}
            </div>

            {currentPR ? (
              <p className="text-xs text-zinc-400 mt-1.5 flex flex-wrap items-center gap-2">
                <span>Current Peak: <strong className="text-[#E53935] font-bold">{currentPR.maxWeightKg} kg × {currentPR.maxRepsAtWeight} reps</strong></span>
                <span>•</span>
                <span>Est. 1RM: <strong className="text-white font-bold">{currentPR.estimated1RM} kg</strong></span>
                <span>•</span>
                <span>Achieved: <strong className="text-zinc-300">{currentPR.achievedAt}</strong></span>
              </p>
            ) : (
              <p className="text-xs text-zinc-500 mt-1.5 italic">
                No verified PR recorded yet for {selectedExObj.name}. Click "Update / Record PR" to log your first benchmark!
              </p>
            )}
          </div>

          {/* Time Range Filters */}
          <div className="flex items-center gap-1 bg-[#2A2E35] border border-zinc-700 rounded-xl p-1 shrink-0">
            {timeFilters.map(tf => (
              <button
                key={tf.id}
                id={`time-filter-${tf.id}`}
                onClick={() => setSelectedRange(tf.id)}
                className={`rounded-lg px-3 py-1 text-[11px] font-bold font-athletic uppercase transition cursor-pointer ${
                  selectedRange === tf.id
                    ? 'bg-[#E53935] text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Chart Area */}
        <div className="h-64 w-full pt-4">
          {progressionData.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-xl bg-[#2A2E35] border border-dashed border-zinc-700 p-6 text-center">
              <Dumbbell className="h-8 w-8 text-zinc-500 mb-2" />
              <p className="text-xs font-bold text-zinc-300 uppercase font-athletic">No workout session points in this range</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Log a workout or click below to manually add a Personal Record for {selectedExObj.name}.
              </p>
              <button
                onClick={() => handleOpenAddModal(selectedExerciseId)}
                className="mt-3 rounded-lg bg-[#E53935] hover:bg-red-600 px-3.5 py-1.5 text-xs font-bold font-athletic uppercase text-white transition cursor-pointer"
              >
                + Record Benchmark for {selectedExObj.name}
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressionData}>
                <defs>
                  <linearGradient id="strengthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E53935" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E53935" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2E35" />
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} domain={['auto', 'auto']} unit=" kg" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#202328',
                    borderColor: '#2A2E35',
                    borderRadius: '12px',
                    color: '#ffffff',
                    boxShadow: '0 8px 16px -1px rgb(0 0 0 / 0.7)',
                    fontSize: '12px'
                  }}
                  formatter={(value: any, name: string) => [
                    `${value} kg`,
                    name === 'weightKg' ? 'Top Working Set' : 'Estimated 1RM'
                  ]}
                  labelFormatter={(label: any) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="weightKg"
                  stroke="#E53935"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#strengthGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="estimated1RM"
                  stroke="#ff6b6b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-zinc-400 border-t border-[#2A2E35] pt-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E53935]" />
              Top Working Weight (kg)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />
              Estimated 1RM (Brzycki formula)
            </span>
          </div>
          <span className="italic text-zinc-500">Click any card below to graph or edit its history</span>
        </div>
      </div>

      {/* Grid of All Personal Records (Interactive, Editable) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold uppercase font-athletic tracking-wide text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-[#E53935]" />
            EXERCISE BENCHMARKS & BESTS
          </h3>
          <span className="text-xs text-zinc-400 font-athletic uppercase">
            {records.length} Active Records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map(ex => {
            const pr = records.find(r => r.exerciseId === ex.id);
            const isSelected = selectedExerciseId === ex.id;
            const progressDelta = pr?.previousBestWeightKg && pr.previousBestWeightKg < pr.maxWeightKg
              ? pr.maxWeightKg - pr.previousBestWeightKg
              : 0;

            return (
              <div
                key={ex.id}
                id={`strength-card-${ex.id}`}
                className={`rounded-2xl border p-5 transition shadow-md flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#E53935] bg-[#2d1e21] ring-1 ring-[#E53935]'
                    : 'border-[#2A2E35] bg-[#202328] hover:border-zinc-600'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => setSelectedExerciseId(ex.id)}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <Dumbbell className={`h-4 w-4 ${isSelected ? 'text-[#E53935]' : 'text-zinc-500'}`} />
                      <span className="text-sm font-bold uppercase font-athletic text-white hover:text-[#E53935] transition">
                        {ex.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 bg-[#2A2E35] px-2 py-0.5 rounded border border-zinc-700">
                      {ex.category}
                    </span>
                  </div>

                  {/* PR Details */}
                  {pr ? (
                    <div className="mt-3 space-y-2">
                      <div
                        onClick={() => setSelectedExerciseId(ex.id)}
                        className="flex items-baseline justify-between cursor-pointer"
                      >
                        <div>
                          <span className="text-2xl font-bold font-athletic text-[#E53935]">
                            {pr.maxWeightKg} <span className="text-xs text-zinc-400 font-normal">kg</span>
                          </span>
                          <span className="text-xs text-zinc-300 ml-1.5 font-bold">× {pr.maxRepsAtWeight} reps</span>
                        </div>
                        <span className="text-xs font-bold text-zinc-300 font-athletic bg-[#2A2E35] px-2 py-1 rounded-lg border border-zinc-700">
                          1RM: {pr.estimated1RM} kg
                        </span>
                      </div>

                      <div className="border-t border-[#2A2E35] pt-2 flex items-center justify-between text-[11px] text-zinc-400">
                        <span>
                          Prev: {pr.previousBestWeightKg ? `${pr.previousBestWeightKg}kg × ${pr.previousBestReps}` : 'Initial'}
                        </span>
                        {progressDelta > 0 && (
                          <span className="text-red-400 font-bold bg-red-950/80 border border-red-900 px-1.5 py-0.5 rounded text-[10px]">
                            +{progressDelta} kg Gain 🔥
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                        <span>Date: <strong className="text-zinc-300">{pr.achievedAt}</strong></span>
                        <span>Sessions: {pr.totalSessions || 1}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 py-4 text-center text-xs text-zinc-500 italic bg-[#2A2E35] rounded-xl border border-dashed border-zinc-700">
                      No benchmark logged yet. Click below to establish your PR!
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-[#2A2E35] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedExerciseId(ex.id)}
                    className={`text-[11px] font-bold font-athletic uppercase transition cursor-pointer ${
                      isSelected ? 'text-[#E53935] underline' : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {isSelected ? '● Selected on Graph' : 'View Graph →'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {pr ? (
                      <>
                        <button
                          id={`btn-edit-pr-${ex.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(pr);
                          }}
                          className="flex items-center gap-1.5 rounded-lg bg-[#E53935] hover:bg-red-600 px-3 py-1.5 text-xs font-bold font-athletic uppercase text-white shadow-xs transition cursor-pointer"
                          title="Log PR / Edit / Update"
                        >
                          <Edit2 className="h-3.5 w-3.5 stroke-[2]" />
                          <span>+ LOG PR / EDIT / UPDATE</span>
                        </button>
                        <button
                          id={`btn-delete-pr-${ex.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePR(pr.id, pr.exerciseName);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2A2E35] transition cursor-pointer"
                          title="Delete PR"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        id={`btn-log-benchmark-${ex.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddModal(ex.id);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-[#E53935] hover:bg-red-600 px-3 py-1.5 text-xs font-bold font-athletic uppercase text-white shadow-xs transition cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>+ LOG PR / EDIT / UPDATE</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Add Custom Exercise / PR Card */}
          <div
            id="card-add-custom-pr"
            onClick={() => handleOpenAddModal('custom')}
            className="rounded-2xl border-2 border-dashed border-zinc-700 bg-[#202328] hover:border-[#E53935] hover:bg-[#2A2E35] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[190px]"
          >
            <div className="h-10 w-10 rounded-xl bg-red-950/80 border border-red-900 flex items-center justify-center text-[#E53935] mb-2">
              <Plus className="h-5 w-5 stroke-[2.5]" />
            </div>
            <h4 className="text-sm font-bold uppercase font-athletic text-white">
              + ADD NEW EXERCISE / PR
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-[200px]">
              Record a custom movement or benchmark lift with instant 1RM calculation.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULLY OPAQUE, SOLID MODAL: EDIT / UPDATE / ADD PERSONAL RECORD */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div
          id="pr-form-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 overflow-y-auto"
          onClick={() => !isSaving && setIsModalOpen(false)}
        >
          <div
            id="pr-form-modal-container"
            className="relative w-full max-w-lg rounded-2xl border border-[#2A2E35] bg-[#202328] p-6 sm:p-7 shadow-2xl text-white my-8"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#2A2E35]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-950/80 border border-red-900 text-[#E53935]">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase font-athletic text-white">
                    {modalMode === 'edit' ? 'EDIT PERSONAL RECORD' : 'LOG NEW PERSONAL RECORD'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Set your top weight and reps. 1RM is estimated automatically.
                  </p>
                </div>
              </div>

              <button
                id="btn-close-pr-modal"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2A2E35] transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mt-4 rounded-xl border border-red-900 bg-red-950/80 p-3 text-xs font-bold text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#E53935]" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSavePR} className="mt-4 space-y-4">
              {/* Exercise Selector or Custom Exercise */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase font-athletic text-zinc-300">
                    Exercise Name
                  </label>
                  {modalMode === 'add' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomExercise(!isCustomExercise);
                        setFormExerciseName('');
                      }}
                      className="text-[11px] font-bold font-athletic uppercase text-[#E53935] hover:underline cursor-pointer"
                    >
                      {isCustomExercise ? '← Choose Existing Exercise' : '+ Create Custom Exercise'}
                    </button>
                  )}
                </div>

                {isCustomExercise ? (
                  <div className="space-y-2">
                    <input
                      id="pr-custom-exercise-input"
                      type="text"
                      required
                      placeholder="e.g. Incline Dumbbell Press, Hack Squat"
                      value={formExerciseName}
                      onChange={e => setFormExerciseName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-3.5 py-2 text-xs font-bold text-white placeholder-zinc-500 focus:border-[#E53935] focus:outline-none"
                    />

                    <div>
                      <label className="block text-[10px] font-bold uppercase font-athletic text-zinc-400 mb-1">
                        Muscle Group / Category
                      </label>
                      <select
                        value={formCategory}
                        onChange={e => setFormCategory(e.target.value as MuscleGroup)}
                        className="w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-3.5 py-2 text-xs font-bold text-white focus:border-[#E53935] focus:outline-none cursor-pointer"
                      >
                        <option value="Chest">Chest</option>
                        <option value="Back">Back</option>
                        <option value="Legs">Legs</option>
                        <option value="Shoulders">Shoulders</option>
                        <option value="Arms">Arms</option>
                        <option value="Core">Core</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <select
                    id="pr-exercise-select"
                    value={formExerciseId}
                    onChange={e => {
                      setFormExerciseId(e.target.value);
                      const ex = exercises.find(x => x.id === e.target.value);
                      if (ex) {
                        setFormExerciseName(ex.name);
                        setFormCategory(ex.category);
                      }
                    }}
                    className="w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-3.5 py-2 text-xs font-bold text-white focus:border-[#E53935] focus:outline-none uppercase font-athletic cursor-pointer"
                  >
                    {exercises.map(ex => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.category})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Weight (kg) Stepper & Input */}
              <div>
                <label className="block text-xs font-bold uppercase font-athletic text-zinc-300 mb-1">
                  Peak Weight (kg)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormWeightKg(Math.max(0, Math.round((formWeightKg - 5) * 10) / 10))}
                    className="rounded-lg bg-[#2A2E35] hover:bg-zinc-700 border border-zinc-700 px-2.5 py-2 text-xs font-bold font-athletic text-zinc-300 cursor-pointer"
                  >
                    -5kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormWeightKg(Math.max(0, Math.round((formWeightKg - 2.5) * 10) / 10))}
                    className="rounded-lg bg-[#2A2E35] hover:bg-zinc-700 border border-zinc-700 px-2.5 py-2 text-xs font-bold font-athletic text-zinc-300 cursor-pointer"
                  >
                    -2.5kg
                  </button>
                  <input
                    id="pr-weight-input"
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={formWeightKg}
                    onChange={e => setFormWeightKg(parseFloat(e.target.value) || 0)}
                    className="flex-1 rounded-xl border border-zinc-700 bg-[#2A2E35] px-3.5 py-2 text-center text-sm font-bold text-white focus:border-[#E53935] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setFormWeightKg(Math.round((formWeightKg + 2.5) * 10) / 10)}
                    className="rounded-lg bg-[#2A2E35] hover:bg-zinc-700 border border-zinc-700 px-2.5 py-2 text-xs font-bold font-athletic text-zinc-300 cursor-pointer"
                  >
                    +2.5kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormWeightKg(Math.round((formWeightKg + 5) * 10) / 10)}
                    className="rounded-lg bg-[#2A2E35] hover:bg-zinc-700 border border-zinc-700 px-2.5 py-2 text-xs font-bold font-athletic text-zinc-300 cursor-pointer"
                  >
                    +5kg
                  </button>
                </div>
              </div>

              {/* Reps Stepper & Input */}
              <div>
                <label className="block text-xs font-bold uppercase font-athletic text-zinc-300 mb-1">
                  Reps at Peak Weight
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormReps(Math.max(1, formReps - 1))}
                    className="rounded-lg bg-[#2A2E35] hover:bg-zinc-700 border border-zinc-700 px-3 py-2 text-xs font-bold font-athletic text-zinc-300 cursor-pointer"
                  >
                    -1 Rep
                  </button>
                  <input
                    id="pr-reps-input"
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formReps}
                    onChange={e => setFormReps(parseInt(e.target.value) || 1)}
                    className="flex-1 rounded-xl border border-zinc-700 bg-[#2A2E35] px-3.5 py-2 text-center text-sm font-bold text-white focus:border-[#E53935] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setFormReps(formReps + 1)}
                    className="rounded-lg bg-[#2A2E35] hover:bg-zinc-700 border border-zinc-700 px-3 py-2 text-xs font-bold font-athletic text-zinc-300 cursor-pointer"
                  >
                    +1 Rep
                  </button>
                </div>
              </div>

              {/* Date Achieved */}
              <div>
                <label className="block text-xs font-bold uppercase font-athletic text-zinc-300 mb-1">
                  Date Achieved
                </label>
                <input
                  id="pr-date-input"
                  type="date"
                  required
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-3.5 py-2 text-xs font-bold text-white focus:border-[#E53935] focus:outline-none cursor-pointer"
                />
              </div>

              {/* Dynamic 1RM Calculation Preview Banner */}
              <div className="rounded-xl bg-red-950/80 border border-red-900 p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-300 font-athletic block">
                    Estimated 1RM (Brzycki)
                  </span>
                  <span className="text-xl font-bold font-athletic text-[#E53935]">
                    {calculate1RM(formWeightKg, formReps)} kg
                  </span>
                </div>

                <div className="text-right text-[11px] text-zinc-400">
                  <span>Formula: <strong className="text-white">{formWeightKg}kg × {formReps} reps</strong></span>
                  <span className="block text-[10px] text-zinc-500 font-medium">Discipline beats motivation</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="rounded-xl border border-zinc-700 bg-[#2A2E35] px-4 py-2.5 text-xs font-bold font-athletic uppercase text-zinc-300 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-pr-submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-[#E53935] hover:bg-red-600 px-6 py-2.5 text-xs font-bold font-athletic uppercase text-white shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[2.5]" />
                      <span>{modalMode === 'edit' ? 'Update PR' : 'Save Personal Record'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
