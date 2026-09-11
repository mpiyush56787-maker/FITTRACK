import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { STARTER_FOODS } from '@/server/foodData';
import foodBannerImage from '../assets/images/food_nutrition_banner_1788767946198.jpg';
import {
  UtensilsCrossed,
  Search,
  Plus,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  Target,
  HeartPulse,
  PlusCircle,
  X,
  Check,
  Star,
  Clock,
  Edit2,
  Droplets,
  RotateCcw,
  Coffee,
  Sun,
  Cookie,
  Moon,
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Food, FoodCategory, FoodLog, MealType } from '../types';

export const FoodTracker: React.FC = () => {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Initialize with STARTER_FOODS (320+ items) so the food tab is NEVER blank!
  const [foodDatabase, setFoodDatabase] = useState<Food[]>(STARTER_FOODS);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fittrack_fav_foods') || '[]');
    } catch {
      return ['im-1', 'im-6', 'im-13', 'im-14', 'pf-1', 'pf-2', 'pf-3'];
    }
  });

  const [recentFoodIds, setRecentFoodIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fittrack_recent_foods') || '[]');
    } catch {
      return ['im-1', 'im-11', 'pf-1', 'rc-1', 'br-1'];
    }
  });

  // Water Tracker State (Target: 3,000ml = 3 Liters)
  const [waterMl, setWaterMl] = useState<number>(() => {
    const saved = localStorage.getItem(`fittrack_water_${selectedDate}`);
    return saved ? parseInt(saved, 10) : 1750;
  });
  const waterTarget = profile?.waterTargetMl || 3000;

  // Add Food Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('Breakfast');
  const [quantity, setQuantity] = useState<number>(1);

  // Edit Food Log Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<FoodLog | null>(null);
  const [editMealType, setEditMealType] = useState<MealType>('Breakfast');
  const [editQuantity, setEditQuantity] = useState<number>(1);

  // Custom Food Form State
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<FoodCategory>('Indian Meals');
  const [customServingUnit, setCustomServingUnit] = useState('1 serving (150g)');
  const [customServingGrams, setCustomServingGrams] = useState(150);
  const [customCalories, setCustomCalories] = useState(250);
  const [customProtein, setCustomProtein] = useState(15);
  const [customCarbs, setCustomCarbs] = useState(25);
  const [customFat, setCustomFat] = useState(8);
  const [customFiber, setCustomFiber] = useState(3);

  // Success Toast
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const categories: (FoodCategory | 'All' | 'Favorites' | 'Recent' | 'Custom')[] = [
    'All',
    'Favorites',
    'Recent',
    'Indian Meals',
    'Indian Snacks',
    'Fruits',
    'Vegetables',
    'Dairy',
    'Eggs',
    'Chicken',
    'Fish',
    'Rice',
    'Bread',
    'Protein Foods',
    'Beverages',
    'Packaged Foods',
    'Fast Food',
    'Custom'
  ];

  const quickSearchTags = [
    'Paneer',
    'Roti',
    'Rice',
    'Dosa',
    'Biryani',
    'Chicken',
    'Eggs',
    'Dal',
    'Oats',
    'Whey',
    'Fish',
    'Curd'
  ];

  const mealTypes: { type: MealType; icon: React.ComponentType<{ className?: string }> }[] = [
    { type: 'Breakfast', icon: Coffee },
    { type: 'Lunch', icon: Sun },
    { type: 'Snacks', icon: Cookie },
    { type: 'Dinner', icon: Moon }
  ];

  // Fetch initial foods from API and merge
  const loadFoods = async () => {
    try {
      const data = await api.getFoods();
      if (data && data.foods && data.foods.length > 0) {
        setFoodDatabase(data.foods);
      }
    } catch (e) {
      console.error('Failed to load foods from API, fallback to local database:', e);
    }
  };

  // Fetch logs for current date
  const loadLogs = async (date: string) => {
    try {
      const data = await api.getFoodLogs(date);
      if (data && data.logs) {
        setFoodLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to load food logs:', e);
    }
  };

  // Load water metrics for date
  const loadWaterMetric = async (date: string) => {
    try {
      const { metrics } = await api.getMetrics();
      const match = metrics.find(m => m.date === date);
      if (match && typeof match.waterIntakeMl === 'number') {
        setWaterMl(match.waterIntakeMl);
      } else {
        const saved = localStorage.getItem(`fittrack_water_${date}`);
        if (saved) setWaterMl(parseInt(saved, 10));
      }
    } catch {
      const saved = localStorage.getItem(`fittrack_water_${date}`);
      if (saved) setWaterMl(parseInt(saved, 10));
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  useEffect(() => {
    loadLogs(selectedDate);
    loadWaterMetric(selectedDate);
  }, [selectedDate]);

  // Save favorites to localStorage
  const toggleFavorite = (foodId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(foodId) ? prev.filter(id => id !== foodId) : [...prev, foodId];
      localStorage.setItem('fittrack_fav_foods', JSON.stringify(next));
      return next;
    });
  };

  // Add to recents
  const pushToRecent = (foodId: string) => {
    setRecentFoodIds(prev => {
      const filtered = prev.filter(id => id !== foodId);
      const next = [foodId, ...filtered].slice(0, 15);
      localStorage.setItem('fittrack_recent_foods', JSON.stringify(next));
      return next;
    });
  };

  // Water Tracker update handler
  const handleUpdateWater = async (delta: number) => {
    const nextVal = Math.max(0, Math.min(10000, waterMl + delta));
    setWaterMl(nextVal);
    localStorage.setItem(`fittrack_water_${selectedDate}`, String(nextVal));
    try {
      await api.updateMetric({ date: selectedDate, waterIntakeMl: nextVal });
    } catch (e) {
      console.error('Failed to sync water metric:', e);
    }
  };

  const handleResetWater = async () => {
    setWaterMl(0);
    localStorage.setItem(`fittrack_water_${selectedDate}`, '0');
    try {
      await api.updateMetric({ date: selectedDate, waterIntakeMl: 0 });
    } catch (e) {
      console.error('Failed to reset water metric:', e);
    }
  };

  // Filtered food list with instant client-side search across 320+ items
  const filteredFoods = useMemo(() => {
    let result = foodDatabase;

    // Category filter
    if (selectedCategory === 'Favorites') {
      result = result.filter(f => favorites.includes(f.id));
    } else if (selectedCategory === 'Recent') {
      result = result.filter(f => recentFoodIds.includes(f.id));
    } else if (selectedCategory === 'Custom') {
      result = result.filter(f => f.isCustom);
    } else if (selectedCategory !== 'All') {
      result = result.filter(f => f.category === selectedCategory);
    }

    // Search query filter (instant search)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        (f.servingUnit && f.servingUnit.toLowerCase().includes(q))
      );
    }

    return result;
  }, [foodDatabase, selectedCategory, searchQuery, favorites, recentFoodIds]);

  // LIVE CALCULATIONS
  const totals = useMemo(() => {
    return foodLogs.reduce(
      (acc, log) => {
        acc.calories += log.calories || 0;
        acc.protein += log.protein || 0;
        acc.carbs += log.carbs || 0;
        acc.fat += log.fat || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [foodLogs]);

  // Precision rounding
  totals.protein = Math.round(totals.protein * 10) / 10;
  totals.carbs = Math.round(totals.carbs * 10) / 10;
  totals.fat = Math.round(totals.fat * 10) / 10;

  const targetCals = profile?.targetCalories || 2300;
  const targetProtein = profile?.targetProtein || 160;
  const targetCarbs = profile?.targetCarbs || 250;
  const targetFat = profile?.targetFat || 70;

  const remaining = {
    calories: Math.max(0, targetCals - totals.calories),
    protein: Math.max(0, Math.round((targetProtein - totals.protein) * 10) / 10),
    carbs: Math.max(0, Math.round((targetCarbs - totals.carbs) * 10) / 10),
    fat: Math.max(0, Math.round((targetFat - totals.fat) * 10) / 10)
  };

  // Open Log Food modal
  const handleOpenAddModal = (food: Food, defaultMeal: MealType = 'Breakfast') => {
    setSelectedFood(food);
    setSelectedMealType(defaultMeal);
    setQuantity(1);
    setIsAddModalOpen(true);
  };

  // Open Edit Log modal
  const handleOpenEditModal = (log: FoodLog) => {
    setEditingLog(log);
    setEditMealType(log.mealType);
    setEditQuantity(log.quantity);
    setIsEditModalOpen(true);
  };

  // Submit Food Log
  const handleLogFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;

    try {
      await api.logFood({
        date: selectedDate,
        mealType: selectedMealType,
        foodId: selectedFood.id,
        foodName: selectedFood.name,
        quantity,
        servingUnit: selectedFood.servingUnit,
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat
      });

      pushToRecent(selectedFood.id);
      showNotification(`Added ${selectedFood.name} to ${selectedMealType}!`);
      setIsAddModalOpen(false);
      setSelectedFood(null);
      loadLogs(selectedDate);
    } catch (err) {
      console.error('Failed to log food:', err);
    }
  };

  // Submit Edit Food Log
  const handleEditLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;

    try {
      const unitCals = editingLog.calories / (editingLog.quantity || 1);
      const unitProtein = editingLog.protein / (editingLog.quantity || 1);
      const unitCarbs = editingLog.carbs / (editingLog.quantity || 1);
      const unitFat = editingLog.fat / (editingLog.quantity || 1);

      await api.updateFoodLog(editingLog.id, {
        mealType: editMealType,
        quantity: editQuantity,
        calories: Math.round(unitCals * editQuantity),
        protein: Math.round(unitProtein * editQuantity * 10) / 10,
        carbs: Math.round(unitCarbs * editQuantity * 10) / 10,
        fat: Math.round(unitFat * editQuantity * 10) / 10
      });

      showNotification(`Updated ${editingLog.foodName} entry.`);
      setIsEditModalOpen(false);
      setEditingLog(null);
      loadLogs(selectedDate);
    } catch (err) {
      console.error('Failed to update food log:', err);
    }
  };

  // Delete Log
  const handleDeleteLog = async (id: string, name: string) => {
    try {
      await api.deleteFoodLog(id);
      showNotification(`Removed ${name} from logs.`);
      loadLogs(selectedDate);
    } catch (e) {
      console.error('Failed to delete log:', e);
    }
  };

  // Create Custom Food
  const handleCreateCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName) return;

    try {
      const res = await api.createCustomFood({
        name: customName,
        category: customCategory,
        servingUnit: customServingUnit,
        servingGrams: customServingGrams,
        calories: customCalories,
        protein: customProtein,
        carbs: customCarbs,
        fat: customFat,
        fiber: customFiber
      });

      setIsCustomFoodModalOpen(false);
      setCustomName('');
      await loadFoods();
      showNotification(`Created custom food: ${res.food.name}`);
      handleOpenAddModal(res.food, 'Breakfast');
    } catch (e) {
      console.error('Failed to create custom food:', e);
    }
  };

  const handleShiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Recent foods preview objects
  const recentFoodsList = useMemo(() => {
    return recentFoodIds
      .map(id => foodDatabase.find(f => f.id === id))
      .filter((f): f is Food => Boolean(f))
      .slice(0, 8);
  }, [recentFoodIds, foodDatabase]);

  return (
    <div id="food-tracker-view" className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#E53935] px-4 py-2.5 text-xs font-bold font-athletic uppercase text-white shadow-2xl transition animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Premium Food & Nutrition Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2A2E35] bg-[#202328] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[200px] items-center">
          <div className="lg:col-span-7 p-6 sm:p-7 z-10 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#E53935]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#E53935] font-athletic">
                PRECISION MACROS & FUELING
              </span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold font-athletic tracking-wide text-white uppercase">
              FUEL YOUR GAINS WITH ACCURACY
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-300 font-medium max-w-lg leading-relaxed">
              Track your daily calories, hit target protein benchmarks, and stay accountable. Every single gram of clean nutrition drives muscle recovery and athletic performance.
            </p>
          </div>
          <div className="lg:col-span-5 h-48 sm:h-56 lg:h-full relative overflow-hidden bg-[#17191C]">
            <img
              src={foodBannerImage}
              alt="Healthy athletic meal prep and nutrition"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Header & Date Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2E35] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#E53935]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E53935] font-athletic">
              FITTRACK NUTRITION ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase font-athletic tracking-wide text-white flex items-center gap-2.5 mt-0.5">
            <UtensilsCrossed className="h-7 w-7 text-[#E53935]" />
            CALORIE & NUTRITION TRACKER
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Complete Indian & global food database ({foodDatabase.length}+ foods) with live calorie, protein, and macro calculations.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#202328] border border-[#2A2E35] rounded-xl p-1 shadow-md">
          <button
            id="prev-date-btn"
            onClick={() => handleShiftDate(-1)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2A2E35] transition cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 px-3 text-xs font-bold font-athletic uppercase text-white">
            <Calendar className="h-3.5 w-3.5 text-[#E53935]" />
            <span>{selectedDate === new Date().toISOString().split('T')[0] ? 'TODAY' : selectedDate}</span>
          </div>
          <button
            id="next-date-btn"
            onClick={() => handleShiftDate(1)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2A2E35] transition cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Live Daily Macro Summary Banner - Solid Opaque Acid-Grey Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Calories Card */}
        <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-3 sm:p-4.5 shadow-md">
          <div className="flex justify-between items-center text-xs font-bold uppercase font-athletic text-zinc-400">
            <span>CALORIES</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-950/80 border border-red-900 text-[#E53935]">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-athletic text-white">
            {totals.calories} <span className="text-xs text-zinc-400 font-normal">/ {targetCals} kcal</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-2.5 h-2 w-full rounded-full bg-[#17191C] overflow-hidden border border-zinc-700/60">
            <div
              className={`h-full transition-all duration-500 ${
                totals.calories > targetCals ? 'bg-red-700' : 'bg-[#E53935]'
              }`}
              style={{ width: `${Math.min(100, (totals.calories / targetCals) * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-semibold">
            <span className={totals.calories > targetCals ? 'text-red-400' : 'text-zinc-400'}>
              {totals.calories > targetCals
                ? `${totals.calories - targetCals} kcal over`
                : `${remaining.calories} kcal remaining`}
            </span>
            <span className="text-[#E53935] font-bold">{Math.round((totals.calories / targetCals) * 100)}%</span>
          </div>
        </div>

        {/* Protein Card */}
        <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-3 sm:p-4.5 shadow-md">
          <div className="flex justify-between items-center text-xs font-bold uppercase font-athletic text-zinc-400">
            <span>PROTEIN</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-950/80 border border-red-900 text-[#E53935]">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-athletic text-[#E53935]">
            {totals.protein}g <span className="text-xs text-zinc-400 font-normal">/ {targetProtein}g</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-2.5 h-2 w-full rounded-full bg-[#17191C] overflow-hidden border border-zinc-700/60">
            <div
              className="h-full bg-[#E53935] transition-all duration-500"
              style={{ width: `${Math.min(100, (totals.protein / targetProtein) * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-semibold">
            <span className="text-zinc-400">{remaining.protein}g remaining</span>
            <span className="text-[#E53935] font-bold">{Math.round((totals.protein / targetProtein) * 100)}%</span>
          </div>
        </div>

        {/* Carbs Card */}
        <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-3 sm:p-4.5 shadow-md">
          <div className="flex justify-between items-center text-xs font-bold uppercase font-athletic text-zinc-400">
            <span>CARBS</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2A2E35] border border-zinc-700 text-zinc-300">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-athletic text-white">
            {totals.carbs}g <span className="text-xs text-zinc-400 font-normal">/ {targetCarbs}g</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-2.5 h-2 w-full rounded-full bg-[#17191C] overflow-hidden border border-zinc-700/60">
            <div
              className="h-full bg-zinc-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (totals.carbs / targetCarbs) * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-semibold">
            <span className="text-zinc-400">{remaining.carbs}g left</span>
            <span className="text-zinc-300">{Math.round((totals.carbs / targetCarbs) * 100)}%</span>
          </div>
        </div>

        {/* Fat Card */}
        <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-3 sm:p-4.5 shadow-md">
          <div className="flex justify-between items-center text-xs font-bold uppercase font-athletic text-zinc-400">
            <span>FATS</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2A2E35] border border-zinc-700 text-zinc-300">
              <HeartPulse className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-athletic text-white">
            {totals.fat}g <span className="text-xs text-zinc-400 font-normal">/ {targetFat}g</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-2.5 h-2 w-full rounded-full bg-[#17191C] overflow-hidden border border-zinc-700/60">
            <div
              className="h-full bg-zinc-600 transition-all duration-500"
              style={{ width: `${Math.min(100, (totals.fat / targetFat) * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-semibold">
            <span className="text-zinc-400">{remaining.fat}g left</span>
            <span className="text-zinc-300">{Math.round((totals.fat / targetFat) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Hydration Tracker Card (3L Target) */}
      <div id="water-tracker-card" className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#E53935] text-white shadow-md">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase font-athletic tracking-wide text-white">
                  HYDRATION TRACKER (3L TARGET)
                </h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-950/80 border border-red-900 text-red-400 font-athletic">
                  {Math.round((waterMl / waterTarget) * 100)}% Reached
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                Current: <strong className="text-[#E53935] font-athletic text-sm">{(waterMl / 1000).toFixed(2)} L</strong> ({waterMl} ml) / {(waterTarget / 1000).toFixed(1)} L Target
              </p>
            </div>
          </div>

          {/* Quick Water Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="water-add-250-btn"
              onClick={() => handleUpdateWater(250)}
              className="flex items-center gap-1.5 rounded-xl bg-[#2A2E35] border border-zinc-700 px-3 py-2 text-xs font-bold font-athletic uppercase text-zinc-200 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-[#E53935]" />
              <span>+250 ml (Glass)</span>
            </button>
            <button
              id="water-add-500-btn"
              onClick={() => handleUpdateWater(500)}
              className="flex items-center gap-1.5 rounded-xl bg-[#2A2E35] border border-zinc-700 px-3 py-2 text-xs font-bold font-athletic uppercase text-zinc-200 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-[#E53935]" />
              <span>+500 ml (Bottle)</span>
            </button>
            <button
              id="water-add-1000-btn"
              onClick={() => handleUpdateWater(1000)}
              className="flex items-center gap-1.5 rounded-xl bg-[#E53935] text-white px-3.5 py-2 text-xs font-bold font-athletic uppercase hover:bg-red-600 transition shadow-md cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>+1 L (Jug)</span>
            </button>
            <button
              id="water-undo-btn"
              onClick={() => handleUpdateWater(-250)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700 bg-[#2A2E35] transition cursor-pointer"
              title="Undo 250ml"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Water Level Fill Indicator */}
        <div className="mt-3.5 h-2.5 w-full rounded-full bg-[#17191C] overflow-hidden border border-zinc-750">
          <div
            className="h-full bg-[#E53935] transition-all duration-500"
            style={{ width: `${Math.min(100, (waterMl / waterTarget) * 100)}%` }}
          />
        </div>
      </div>

      {/* Quick Re-Log Bar (Recent Foods) */}
      {recentFoodsList.length > 0 && (
        <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-4 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold uppercase font-athletic text-zinc-400 mb-2.5">
            <Clock className="h-3.5 w-3.5 text-[#E53935]" />
            <span>QUICK RE-LOG (RECENT FOODS)</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {recentFoodsList.map(food => (
              <button
                key={food.id}
                onClick={() => handleOpenAddModal(food, 'Breakfast')}
                className="shrink-0 flex items-center gap-2 rounded-xl bg-[#2A2E35] border border-zinc-700 px-3.5 py-2 text-xs text-zinc-200 hover:border-[#E53935] hover:bg-zinc-700 transition group text-left cursor-pointer shadow-xs"
              >
                <div>
                  <span className="font-bold text-white uppercase font-athletic block text-[11px] group-hover:text-red-400">
                    {food.name}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {food.calories} kcal • <strong className="text-red-400">{food.protein}g P</strong>
                  </span>
                </div>
                <div className="h-6 w-6 rounded-lg bg-red-950/80 border border-red-900 flex items-center justify-center text-[#E53935] group-hover:bg-[#E53935] group-hover:text-white transition">
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Food Search & Database (Left 5 cols) vs Categorized Daily Meal Logs (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Instant Search & Categories */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-5 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2E35]">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[#E53935]" />
                <h3 className="text-sm font-bold uppercase font-athletic tracking-wider text-white">
                  FOOD DATABASE ({filteredFoods.length})
                </h3>
              </div>
              <button
                id="open-custom-food-modal-btn"
                onClick={() => setIsCustomFoodModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold uppercase font-athletic text-[#E53935] hover:text-red-400 transition cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>+ Custom Food</span>
              </button>
            </div>

            {/* Instant Search Bar */}
            <div className="relative mt-3.5">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <input
                id="food-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Instant search: paneer, roti, rice, chicken, dosa..."
                className="w-full rounded-xl border border-zinc-700 bg-[#2A2E35] pl-10 pr-9 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#E53935] focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick Search Chips */}
            <div className="flex gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
              {quickSearchTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold font-athletic uppercase transition cursor-pointer ${
                    searchQuery.toLowerCase() === tag.toLowerCase()
                      ? 'bg-[#E53935] text-white'
                      : 'bg-[#2A2E35] text-zinc-300 hover:text-white hover:bg-zinc-700 border border-zinc-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto py-2.5 no-scrollbar border-t border-[#2A2E35]">
              {categories.map(cat => {
                const isFav = cat === 'Favorites';
                const isRec = cat === 'Recent';
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold font-athletic uppercase transition flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-[#E53935] text-white shadow-md'
                        : 'bg-[#2A2E35] text-zinc-300 hover:text-white border border-zinc-700'
                    }`}
                  >
                    {isFav && <Star className="h-3 w-3 fill-current text-white" />}
                    {isRec && <Clock className="h-3 w-3 text-zinc-400" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Food Results List */}
            <div className="mt-2 space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredFoods.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-400">
                  <p>No foods matching "{searchQuery}".</p>
                  <button
                    onClick={() => setIsCustomFoodModalOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#E53935] px-4 py-2 text-xs font-bold font-athletic uppercase text-white hover:bg-red-600 transition cursor-pointer"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Create "{searchQuery || 'Custom Food'}"</span>
                  </button>
                </div>
              ) : (
                filteredFoods.map(food => {
                  const isFav = favorites.includes(food.id);
                  return (
                    <div
                      key={food.id}
                      className="flex items-center justify-between rounded-xl border border-[#2A2E35] bg-[#2A2E35] p-3 hover:border-[#E53935] hover:bg-zinc-800 transition group shadow-xs"
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-white font-athletic uppercase group-hover:text-red-400 transition">
                            {food.name}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-semibold border border-zinc-700">
                            {food.category}
                          </span>
                          {food.isCustom && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-900 font-bold">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{food.servingUnit}</p>
                        <div className="mt-1 flex items-center gap-2.5 text-[11px]">
                          <span className="font-bold text-[#E53935]">{food.calories} kcal</span>
                          <span className="text-white font-semibold">{food.protein}g P</span>
                          <span className="text-zinc-400 font-medium">{food.carbs}g C</span>
                          <span className="text-zinc-400 font-medium">{food.fat}g F</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={e => toggleFavorite(food.id, e)}
                          className="p-2 rounded-lg text-zinc-500 hover:text-[#E53935] hover:bg-zinc-700 transition cursor-pointer"
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star className={`h-4 w-4 ${isFav ? 'fill-[#E53935] text-[#E53935]' : ''}`} />
                        </button>
                        <button
                          id={`log-food-btn-${food.id}`}
                          onClick={() => handleOpenAddModal(food, 'Breakfast')}
                          className="rounded-xl bg-[#E53935] text-white p-2 hover:bg-red-600 transition shadow-xs cursor-pointer"
                          title="Log Food"
                        >
                          <Plus className="h-4 w-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-3 rounded-xl bg-[#2A2E35] p-3 text-[11px] text-zinc-400 flex items-start gap-2 border border-zinc-700">
              <Info className="h-4 w-4 shrink-0 text-[#E53935] mt-0.5" />
              <span>
                Click <strong className="text-white">+</strong> on any item to log with customized meal type and portion multiplier.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Categorized Daily Food Logs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {mealTypes.map(({ type: mealType, icon: MealIcon }) => {
            const logsForMeal = foodLogs.filter(l => l.mealType === mealType);
            const mealCals = logsForMeal.reduce((sum, l) => sum + (l.calories || 0), 0);
            const mealProtein = Math.round(logsForMeal.reduce((sum, l) => sum + (l.protein || 0), 0) * 10) / 10;
            const mealCarbs = Math.round(logsForMeal.reduce((sum, l) => sum + (l.carbs || 0), 0) * 10) / 10;
            const mealFat = Math.round(logsForMeal.reduce((sum, l) => sum + (l.fat || 0), 0) * 10) / 10;

            return (
              <div
                key={mealType}
                id={`meal-section-${mealType.toLowerCase()}`}
                className="rounded-2xl border border-[#2A2E35] bg-[#202328] p-5 shadow-md"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#2A2E35]">
                  <div className="flex items-center gap-2.5">
                    <MealIcon className="h-4 w-4 text-[#E53935]" />
                    <h3 className="text-base font-bold uppercase font-athletic tracking-wide text-white">
                      {mealType}
                    </h3>
                    <span className="text-xs font-bold text-red-400 font-athletic bg-red-950/80 border border-red-900 px-2 py-0.5 rounded">
                      {mealCals} kcal
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#E53935] font-bold">{mealProtein}g P</span>
                    <span className="text-zinc-400 font-medium">{mealCarbs}g C</span>
                    <span className="text-zinc-400 font-medium">{mealFat}g F</span>
                  </div>
                </div>

                {/* Items in this meal */}
                <div className="mt-3 divide-y divide-[#2A2E35]">
                  {logsForMeal.length === 0 ? (
                    <div className="py-5 text-center text-xs text-zinc-500 italic">
                      No foods logged for {mealType} yet. Use the database on the left to add items.
                    </div>
                  ) : (
                    logsForMeal.map(log => (
                      <div
                        key={log.id}
                        className="py-3 flex items-center justify-between text-xs hover:bg-[#2A2E35] px-2 rounded-lg transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white uppercase font-athletic text-xs sm:text-sm">
                              {log.foodName}
                            </span>
                            <span className="text-zinc-400">
                              ({log.quantity} × {log.servingUnit})
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-3 text-[11px]">
                            <span className="font-bold text-[#E53935]">{log.calories} kcal</span>
                            <span className="text-white font-semibold">{log.protein}g P</span>
                            <span className="text-zinc-400 font-medium">{log.carbs}g C</span>
                            <span className="text-zinc-400 font-medium">{log.fat}g F</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            id={`edit-food-log-${log.id}`}
                            onClick={() => handleOpenEditModal(log)}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition cursor-pointer"
                            title="Edit entry"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`delete-food-log-${log.id}`}
                            onClick={() => handleDeleteLog(log.id, log.foodName)}
                            className="p-1.5 text-zinc-400 hover:text-[#E53935] hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                            title="Remove entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Food to Log Modal - Solid Deep Acid-Grey Modal */}
      {isAddModalOpen && selectedFood && (
        <div id="add-food-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="relative w-full max-w-md rounded-2xl border border-[#2A2E35] bg-[#202328] p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] font-athletic">
                Log Food Entry
              </span>
            </div>
            <h3 className="mt-1 text-xl font-bold uppercase font-athletic text-white">
              {selectedFood.name}
            </h3>
            <p className="text-xs text-zinc-400">Serving size: {selectedFood.servingUnit}</p>

            <form onSubmit={handleLogFoodSubmit} className="mt-5 space-y-4">
              {/* Meal Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                  Meal Category
                </label>
                <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                  {mealTypes.map(m => (
                    <button
                      key={m.type}
                      type="button"
                      onClick={() => setSelectedMealType(m.type)}
                      className={`py-2 rounded-xl text-xs font-bold font-athletic uppercase transition cursor-pointer ${
                        selectedMealType === m.type
                          ? 'bg-[#E53935] text-white shadow-xs'
                          : 'bg-[#2A2E35] text-zinc-300 border border-zinc-700 hover:text-white'
                      }`}
                    >
                      {m.type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity / Multipliers */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                    Quantity / Portions
                  </label>
                  <div className="flex gap-1">
                    {[0.5, 1, 1.5, 2, 3].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuantity(preset)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-athletic cursor-pointer ${
                          quantity === preset
                            ? 'bg-[#E53935] text-white'
                            : 'bg-[#2A2E35] text-zinc-300 hover:text-white border border-zinc-700'
                        }`}
                      >
                        {preset}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-1.5">
                  <input
                    id="food-quantity-input"
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="20"
                    required
                    value={quantity}
                    onChange={e => setQuantity(parseFloat(e.target.value) || 1)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-4 py-2.5 text-sm font-bold text-white focus:border-[#E53935] focus:outline-none"
                  />
                  <span className="text-xs font-semibold text-zinc-400 shrink-0">
                    × {selectedFood.servingUnit}
                  </span>
                </div>
              </div>

              {/* Calculated Live Preview */}
              <div className="rounded-xl bg-[#2A2E35] p-3 border border-[#2A2E35] grid grid-cols-4 text-center text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-athletic">Calories</span>
                  <strong className="text-[#E53935] font-athletic text-sm">
                    {Math.round(selectedFood.calories * quantity)}
                  </strong>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-athletic">Protein</span>
                  <strong className="text-white font-athletic text-sm">
                    {Math.round(selectedFood.protein * quantity * 10) / 10}g
                  </strong>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-athletic">Carbs</span>
                  <strong className="text-zinc-300 font-athletic text-sm">
                    {Math.round(selectedFood.carbs * quantity * 10) / 10}g
                  </strong>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-athletic">Fat</span>
                  <strong className="text-zinc-300 font-athletic text-sm">
                    {Math.round(selectedFood.fat * quantity * 10) / 10}g
                  </strong>
                </div>
              </div>

              <button
                id="confirm-log-food-btn"
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E53935] py-3 font-bold font-athletic uppercase text-white hover:bg-red-600 transition shadow-md cursor-pointer"
              >
                <Check className="h-4 w-4 stroke-[2.5]" />
                <span>Add to {selectedMealType}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Food Log Modal */}
      {isEditModalOpen && editingLog && (
        <div id="edit-food-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="relative w-full max-w-md rounded-2xl border border-[#2A2E35] bg-[#202328] p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] font-athletic">
              Edit Logged Food
            </span>
            <h3 className="mt-1 text-xl font-bold uppercase font-athletic text-white">
              {editingLog.foodName}
            </h3>

            <form onSubmit={handleEditLogSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                  Meal Category
                </label>
                <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                  {mealTypes.map(m => (
                    <button
                      key={m.type}
                      type="button"
                      onClick={() => setEditMealType(m.type)}
                      className={`py-2 rounded-xl text-xs font-bold font-athletic uppercase transition cursor-pointer ${
                        editMealType === m.type
                          ? 'bg-[#E53935] text-white shadow-xs'
                          : 'bg-[#2A2E35] text-zinc-300 border border-zinc-700 hover:text-white'
                      }`}
                    >
                      {m.type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                    Quantity / Portions
                  </label>
                  <div className="flex gap-1">
                    {[0.5, 1, 1.5, 2, 3].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setEditQuantity(preset)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-athletic cursor-pointer ${
                          editQuantity === preset
                            ? 'bg-[#E53935] text-white'
                            : 'bg-[#2A2E35] text-zinc-300 hover:text-white border border-zinc-700'
                        }`}
                      >
                        {preset}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-1.5">
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="20"
                    required
                    value={editQuantity}
                    onChange={e => setEditQuantity(parseFloat(e.target.value) || 1)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-4 py-2.5 text-sm font-bold text-white focus:border-[#E53935] focus:outline-none"
                  />
                  <span className="text-xs font-semibold text-zinc-400 shrink-0">
                    × {editingLog.servingUnit}
                  </span>
                </div>
              </div>

              {/* Calculated Live Preview for Edit */}
              <div className="rounded-xl bg-[#2A2E35] p-3 border border-[#2A2E35] grid grid-cols-4 text-center text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-athletic">Calories</span>
                  <strong className="text-[#E53935] font-athletic text-sm">
                    {Math.round((editingLog.calories / (editingLog.quantity || 1)) * editQuantity)}
                  </strong>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-athletic">Protein</span>
                  <strong className="text-white font-athletic text-sm">
                    {Math.round((editingLog.protein / (editingLog.quantity || 1)) * editQuantity * 10) / 10}g
                  </strong>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-athletic">Carbs</span>
                  <strong className="text-zinc-300 font-athletic text-sm">
                    {Math.round((editingLog.carbs / (editingLog.quantity || 1)) * editQuantity * 10) / 10}g
                  </strong>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-athletic">Fat</span>
                  <strong className="text-zinc-300 font-athletic text-sm">
                    {Math.round((editingLog.fat / (editingLog.quantity || 1)) * editQuantity * 10) / 10}g
                  </strong>
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-xl bg-[#2A2E35] border border-zinc-700 py-3 font-bold font-athletic uppercase text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#E53935] py-3 font-bold font-athletic uppercase text-white hover:bg-red-600 transition shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Custom Food Modal */}
      {isCustomFoodModalOpen && (
        <div id="custom-food-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#2A2E35] bg-[#202328] p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCustomFoodModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold uppercase font-athletic text-white flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-[#E53935]" />
              CREATE CUSTOM FOOD
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Add your homemade meal, mom's recipe, or custom supplement to your personal database.
            </p>

            <form onSubmit={handleCreateCustomFood} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                  Food Name
                </label>
                <input
                  id="custom-food-name-input"
                  type="text"
                  required
                  placeholder="e.g. Mom's Paneer Bhurji & Paratha"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#E53935] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value as FoodCategory)}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-3 py-2.5 text-xs text-white focus:border-[#E53935] focus:outline-none cursor-pointer"
                  >
                    <option value="Indian Meals">Indian Meals</option>
                    <option value="Indian Snacks">Indian Snacks</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Eggs">Eggs</option>
                    <option value="Chicken">Chicken</option>
                    <option value="Fish">Fish</option>
                    <option value="Rice">Rice</option>
                    <option value="Bread">Bread</option>
                    <option value="Protein Foods">Protein Foods</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Packaged Foods">Packaged Foods</option>
                    <option value="Fast Food">Fast Food</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                    Serving Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 bowl (200g)"
                    value={customServingUnit}
                    onChange={e => setCustomServingUnit(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#E53935] focus:outline-none"
                  />
                </div>
              </div>

              {/* Macros Row */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                    Calories
                  </label>
                  <input
                    type="number"
                    required
                    value={customCalories}
                    onChange={e => setCustomCalories(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-2.5 py-2 text-xs font-bold text-[#E53935] focus:outline-none focus:border-[#E53935]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={customProtein}
                    onChange={e => setCustomProtein(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#E53935]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={customCarbs}
                    onChange={e => setCustomCarbs(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#E53935]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-athletic">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={customFat}
                    onChange={e => setCustomFat(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#2A2E35] px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#E53935]"
                  />
                </div>
              </div>

              <button
                id="save-custom-food-btn"
                type="submit"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E53935] py-3 font-bold font-athletic uppercase text-white hover:bg-red-600 transition shadow-md cursor-pointer"
              >
                <Check className="h-4 w-4 stroke-[2.5]" />
                <span>Save to Database & Log</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
