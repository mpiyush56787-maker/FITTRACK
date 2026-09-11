import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import confetti from 'canvas-confetti';
import {
  Dumbbell,
  Plus,
  Trash2,
  Copy,
  Clock,
  CheckCircle2,
  Flame,
  Award,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  X,
  FileText,
  Info,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Search,
  BookOpen,
  History,
  Timer,
  Zap,
  Volume2,
  VolumeX,
  Check,
  Edit2
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
import { Exercise, WorkoutSet, PersonalRecord, Workout, MuscleGroup } from '../types';
import workoutTrainingBannerImage from '../assets/images/workout_training_banner_1788767970109.jpg';

interface WorkoutLoggerProps {
  onWorkoutSaved?: () => void;
  onNavigate?: (tab: string) => void;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ onWorkoutSaved, onNavigate }) => {
  const { profile } = useAuth();

  // Navigation Sub-tab
  const [activeTab, setActiveTab] = useState<'logger' | 'history' | 'library' | 'progress' | 'prs'>('logger');

  // Exercise & PR Data
  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [previousWorkouts, setPreviousWorkouts] = useState<Workout[]>([]);
  const [workoutStats, setWorkoutStats] = useState<{
    totalWorkouts: number;
    workoutStreak: number;
    totalSets: number;
    totalPRs: number;
    mostTrainedExercise: string;
    totalVolumeKg: number;
  }>({
    totalWorkouts: 0,
    workoutStreak: 0,
    totalSets: 0,
    totalPRs: 0,
    mostTrainedExercise: 'Bench Press',
    totalVolumeKg: 0
  });

  // Active Session State
  const [workoutName, setWorkoutName] = useState<string>('Push Hypertrophy');
  const [workoutDate, setWorkoutDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [notes, setNotes] = useState<string>('');

  // Active session exercises with sets
  const [activeSessionExercises, setActiveSessionExercises] = useState<{
    exercise: Exercise;
    sets: { id: string; setNumber: number; weightKg: number; reps: number; isWarmup?: boolean; completed?: boolean }[];
    notes?: string;
  }[]>([
    {
      exercise: { id: 'ex-1', name: 'Bench Press', category: 'Chest', equipment: 'Barbell', primaryMuscle: 'Pectoralis Major' },
      sets: [
        { id: 'set-1', setNumber: 1, weightKg: 60, reps: 10, completed: true },
        { id: 'set-2', setNumber: 2, weightKg: 65, reps: 8, completed: true },
        { id: 'set-3', setNumber: 3, weightKg: 70, reps: 6, completed: false }
      ]
    },
    {
      exercise: { id: 'ex-12', name: 'Shoulder Press', category: 'Shoulders', equipment: 'Barbell', primaryMuscle: 'Anterior Deltoid' },
      sets: [
        { id: 'set-4', setNumber: 1, weightKg: 40, reps: 10, completed: false },
        { id: 'set-5', setNumber: 2, weightKg: 42.5, reps: 8, completed: false },
        { id: 'set-6', setNumber: 3, weightKg: 45, reps: 6, completed: false }
      ]
    }
  ]);

  // Exercise Picker Modal
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('All');

  // Custom Exercise Modal
  const [isNewExerciseModalOpen, setIsNewExerciseModalOpen] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState<MuscleGroup>('Chest');
  const [newExEquipment, setNewExEquipment] = useState<any>('Barbell');

  // Rest Timer State
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const [initialRestDuration, setInitialRestDuration] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Workout Completion & Summary Modal State
  const [completedWorkoutSummary, setCompletedWorkoutSummary] = useState<{
    name: string;
    date: string;
    durationMinutes: number;
    totalVolumeKg: number;
    totalSets: number;
    totalExercises: number;
    exerciseNames: string[];
    newPRs: PersonalRecord[];
  } | null>(null);
  const [isWorkoutCompletedModalOpen, setIsWorkoutCompletedModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // History Expanded State
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  // Keyboard accessibility for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isWorkoutCompletedModalOpen) {
          handleCloseCompletionModal('workout');
        } else if (isExercisePickerOpen) {
          setIsExercisePickerOpen(false);
        } else if (isNewExerciseModalOpen) {
          setIsNewExerciseModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWorkoutCompletedModalOpen, isExercisePickerOpen, isNewExerciseModalOpen]);

  // Strength Progression Sub-tab State
  const [selectedProgressionExerciseId, setSelectedProgressionExerciseId] = useState<string>('ex-1');
  const [progressionRange, setProgressionRange] = useState<'7d' | '30d' | '3m' | '6m' | 'all'>('30d');
  const [progressionChartData, setProgressionChartData] = useState<any[]>([]);

  // Sound Synthesizer via Web Audio API
  const playGymBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  // Initial Data Fetch
  const loadAllData = async () => {
    try {
      const [exData, prData, wData, sData] = await Promise.all([
        api.getExercises(),
        api.getPersonalRecords(),
        api.getWorkouts(),
        api.getWorkoutStats().catch(() => ({ stats: null }))
      ]);

      setExercisesList(exData.exercises || []);
      setPersonalRecords(prData.records || []);
      setPreviousWorkouts(wData.workouts || []);

      if (sData?.stats) {
        setWorkoutStats(sData.stats);
      } else {
        calculateLocalStats(wData.workouts || [], prData.records || []);
      }

      if (wData.workouts && wData.workouts.length > 0 && !expandedWorkoutId) {
        setExpandedWorkoutId(wData.workouts[0].id);
      }
    } catch (err) {
      console.error('Failed to load workout data:', err);
    }
  };

  const calculateLocalStats = (wList: Workout[], prList: PersonalRecord[]) => {
    let totalSets = 0;
    let totalVol = 0;
    const exCounts: Record<string, number> = {};

    for (const w of wList) {
      totalVol += (w.totalVolumeKg || 0);
      for (const s of w.sets) {
        totalSets++;
        exCounts[s.exerciseName] = (exCounts[s.exerciseName] || 0) + 1;
      }
    }

    let mostTrained = 'Bench Press';
    let maxC = 0;
    for (const [name, count] of Object.entries(exCounts)) {
      if (count > maxC) {
        maxC = count;
        mostTrained = name;
      }
    }

    setWorkoutStats({
      totalWorkouts: wList.length,
      workoutStreak: wList.length > 0 ? 4 : 0,
      totalSets,
      totalPRs: prList.length,
      mostTrainedExercise: mostTrained,
      totalVolumeKg: totalVol
    });
  };

  const loadStrengthProgression = async (exId: string, range: any) => {
    try {
      const data = await api.getStrengthProgression(exId, range);
      setProgressionChartData(data.history || []);
    } catch (err) {
      console.error('Failed to load strength progression:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (selectedProgressionExerciseId) {
      loadStrengthProgression(selectedProgressionExerciseId, progressionRange);
    }
  }, [selectedProgressionExerciseId, progressionRange]);

  // Rest Timer countdown interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && restSecondsRemaining !== null && restSecondsRemaining > 0) {
      interval = setInterval(() => {
        setRestSecondsRemaining(prev => {
          if (prev !== null && prev > 1) {
            return prev - 1;
          }
          if (prev === 1) {
            playGymBeep();
            setIsTimerRunning(false);
            return 0;
          }
          return 0;
        });
      }, 1000);
    } else if (restSecondsRemaining === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, restSecondsRemaining]);

  const startRestTimer = (seconds: number) => {
    setInitialRestDuration(seconds);
    setRestSecondsRemaining(seconds);
    setIsTimerRunning(true);
  };

  // Workout Session Handlers
  const handleAddExerciseToWorkout = (ex: Exercise) => {
    const existingPR = personalRecords.find(p => p.exerciseId === ex.id);
    const defaultWeight = existingPR ? Math.max(20, Math.round(existingPR.maxWeightKg * 0.75 / 2.5) * 2.5) : 50;

    setActiveSessionExercises(prev => [
      ...prev,
      {
        exercise: ex,
        sets: [
          { id: `set-${Date.now()}-1`, setNumber: 1, weightKg: defaultWeight, reps: 10, completed: false },
          { id: `set-${Date.now()}-2`, setNumber: 2, weightKg: defaultWeight + 2.5, reps: 8, completed: false },
          { id: `set-${Date.now()}-3`, setNumber: 3, weightKg: defaultWeight + 5, reps: 6, completed: false }
        ]
      }
    ]);
    setIsExercisePickerOpen(false);
  };

  const handleRemoveExercise = (index: number) => {
    setActiveSessionExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSet = (exIndex: number) => {
    setActiveSessionExercises(prev => {
      const copy = [...prev];
      const exObj = copy[exIndex];
      const lastSet = exObj.sets[exObj.sets.length - 1];
      const newSetNumber = exObj.sets.length + 1;
      exObj.sets.push({
        id: `set-${Date.now()}-${newSetNumber}`,
        setNumber: newSetNumber,
        weightKg: lastSet ? lastSet.weightKg : 50,
        reps: lastSet ? lastSet.reps : 10,
        completed: false
      });
      return copy;
    });
  };

  const handleDuplicateSet = (exIndex: number, setIndex: number) => {
    setActiveSessionExercises(prev => {
      const copy = [...prev];
      const exObj = copy[exIndex];
      const targetSet = exObj.sets[setIndex];
      exObj.sets.splice(setIndex + 1, 0, {
        id: `set-${Date.now()}-${exObj.sets.length + 1}`,
        setNumber: exObj.sets.length + 1,
        weightKg: targetSet.weightKg,
        reps: targetSet.reps,
        isWarmup: targetSet.isWarmup,
        completed: false
      });
      exObj.sets.forEach((s, idx) => (s.setNumber = idx + 1));
      return copy;
    });
  };

  const handleRemoveSet = (exIndex: number, setIndex: number) => {
    setActiveSessionExercises(prev => {
      const copy = [...prev];
      if (copy[exIndex].sets.length <= 1) {
        return copy;
      }
      copy[exIndex].sets.splice(setIndex, 1);
      copy[exIndex].sets.forEach((s, idx) => (s.setNumber = idx + 1));
      return copy;
    });
  };

  const handleUpdateSetField = (
    exIndex: number,
    setIndex: number,
    field: 'weightKg' | 'reps' | 'isWarmup' | 'completed',
    value: any
  ) => {
    setActiveSessionExercises(prev => {
      const copy = [...prev];
      copy[exIndex].sets[setIndex] = {
        ...copy[exIndex].sets[setIndex],
        [field]: value
      };
      return copy;
    });

    if (field === 'completed' && value === true) {
      startRestTimer(initialRestDuration);
    }
  };

  const adjustSetWeight = (exIndex: number, setIndex: number, delta: number) => {
    setActiveSessionExercises(prev => {
      const copy = [...prev];
      const cur = copy[exIndex].sets[setIndex].weightKg || 0;
      const next = Math.max(0, Math.round((cur + delta) * 10) / 10);
      copy[exIndex].sets[setIndex].weightKg = next;
      return copy;
    });
  };

  const adjustSetReps = (exIndex: number, setIndex: number, delta: number) => {
    setActiveSessionExercises(prev => {
      const copy = [...prev];
      const cur = copy[exIndex].sets[setIndex].reps || 0;
      const next = Math.max(1, cur + delta);
      copy[exIndex].sets[setIndex].reps = next;
      return copy;
    });
  };

  const isSetPR = (exerciseId: string, weightKg: number, reps: number) => {
    if (weightKg <= 0 || reps <= 0) return false;
    const existing = personalRecords.find(p => p.exerciseId === exerciseId);
    if (!existing) return weightKg >= 20;
    return weightKg > existing.maxWeightKg || (weightKg === existing.maxWeightKg && reps > existing.maxRepsAtWeight);
  };

  const handleCreateCustomExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    try {
      const res = await api.createExercise({
        name: newExName.trim(),
        category: newExCategory,
        equipment: newExEquipment,
        primaryMuscle: newExCategory,
        instructions: 'Perform with strict form, controlled tempo, and steady progressive overload.'
      });

      setIsNewExerciseModalOpen(false);
      setNewExName('');
      await loadAllData();
      handleAddExerciseToWorkout(res.exercise);
    } catch (err) {
      console.error('Failed to create exercise:', err);
    }
  };

  const handleCloseCompletionModal = (destination: 'workout' | 'dashboard' | 'history' | 'prs' = 'workout') => {
    setIsWorkoutCompletedModalOpen(false);
    if (destination === 'dashboard') {
      if (onNavigate) {
        onNavigate('dashboard');
      }
    } else if (destination === 'history') {
      setActiveTab('history');
      if (onNavigate) onNavigate('history');
    } else if (destination === 'prs') {
      setActiveTab('prs');
      if (onNavigate) onNavigate('strength');
    } else {
      // Default: Back to Workout
      setActiveTab('logger');
      // Reset completed checkmarks for next fresh session
      setActiveSessionExercises(prev =>
        prev.map(ex => ({
          ...ex,
          sets: ex.sets.map(s => ({ ...s, completed: false }))
        }))
      );
    }
  };

  const handleSaveWorkout = async () => {
    if (activeSessionExercises.length === 0) return;
    setIsSaving(true);

    try {
      const flattenedSets: WorkoutSet[] = [];
      let totalVolume = 0;
      for (const exObj of activeSessionExercises) {
        for (const s of exObj.sets) {
          const w = Number(s.weightKg) || 0;
          const r = Number(s.reps) || 0;
          totalVolume += w * r;
          flattenedSets.push({
            id: s.id,
            exerciseId: exObj.exercise.id,
            exerciseName: exObj.exercise.name,
            setNumber: s.setNumber,
            weightKg: w,
            reps: r,
            isWarmup: s.isWarmup,
            notes: exObj.notes
          });
        }
      }

      const exerciseNames = Array.from(new Set(activeSessionExercises.map(e => e.exercise.name)));

      const res = await api.logWorkout({
        name: workoutName || 'Athletic Training Session',
        date: workoutDate,
        durationMinutes: Number(durationMinutes) || 45,
        notes,
        sets: flattenedSets
      });

      setIsSaving(false);
      await loadAllData();

      // Store summary of this saved workout
      setCompletedWorkoutSummary({
        name: workoutName || 'Athletic Training Session',
        date: workoutDate,
        durationMinutes: Number(durationMinutes) || 45,
        totalVolumeKg: totalVolume,
        totalSets: flattenedSets.length,
        totalExercises: activeSessionExercises.length,
        exerciseNames,
        newPRs: res.newPRs || []
      });

      // Always open the completion modal overlay
      setIsWorkoutCompletedModalOpen(true);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.55 }
        });
      } catch (e) {
        // confetti fallback
      }

      if (onWorkoutSaved) onWorkoutSaved();
    } catch (err) {
      console.error('Failed to save workout:', err);
      setIsSaving(false);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this workout log?')) return;
    try {
      await api.deleteWorkout(id);
      await loadAllData();
    } catch (e) {
      console.error('Failed to delete workout:', e);
    }
  };

  const filteredExercises = exercisesList.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesMuscle = selectedMuscleFilter === 'All' || ex.category === selectedMuscleFilter;
    return matchesSearch && matchesMuscle;
  });

  const muscleCategories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  const quickRoutineTemplates = [
    { name: 'Push Hypertrophy', exercises: ['Bench Press', 'Incline Bench Press', 'Shoulder Press', 'Lateral Raise', 'Tricep Pushdown'] },
    { name: 'Pull & Back Power', exercises: ['Deadlift', 'Lat Pulldown', 'Barbell Row', 'Seated Cable Row', 'Bicep Curl', 'Hammer Curl'] },
    { name: 'Leg & Glute Dominance', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Leg Extension', 'Calf Raise'] },
    { name: 'Upper Body Power', exercises: ['Bench Press', 'Barbell Row', 'Shoulder Press', 'Lat Pulldown', 'Bicep Curl'] }
  ];

  const applyRoutineTemplate = (template: { name: string; exercises: string[] }) => {
    setWorkoutName(template.name);
    const newSession: typeof activeSessionExercises = [];

    for (const exName of template.exercises) {
      const match = exercisesList.find(e => e.name.toLowerCase() === exName.toLowerCase());
      if (match) {
        const pr = personalRecords.find(p => p.exerciseId === match.id);
        const baseW = pr ? Math.max(20, Math.round(pr.maxWeightKg * 0.75 / 2.5) * 2.5) : 50;
        newSession.push({
          exercise: match,
          sets: [
            { id: `set-${Date.now()}-${match.id}-1`, setNumber: 1, weightKg: baseW, reps: 10, completed: false },
            { id: `set-${Date.now()}-${match.id}-2`, setNumber: 2, weightKg: baseW + 2.5, reps: 8, completed: false },
            { id: `set-${Date.now()}-${match.id}-3`, setNumber: 3, weightKg: baseW + 5, reps: 6, completed: false }
          ]
        });
      }
    }

    if (newSession.length > 0) {
      setActiveSessionExercises(newSession);
    }
  };

  const selectedProgressionExObj = exercisesList.find(e => e.id === selectedProgressionExerciseId) || {
    id: 'ex-1',
    name: 'Bench Press',
    category: 'Chest'
  };
  const selectedExPR = personalRecords.find(r => r.exerciseId === selectedProgressionExerciseId);

  const timeFilterList: { id: '7d' | '30d' | '3m' | '6m' | 'all'; label: string }[] = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '3m', label: '3 Months' },
    { id: '6m', label: '6 Months' },
    { id: 'all', label: 'All Time' }
  ];

  return (
    <div id="workout-tracker-root" className="space-y-6 pb-20">
      {/* Professional Gym Training Photography Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2A2E35] bg-[#202328] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[200px] items-center">
          <div className="lg:col-span-7 p-6 sm:p-7 z-10 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#E53935]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#E53935] font-athletic">
                STRENGTH & HYPERTROPHY PROTOCOL
              </span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold font-athletic tracking-wide text-white uppercase">
              TRACK EVERY SET. CRUSH EVERY PR.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-300 font-medium max-w-lg leading-relaxed">
              Log real-time sets, weights, and reps. Calculate estimated 1RM, maintain progressive overload, and preserve training history.
            </p>
          </div>
          <div className="lg:col-span-5 h-48 sm:h-52 lg:h-full relative overflow-hidden bg-[#17191C]">
            <img
              src={workoutTrainingBannerImage}
              alt="Athlete performing heavy gym workout"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* 1. TOP ATHLETIC WORKOUT HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2E35] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#E53935]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E53935] font-athletic">
              FITTRACK STRENGTH & HYPERTROPHY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase font-athletic tracking-wide text-white flex items-center gap-2.5 mt-0.5">
            <Dumbbell className="h-7 w-7 text-[#E53935]" />
            WORKOUT & STRENGTH TRACKER
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Build sessions, track set-by-set weights & reps, monitor rest intervals, and crush Personal Records.
          </p>
        </div>

        {/* Floating / Compact Rest Timer Quick Control */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 bg-[#202328] border border-[#2A2E35] rounded-2xl p-2.5 shadow-md w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-[#E53935]" />
            <span className="text-[11px] font-bold uppercase font-athletic text-zinc-300">Rest:</span>
          </div>

          <div className="flex items-center gap-1">
            {[30, 60, 90, 120].map(sec => (
              <button
                key={sec}
                id={`rest-preset-btn-${sec}`}
                onClick={() => startRestTimer(sec)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold font-athletic uppercase transition cursor-pointer ${
                  initialRestDuration === sec && isTimerRunning
                    ? 'bg-[#E53935] text-white shadow-xs'
                    : 'bg-[#2A2E35] border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {restSecondsRemaining !== null && (
            <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-900 px-2.5 py-1 rounded-xl">
              <span className="text-sm font-bold text-red-400 font-athletic">
                {Math.floor(restSecondsRemaining / 60)}:{String(restSecondsRemaining % 60).padStart(2, '0')}
              </span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="text-zinc-300 hover:text-white p-0.5 cursor-pointer"
                title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
              >
                {isTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => {
                  setRestSecondsRemaining(null);
                  setIsTimerRunning(false);
                }}
                className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                title="Cancel timer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              soundEnabled ? 'text-red-400 border-red-900 bg-red-950/80' : 'text-zinc-400 border-zinc-700 bg-[#2A2E35]'
            }`}
            title={soundEnabled ? 'Sound alert enabled' : 'Sound alert muted'}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. WORKOUT STATS BENTO BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Workouts */}
        <div id="stat-total-workouts" className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-3.5 sm:p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-athletic">
              Total Workouts
            </span>
            <Dumbbell className="h-4 w-4 text-[#E53935]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-athletic text-white">
              {workoutStats.totalWorkouts}
            </span>
            <span className="text-[11px] text-zinc-400">sessions</span>
          </div>
        </div>

        {/* Workout Streak */}
        <div id="stat-workout-streak" className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-3.5 sm:p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-athletic">
              Workout Streak
            </span>
            <Flame className="h-4 w-4 text-[#E53935] animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-athletic text-[#E53935]">
              {workoutStats.workoutStreak}
            </span>
            <span className="text-[11px] text-zinc-400">Days Active 🔥</span>
          </div>
        </div>

        {/* Total Sets */}
        <div id="stat-total-sets" className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-3.5 sm:p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-athletic">
              Total Sets Logged
            </span>
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-athletic text-white">
              {workoutStats.totalSets}
            </span>
            <span className="text-[11px] text-zinc-400">sets</span>
          </div>
        </div>

        {/* Personal Records */}
        <div id="stat-personal-records" className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-3.5 sm:p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-athletic">
              Personal Records
            </span>
            <Award className="h-4 w-4 text-[#E53935]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-athletic text-[#E53935]">
              {workoutStats.totalPRs}
            </span>
            <span className="text-[11px] text-zinc-400">verified PRs</span>
          </div>
        </div>

        {/* Most Trained Exercise */}
        <div id="stat-most-trained" className="col-span-2 sm:col-span-1 rounded-2xl border border-[#2A2E35] bg-[#202328] p-3.5 sm:p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-athletic">
              Most Trained
            </span>
            <Zap className="h-4 w-4 text-[#E53935]" />
          </div>
          <div className="mt-2 truncate">
            <span className="text-base font-bold font-athletic text-white block truncate">
              {workoutStats.mostTrainedExercise}
            </span>
            <span className="text-[10px] text-zinc-400">Top frequency</span>
          </div>
        </div>
      </div>

      {/* 3. WORKOUT MODULE NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[#2A2E35]">
        {[
          { id: 'logger', label: 'Log Workout', icon: Dumbbell },
          { id: 'history', label: `Workout History (${previousWorkouts.length})`, icon: History },
          { id: 'progress', label: 'Strength Progress', icon: TrendingUp },
          { id: 'library', label: `Exercise Library (${exercisesList.length})`, icon: BookOpen },
          { id: 'prs', label: `Personal Records (${personalRecords.length})`, icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`workout-subtab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-athletic uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-[#E53935] text-white shadow-sm'
                  : 'bg-[#202328] border border-[#2A2E35] text-zinc-300 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE WORKOUT LOGGER */}
      {/* ========================================================================= */}
      {activeTab === 'logger' && (
        <div className="space-y-6">
          {/* Quick Routine Templates */}
          <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-4 shadow-md">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-athletic flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#E53935]" />
                Quick Routine Presets
              </span>
              <span className="text-[11px] text-zinc-400">Click to auto-populate routine</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickRoutineTemplates.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => applyRoutineTemplate(t)}
                  className="rounded-xl border border-zinc-700 bg-[#2A2E35] px-3 py-1.5 text-xs font-bold font-athletic uppercase text-zinc-200 hover:border-[#E53935] hover:text-white transition cursor-pointer"
                >
                  ⚡ {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Session Metadata Controls */}
          <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-4 sm:p-5 shadow-md space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-athletic">
                  Workout Routine / Title
                </label>
                <input
                  id="workout-title-input"
                  type="text"
                  value={workoutName}
                  onChange={e => setWorkoutName(e.target.value)}
                  placeholder="e.g. Push Hypertrophy, Leg Day"
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-3.5 py-2 text-xs font-bold text-white placeholder-zinc-500 focus:border-[#E53935] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-athletic">
                  Date
                </label>
                <input
                  id="workout-date-input"
                  type="date"
                  value={workoutDate}
                  onChange={e => setWorkoutDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-3.5 py-2 text-xs font-bold text-white focus:border-[#E53935] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-athletic">
                  Duration (Minutes)
                </label>
                <input
                  id="workout-duration-input"
                  type="number"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-3.5 py-2 text-xs font-bold text-white focus:border-[#E53935] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-athletic">
                Session Notes / Focus Points
              </label>
              <input
                id="workout-notes-input"
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Controlled 3-second eccentrics. Great energy and bench strength."
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#E53935] focus:outline-none"
              />
            </div>
          </div>

          {/* Active Exercises & Sets */}
          <div className="space-y-4">
            {activeSessionExercises.map((exObj, exIdx) => {
              const currentPR = personalRecords.find(p => p.exerciseId === exObj.exercise.id);

              return (
                <div
                  key={exObj.exercise.id + exIdx}
                  id={`exercise-block-${exObj.exercise.id}`}
                  className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-4 sm:p-5 shadow-md transition"
                >
                  {/* Exercise Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#2A2E35]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/80 border border-red-900 text-[#E53935] font-bold font-athletic">
                        #{exIdx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold uppercase font-athletic tracking-wide text-white">
                            {exObj.exercise.name}
                          </h3>
                          <span className="text-[10px] font-bold uppercase bg-[#2A2E35] text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded font-athletic">
                            {exObj.exercise.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {exObj.exercise.equipment} • Target: <span className="text-zinc-200 font-medium">{exObj.exercise.primaryMuscle}</span>
                          {currentPR && (
                            <span className="ml-2 text-red-400 font-bold">
                              (Current PR: {currentPR.maxWeightKg}kg × {currentPR.maxRepsAtWeight})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      id={`remove-exercise-${exIdx}`}
                      onClick={() => handleRemoveExercise(exIdx)}
                      className="p-2 text-zinc-400 hover:text-[#E53935] rounded-xl hover:bg-[#2A2E35] transition cursor-pointer"
                      title="Remove exercise from session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* SET TRACKING TABLE / CARDS */}
                  <div className="mt-4 space-y-2.5">
                    {exObj.sets.map((set, setIdx) => {
                      const isPRDetected = isSetPR(exObj.exercise.id, set.weightKg, set.reps);

                      return (
                        <div
                          key={set.id}
                          className={`rounded-xl border p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 transition ${
                            set.completed
                              ? 'border-[#E53935]/80 bg-red-950/40 text-white'
                              : isPRDetected
                              ? 'border-[#E53935] bg-red-950/60 text-white'
                              : 'border-[#2A2E35] bg-[#2A2E35] text-zinc-100'
                          }`}
                        >
                          {/* Set Label */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold font-athletic uppercase text-red-400 bg-red-950/80 px-2.5 py-1 rounded-lg border border-red-900">
                                Set {set.setNumber}
                              </span>
                              {isPRDetected && (
                                <span className="text-[10px] font-bold font-athletic uppercase text-white bg-[#E53935] border border-red-700 px-2 py-0.5 rounded animate-pulse">
                                  🔥 NEW PR
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-bold text-zinc-300 font-athletic hidden sm:inline">
                              Weight × Reps:
                            </span>
                          </div>

                          {/* Inputs: Weight (kg) & Reps */}
                          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                            {/* Weight Stepper */}
                            <div className="flex items-center gap-1 bg-[#202328] rounded-lg p-1 border border-zinc-700">
                              <button
                                onClick={() => adjustSetWeight(exIdx, setIdx, -2.5)}
                                className="px-1.5 py-1 text-[11px] font-bold text-zinc-300 hover:text-white bg-[#2A2E35] hover:bg-zinc-800 rounded cursor-pointer"
                                title="-2.5 kg"
                              >
                                -2.5
                              </button>
                              <div className="flex items-center">
                                <input
                                  id={`set-weight-${exIdx}-${setIdx}`}
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  value={set.weightKg}
                                  onChange={e => handleUpdateSetField(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                                  className="w-14 sm:w-16 bg-transparent text-center text-xs font-bold text-white focus:outline-none"
                                />
                                <span className="text-[10px] text-zinc-400 font-athletic pr-1">kg</span>
                              </div>
                              <button
                                onClick={() => adjustSetWeight(exIdx, setIdx, 2.5)}
                                className="px-1.5 py-1 text-[11px] font-bold text-zinc-300 hover:text-white bg-[#2A2E35] hover:bg-zinc-800 rounded cursor-pointer"
                                title="+2.5 kg"
                              >
                                +2.5
                              </button>
                            </div>

                            <span className="text-zinc-500 font-bold">×</span>

                            {/* Reps Stepper */}
                            <div className="flex items-center gap-1 bg-[#202328] rounded-lg p-1 border border-zinc-700">
                              <button
                                onClick={() => adjustSetReps(exIdx, setIdx, -1)}
                                className="px-2 py-1 text-[11px] font-bold text-zinc-300 hover:text-white bg-[#2A2E35] hover:bg-zinc-800 rounded cursor-pointer"
                                title="-1 rep"
                              >
                                -1
                              </button>
                              <div className="flex items-center">
                                <input
                                  id={`set-reps-${exIdx}-${setIdx}`}
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={set.reps}
                                  onChange={e => handleUpdateSetField(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                                  className="w-10 sm:w-12 bg-transparent text-center text-xs font-bold text-white focus:outline-none"
                                />
                                <span className="text-[10px] text-zinc-400 font-athletic pr-1">reps</span>
                              </div>
                              <button
                                onClick={() => adjustSetReps(exIdx, setIdx, 1)}
                                className="px-2 py-1 text-[11px] font-bold text-zinc-300 hover:text-white bg-[#2A2E35] hover:bg-zinc-800 rounded cursor-pointer"
                                title="+1 rep"
                              >
                                +1
                              </button>
                            </div>

                            {/* Warmup Checkbox */}
                            <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer ml-1">
                              <input
                                type="checkbox"
                                checked={!!set.isWarmup}
                                onChange={e => handleUpdateSetField(exIdx, setIdx, 'isWarmup', e.target.checked)}
                                className="rounded border-zinc-700 text-[#E53935] focus:ring-0 bg-[#202328]"
                              />
                              <span>Warmup</span>
                            </label>
                          </div>

                          {/* Actions: Complete Toggle & Delete */}
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              id={`set-done-btn-${exIdx}-${setIdx}`}
                              onClick={() => handleUpdateSetField(exIdx, setIdx, 'completed', !set.completed)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-athletic uppercase transition cursor-pointer ${
                                set.completed
                                  ? 'bg-[#E53935] text-white shadow-xs'
                                  : 'bg-[#202328] text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700'
                              }`}
                            >
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                              <span>{set.completed ? 'COMPLETED' : 'DONE'}</span>
                            </button>

                            <button
                              onClick={() => handleDuplicateSet(exIdx, setIdx)}
                              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#202328] transition cursor-pointer"
                              title="Duplicate this set"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => handleRemoveSet(exIdx, setIdx)}
                              className="p-1.5 text-zinc-400 hover:text-[#E53935] rounded-lg hover:bg-red-950/40 transition cursor-pointer"
                              title="Remove set"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Set & Exercise Volume Footer */}
                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#2A2E35] pt-3">
                    <button
                      id={`add-set-btn-${exIdx}`}
                      onClick={() => handleAddSet(exIdx)}
                      className="flex items-center gap-1.5 rounded-xl bg-[#2A2E35] border border-zinc-700 px-3.5 py-1.5 text-xs font-bold font-athletic uppercase text-zinc-200 hover:bg-[#E53935] hover:text-white hover:border-[#E53935] transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ ADD SET</span>
                    </button>

                    <span className="text-xs text-zinc-400 font-athletic">
                      Exercise Volume: <strong className="text-[#E53935] font-bold">{exObj.sets.reduce((acc, s) => acc + (s.weightKg * s.reps), 0).toLocaleString()} kg</strong>
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Add Exercise Trigger Button */}
            <button
              id="open-exercise-picker-btn"
              onClick={() => setIsExercisePickerOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-700 bg-[#202328] p-5 sm:p-6 font-bold font-athletic uppercase text-zinc-300 hover:border-[#E53935] hover:text-[#E53935] transition shadow-md cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              <span>+ ADD EXERCISE TO WORKOUT</span>
            </button>
          </div>

          {/* Sticky Bottom Action Bar to Save Workout */}
          <div className="sticky bottom-20 md:bottom-4 z-30 rounded-2xl border border-[#2A2E35] bg-[#202328] p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] uppercase font-bold text-zinc-400 font-athletic block">
                Total Workout Volume
              </span>
              <span className="text-2xl font-bold font-athletic text-white">
                {activeSessionExercises.reduce(
                  (acc, ex) => acc + ex.sets.reduce((sSum, s) => sSum + (s.weightKg * s.reps), 0),
                  0
                ).toLocaleString()}{' '}
                <span className="text-xs text-zinc-400 font-normal">kg</span>
              </span>
            </div>

            <button
              id="save-workout-session-btn"
              onClick={handleSaveWorkout}
              disabled={isSaving || activeSessionExercises.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#E53935] hover:bg-red-600 px-6 py-3 font-bold font-athletic uppercase tracking-wider text-white shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>{isSaving ? 'Checking PRs & Saving...' : 'COMPLETE & SAVE WORKOUT'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WORKOUT HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold uppercase font-athletic text-white">
              PREVIOUS LOGGED WORKOUTS
            </h3>
            <span className="text-xs text-zinc-400 font-athletic">
              {previousWorkouts.length} Total Sessions
            </span>
          </div>

          {previousWorkouts.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-[#1a1b20] p-10 text-center text-xs text-zinc-400">
              No previous workouts logged yet. Switch to "Log Workout" to record your first session!
            </div>
          ) : (
            previousWorkouts.map(w => {
              const isExpanded = expandedWorkoutId === w.id;

              return (
                <div
                  key={w.id}
                  id={`workout-history-entry-${w.id}`}
                  className="rounded-2xl border border-zinc-800 bg-[#1a1b20] p-5 shadow-xs transition"
                >
                  <div
                    onClick={() => setExpandedWorkoutId(isExpanded ? null : w.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/40 border border-red-900/50 text-red-500">
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold uppercase font-athletic tracking-wide text-white">
                          {w.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-red-500" />
                            {w.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-zinc-400" />
                            {w.durationMinutes} mins
                          </span>
                          <span className="font-bold text-red-400">
                            {w.totalVolumeKg.toLocaleString()} kg Volume
                          </span>
                          {w.prsAchieved && w.prsAchieved.length > 0 && (
                            <span className="text-[10px] font-bold uppercase text-white bg-red-600 border border-red-700 px-2 py-0.5 rounded">
                              🔥 PR in {w.prsAchieved.join(', ')}
                            </span>
                          )}
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

                  {/* Expanded Detailed Workout Sets View */}
                  {isExpanded && (
                    <div className="mt-5 border-t border-zinc-800 pt-4 space-y-3">
                      {w.notes && (
                        <div className="rounded-xl bg-[#22232a] p-3 text-xs text-zinc-300 border border-zinc-700">
                          <strong className="text-zinc-400 uppercase font-athletic text-[11px] block">Session Notes:</strong>
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
                          <tbody className="divide-y divide-zinc-800 font-medium">
                            {w.sets.map((set, idx) => (
                              <tr key={idx} className="hover:bg-zinc-800/40">
                                <td className="py-2 px-2 font-bold text-white font-athletic uppercase">
                                  {set.exerciseName}
                                </td>
                                <td className="py-2 px-2 text-center text-zinc-400 font-bold">
                                  {set.setNumber}
                                </td>
                                <td className="py-2 px-2 font-bold text-red-400">
                                  {set.weightKg} kg
                                </td>
                                <td className="py-2 px-2 text-zinc-300">
                                  {set.reps} reps
                                </td>
                                <td className="py-2 px-2 text-zinc-400">
                                  {set.weightKg * set.reps} kg
                                </td>
                                <td className="py-2 px-2 text-right">
                                  {set.isWarmup ? (
                                    <span className="text-[10px] uppercase font-bold text-zinc-300 bg-[#22232a] px-2 py-0.5 rounded border border-zinc-700">
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

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleDeleteWorkout(w.id)}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-athletic uppercase cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete Session Log</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STRENGTH PROGRESS */}
      {/* ========================================================================= */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-[#1a1b20] p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-500 font-athletic">
                  STRENGTH PROGRESSION & 1RM ESTIMATES
                </span>
                <div className="mt-1 flex items-center gap-3">
                  <select
                    id="progression-exercise-selector"
                    value={selectedProgressionExerciseId}
                    onChange={e => setSelectedProgressionExerciseId(e.target.value)}
                    className="rounded-xl border border-zinc-700 bg-[#22232a] px-3.5 py-2 text-sm font-bold text-white uppercase font-athletic focus:border-red-600 focus:outline-none cursor-pointer"
                  >
                    {exercisesList.map(e => (
                      <option key={e.id} value={e.id} className="bg-[#1a1b20] text-white">
                        {e.name} ({e.category})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedExPR && (
                  <p className="text-xs text-zinc-400 mt-1.5">
                    Benchmark: <strong className="text-red-400">{selectedExPR.maxWeightKg} kg × {selectedExPR.maxRepsAtWeight} reps</strong> • Est. 1RM: <strong className="text-white">{selectedExPR.estimated1RM} kg</strong>
                  </p>
                )}
              </div>

              {/* Time Range Filters */}
              <div className="flex items-center gap-1 bg-[#22232a] border border-zinc-700 rounded-xl p-1 shrink-0">
                {timeFilterList.map(tf => (
                  <button
                    key={tf.id}
                    id={`time-filter-${tf.id}`}
                    onClick={() => setProgressionRange(tf.id)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold font-athletic uppercase transition cursor-pointer ${
                      progressionRange === tf.id
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Progression Chart */}
            <div className="h-72 w-full pt-4">
              {progressionChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-xl bg-[#22232a] border border-dashed border-zinc-700 text-xs text-zinc-400">
                  No sessions recorded for {selectedProgressionExObj.name} in this time period.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressionChartData}>
                    <defs>
                      <linearGradient id="strengthProgressionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={['auto', 'auto']} unit=" kg" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1b20',
                        borderColor: '#3f3f46',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)',
                        fontSize: '12px'
                      }}
                      formatter={(value: any, name: string) => [
                        `${value} kg`,
                        name === 'weightKg' ? 'Top Weight' : 'Estimated 1RM'
                      ]}
                      labelFormatter={(label: any) => `Date: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="weightKg"
                      stroke="#DC2626"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#strengthProgressionGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="estimated1RM"
                      stroke="#A1A1AA"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800 pt-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                  Top Working Weight (kg)
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
                  Estimated 1RM (Brzycki formula)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EXERCISE LIBRARY */}
      {/* ========================================================================= */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold uppercase font-athletic text-white">
                EXERCISE LIBRARY ({exercisesList.length} EXERCISES)
              </h3>
              <p className="text-xs text-zinc-400">
                18 Starter Compound & Isolation Exercises with biomechanical cues.
              </p>
            </div>

            <button
              onClick={() => setIsNewExerciseModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold font-athletic uppercase text-white shadow-xs transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Custom Exercise</span>
            </button>
          </div>

          {/* Search & Muscle Group Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={exerciseSearch}
                onChange={e => setExerciseSearch(e.target.value)}
                placeholder="Search Bench, Squat, Deadlift, Lat Pulldown..."
                className="w-full rounded-xl border border-zinc-700 bg-[#22232a] pl-10 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar">
              {muscleCategories.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMuscleFilter(m)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold font-athletic uppercase transition cursor-pointer ${
                    selectedMuscleFilter === m
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-[#22232a] text-zinc-300 border border-zinc-700 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map(ex => {
              const pr = personalRecords.find(p => p.exerciseId === ex.id);

              return (
                <div
                  key={ex.id}
                  className="rounded-2xl border border-zinc-800 bg-[#1a1b20] p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold uppercase font-athletic text-white">
                        {ex.name}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 bg-[#22232a] px-2 py-0.5 rounded border border-zinc-700">
                        {ex.category}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mt-1">
                      {ex.equipment} • Primary: <strong className="text-zinc-200">{ex.primaryMuscle}</strong>
                    </p>

                    {ex.instructions && (
                      <p className="text-[11px] text-zinc-300 mt-2 bg-[#22232a] p-2.5 rounded-xl border border-zinc-700 italic">
                        "{ex.instructions}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                      {pr ? (
                        <span className="text-xs font-bold font-athletic text-red-500">
                          PR: {pr.maxWeightKg} kg × {pr.maxRepsAtWeight}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-500">No PR logged yet</span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        handleAddExerciseToWorkout(ex);
                        setActiveTab('logger');
                      }}
                      className="rounded-lg bg-red-950/40 border border-red-900/50 px-3 py-1 text-xs font-bold font-athletic uppercase text-red-400 hover:bg-red-600 hover:text-white transition cursor-pointer"
                    >
                      + Add to Session
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PERSONAL RECORDS */}
      {/* ========================================================================= */}
      {activeTab === 'prs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold uppercase font-athletic text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-red-500" />
                VERIFIED PERSONAL RECORDS
              </h3>
              <p className="text-xs text-zinc-400">
                Peak weights, reps, and calculated one-rep maximums with dates.
              </p>
            </div>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('strength');
              }}
              className="rounded-xl border border-red-900/50 bg-red-950/40 px-3.5 py-1.5 text-xs font-bold font-athletic uppercase text-red-400 hover:bg-red-600 hover:text-white transition cursor-pointer"
            >
              Open Full PR Manager →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercisesList.map(ex => {
              const pr = personalRecords.find(r => r.exerciseId === ex.id);

              return (
                <div
                  key={ex.id}
                  className="rounded-2xl border border-zinc-800 bg-[#1a1b20] p-5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-bold uppercase font-athletic text-white">{ex.name}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-zinc-300 bg-[#22232a] px-2 py-0.5 rounded border border-zinc-700">
                      {ex.category}
                    </span>
                  </div>

                  {pr ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-bold font-athletic text-red-500">
                            {pr.maxWeightKg} <span className="text-xs text-zinc-400 font-normal">kg</span>
                          </span>
                          <span className="text-xs text-zinc-300 ml-1.5 font-bold">× {pr.maxRepsAtWeight} reps</span>
                        </div>
                        <span className="text-xs font-bold text-zinc-300 font-athletic bg-[#22232a] px-2 py-0.5 rounded border border-zinc-700">
                          1RM: {pr.estimated1RM} kg
                        </span>
                      </div>

                      <div className="border-t border-zinc-800 pt-2 flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Achieved: <strong className="text-zinc-200">{pr.achievedAt}</strong></span>
                        <span>Sessions: {pr.totalSessions}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 py-3 text-center text-xs text-zinc-500 italic bg-[#22232a] rounded-xl border border-zinc-800">
                      No PR logged yet.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EXERCISE PICKER */}
      {/* ========================================================================= */}
      {isExercisePickerOpen && (
        <div id="exercise-picker-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#1a1b20] p-6 shadow-2xl text-white max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold uppercase font-athletic text-white flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-red-500" />
                SELECT EXERCISE
              </h3>
              <button onClick={() => setIsExercisePickerOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search & Muscle Filters */}
            <div className="mt-3 space-y-2">
              <input
                id="exercise-picker-search-input"
                type="text"
                value={exerciseSearch}
                onChange={e => setExerciseSearch(e.target.value)}
                placeholder="Search Bench, Squat, Lat Pulldown, Row, Bicep Curl..."
                className="w-full rounded-xl border border-zinc-700 bg-[#22232a] px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
              />

              <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar">
                {muscleCategories.map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMuscleFilter(m)}
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold font-athletic uppercase transition cursor-pointer ${
                      selectedMuscleFilter === m
                        ? 'bg-red-600 text-white font-bold'
                        : 'bg-[#22232a] text-zinc-300 border border-zinc-700 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises List */}
            <div className="mt-3 flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-zinc-800">
              {filteredExercises.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToWorkout(ex)}
                  className="pt-2 flex items-center justify-between p-2 rounded-xl hover:bg-[#22232a] cursor-pointer transition"
                >
                  <div>
                    <h4 className="text-sm font-bold uppercase font-athletic text-white">{ex.name}</h4>
                    <p className="text-[11px] text-zinc-400">{ex.category} • {ex.equipment} • {ex.primaryMuscle}</p>
                  </div>
                  <button className="rounded-lg bg-red-950/40 border border-red-900/50 px-3 py-1 text-red-400 text-xs font-bold font-athletic hover:bg-red-600 hover:text-white transition cursor-pointer">
                    + Add
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center">
              <button
                id="picker-create-custom-exercise-btn"
                onClick={() => {
                  setIsExercisePickerOpen(false);
                  setIsNewExerciseModalOpen(true);
                }}
                className="text-xs font-bold uppercase font-athletic text-red-500 hover:underline cursor-pointer"
              >
                + Create Custom Exercise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CUSTOM EXERCISE */}
      {/* ========================================================================= */}
      {isNewExerciseModalOpen && (
        <div id="new-exercise-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-[#1a1b20] p-6 shadow-2xl text-white">
            <button onClick={() => setIsNewExerciseModalOpen(false)} className="absolute top-5 right-5 text-zinc-400 hover:text-white cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold uppercase font-athletic text-white">Add Custom Exercise</h3>

            <form onSubmit={handleCreateCustomExercise} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase font-athletic text-zinc-300">Exercise Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Smith Machine Press"
                  value={newExName}
                  onChange={e => setNewExName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#22232a] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase font-athletic text-zinc-300">Muscle Category</label>
                  <select
                    value={newExCategory}
                    onChange={e => setNewExCategory(e.target.value as MuscleGroup)}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#22232a] px-3 py-2 text-xs text-white focus:outline-none font-athletic cursor-pointer"
                  >
                    <option value="Chest" className="bg-[#1a1b20] text-white">Chest</option>
                    <option value="Back" className="bg-[#1a1b20] text-white">Back</option>
                    <option value="Legs" className="bg-[#1a1b20] text-white">Legs</option>
                    <option value="Shoulders" className="bg-[#1a1b20] text-white">Shoulders</option>
                    <option value="Arms" className="bg-[#1a1b20] text-white">Arms</option>
                    <option value="Core" className="bg-[#1a1b20] text-white">Core</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase font-athletic text-zinc-300">Equipment</label>
                  <select
                    value={newExEquipment}
                    onChange={e => setNewExEquipment(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#22232a] px-3 py-2 text-xs text-white focus:outline-none font-athletic cursor-pointer"
                  >
                    <option value="Barbell" className="bg-[#1a1b20] text-white">Barbell</option>
                    <option value="Dumbbell" className="bg-[#1a1b20] text-white">Dumbbell</option>
                    <option value="Cable" className="bg-[#1a1b20] text-white">Cable</option>
                    <option value="Machine" className="bg-[#1a1b20] text-white">Machine</option>
                    <option value="Bodyweight" className="bg-[#1a1b20] text-white">Bodyweight</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-xl bg-red-600 hover:bg-red-500 py-2.5 text-xs font-bold font-athletic uppercase text-white transition cursor-pointer"
              >
                Create & Add to Session
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: WORKOUT COMPLETED & PERSONAL RECORD CELEBRATION */}
      {/* ========================================================================= */}
      {isWorkoutCompletedModalOpen && completedWorkoutSummary && (
        <div
          id="workout-completion-dialog"
          onClick={() => handleCloseCompletionModal('workout')}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/95 overflow-y-auto"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl border-2 border-[#E53935] bg-[#202328] p-5 sm:p-7 shadow-2xl text-white my-auto max-h-[90vh] flex flex-col"
          >
            {/* Top Bar: Badge & Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2E35]">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#E53935] animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950/80 border border-red-900 px-2.5 py-1 rounded-full font-athletic flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#E53935]" />
                  Workout Logged Successfully
                </span>
              </div>

              {/* Prominent High-Contrast Close Button */}
              <button
                id="close-workout-completion-btn"
                type="button"
                onClick={() => handleCloseCompletionModal('workout')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2A2E35] hover:bg-zinc-700 text-white border border-zinc-600 transition shadow-xs focus:outline-none focus:ring-2 focus:ring-[#E53935] cursor-pointer text-xs font-bold font-athletic uppercase"
                title="Close and return to workout"
                aria-label="Close workout completion screen"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
                <span>CLOSE</span>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pt-3 pr-1">
              {/* Header Trophy Hero */}
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/40 border-2 border-red-900/50 text-red-500 shadow-inner">
                  {completedWorkoutSummary.newPRs.length > 0 ? (
                    <Award className="h-9 w-9 text-red-500 animate-bounce" />
                  ) : (
                    <Dumbbell className="h-9 w-9 text-red-500" />
                  )}
                </div>

                <h2 className="mt-3 text-2xl font-bold font-athletic uppercase text-white tracking-wide">
                  {completedWorkoutSummary.newPRs.length > 0
                    ? 'NEW PR ACHIEVED! 🔥'
                    : 'WORKOUT COMPLETED! 💪'}
                </h2>
                <p className="text-xs font-bold text-zinc-400 mt-1 uppercase font-athletic">
                  {completedWorkoutSummary.name} • {completedWorkoutSummary.date}
                </p>
              </div>

              {/* Stats Bento Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-zinc-800 bg-[#22232a] p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-athletic block">
                    Total Volume
                  </span>
                  <span className="text-base sm:text-lg font-bold font-athletic text-red-500 mt-0.5 block">
                    {completedWorkoutSummary.totalVolumeKg.toLocaleString()} <span className="text-[10px] text-zinc-400 font-normal">kg</span>
                  </span>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-[#22232a] p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-athletic block">
                    Sets Logged
                  </span>
                  <span className="text-base sm:text-lg font-bold font-athletic text-white mt-0.5 block">
                    {completedWorkoutSummary.totalSets} <span className="text-[10px] text-zinc-400 font-normal">sets</span>
                  </span>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-[#22232a] p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-athletic block">
                    Duration
                  </span>
                  <span className="text-base sm:text-lg font-bold font-athletic text-white mt-0.5 block">
                    {completedWorkoutSummary.durationMinutes} <span className="text-[10px] text-zinc-400 font-normal">mins</span>
                  </span>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-[#22232a] p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-athletic block">
                    Exercises
                  </span>
                  <span className="text-base sm:text-lg font-bold font-athletic text-white mt-0.5 block">
                    {completedWorkoutSummary.totalExercises} <span className="text-[10px] text-zinc-400 font-normal">moves</span>
                  </span>
                </div>
              </div>

              {/* Highlight New PRs if achieved */}
              {completedWorkoutSummary.newPRs.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-athletic uppercase text-red-500">
                    <Sparkles className="h-4 w-4 text-red-500" />
                    <span>Personal Records Shattered</span>
                  </div>

                  <div className="space-y-2">
                    {completedWorkoutSummary.newPRs.map(pr => (
                      <div
                        key={pr.id}
                        className="rounded-2xl border border-red-600/50 bg-[#22232a] p-3.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold font-athletic uppercase text-white">
                            {pr.exerciseName}
                          </h4>
                          <span className="text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded font-athletic">
                            🔥 NEW PR
                          </span>
                        </div>

                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-xl font-bold font-athletic text-white">
                            {pr.maxWeightKg} kg × {pr.maxRepsAtWeight} reps
                          </span>
                          <span className="text-xs font-bold font-athletic text-white bg-[#1a1b20] border border-zinc-700 px-2 py-0.5 rounded">
                            1RM: {pr.estimated1RM} kg
                          </span>
                        </div>

                        {pr.previousBestWeightKg && (
                          <p className="text-[11px] text-red-400 font-bold mt-1">
                            ↑ Exceeded previous best of {pr.previousBestWeightKg} kg × {pr.previousBestReps} reps
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercises Summary Chips */}
              {completedWorkoutSummary.exerciseNames.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase font-athletic text-zinc-400 block mb-1.5">
                    Trained Exercises
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {completedWorkoutSummary.exerciseNames.map((name, i) => (
                      <span
                        key={i}
                        className="text-xs font-bold uppercase font-athletic bg-[#22232a] border border-zinc-700 text-zinc-200 px-2.5 py-1 rounded-lg"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-center text-xs text-zinc-500 italic pt-1">
                "Discipline beats motivation. Strength is earned rep by rep."
              </p>
            </div>

            {/* Bottom Action Buttons */}
            <div className="mt-5 pt-4 border-t border-[#2A2E35] space-y-2.5">
              {/* Prominent DONE / CLOSE button */}
              <button
                id="done-workout-completion-btn"
                type="button"
                onClick={() => handleCloseCompletionModal('workout')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E53935] hover:bg-red-600 py-3.5 px-4 font-bold font-athletic uppercase text-white text-sm transition shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
              >
                <Check className="h-5 w-5 stroke-[2.5]" />
                <span>DONE / CLOSE WORKOUT</span>
              </button>

              {/* Secondary Actions: Back to Workout & Back to Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  id="back-to-workout-btn"
                  type="button"
                  onClick={() => handleCloseCompletionModal('workout')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#2A2E35] hover:bg-zinc-700 py-2.5 px-3 font-bold font-athletic uppercase text-white text-xs transition border border-zinc-600 cursor-pointer"
                >
                  <Dumbbell className="h-4 w-4 stroke-[2.5]" />
                  <span>Back to Workout</span>
                </button>

                <button
                  id="back-to-dashboard-btn"
                  type="button"
                  onClick={() => handleCloseCompletionModal('dashboard')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#2A2E35] hover:bg-zinc-700 py-2.5 px-3 font-bold font-athletic uppercase text-white text-xs transition border border-zinc-600 cursor-pointer"
                >
                  <Flame className="h-4 w-4 text-[#E53935] stroke-[2.5]" />
                  <span>Back to Dashboard</span>
                </button>
              </div>

              {/* Tertiary Navigation Options */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  id="view-workout-history-btn"
                  type="button"
                  onClick={() => handleCloseCompletionModal('history')}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-[#202328] hover:bg-zinc-800 py-2 px-3 text-xs font-bold font-athletic uppercase text-zinc-200 transition cursor-pointer"
                >
                  <History className="h-3.5 w-3.5 text-zinc-400" />
                  <span>View in History</span>
                </button>

                <button
                  id="view-prs-modal-btn"
                  type="button"
                  onClick={() => handleCloseCompletionModal('prs')}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-red-900 bg-red-950/80 hover:bg-red-900 py-2 px-3 text-xs font-bold font-athletic uppercase text-red-300 transition cursor-pointer"
                >
                  <Award className="h-3.5 w-3.5 text-[#E53935]" />
                  <span>View All PRs</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
