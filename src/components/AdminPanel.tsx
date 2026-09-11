import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  Search,
  RefreshCw,
  Smartphone,
  Users,
  Dumbbell,
  UtensilsCrossed,
  Award,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  X,
  FileText,
  Filter,
  DollarSign
} from 'lucide-react';
import { Food, Exercise, UpiPaymentSubmission, SubscriptionTier } from '../types';

interface AdminPanelProps {
  onNavigate?: (tab: any) => void;
  onOpenAuthModal?: (mode: 'login' | 'signup') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate, onOpenAuthModal }) => {
  const { user, login } = useAuth();

  // Security Clearance State
  const [isServerVerified, setIsServerVerified] = useState<boolean | null>(null);
  const [securityError, setSecurityError] = useState<string>('');

  // Primary Tab Navigation
  const [activeTab, setActiveTab] = useState<'upi' | 'stats' | 'foods' | 'exercises' | 'users'>('upi');

  // UPI Submissions State
  const [upiSubmissions, setUpiSubmissions] = useState<UpiPaymentSubmission[]>([]);
  const [upiFilterStatus, setUpiFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [copiedUtrId, setCopiedUtrId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Approval Modal State
  const [approvingSub, setApprovingSub] = useState<UpiPaymentSubmission | null>(null);
  const [approvalNote, setApprovalNote] = useState<string>('Verified in bank statement');

  // Rejection Modal State
  const [rejectingSub, setRejectingSub] = useState<UpiPaymentSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('UTR not found on bank statement');

  // General Admin Stats & Registries
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalFoods: 0,
    totalExercises: 0,
    activeSubscriptions: 0,
    totalSubmissions: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    rejectedPayments: 0
  });
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // New Food Form State
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCat, setNewFoodCat] = useState<any>('Indian Meals');
  const [newFoodServing, setNewFoodServing] = useState('1 serving (100g)');
  const [newFoodCals, setNewFoodCals] = useState(200);
  const [newFoodProtein, setNewFoodProtein] = useState(15);
  const [newFoodCarbs, setNewFoodCarbs] = useState(20);
  const [newFoodFat, setNewFoodFat] = useState(5);

  // New Exercise Form State
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState<any>('Chest');
  const [newExEquipment, setNewExEquipment] = useState<any>('Barbell');

  // Verify server-side administrative access
  useEffect(() => {
    let isMounted = true;

    const verifyClearance = async () => {
      // Client-side quick check
      if (!user || user.role !== 'admin') {
        if (isMounted) {
          setIsServerVerified(false);
          setSecurityError('Administrative clearance required. Your current account does not have admin permissions.');
        }
        return;
      }

      try {
        const verifyRes = await api.verifyAdminAccess();
        if (isMounted) {
          if (verifyRes.authorized) {
            setIsServerVerified(true);
            setSecurityError('');
            loadAllAdminData();
          } else {
            setIsServerVerified(false);
            setSecurityError(verifyRes.error || 'Server rejected administrative verification.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setIsServerVerified(false);
          setSecurityError(err.message || 'Failed to authenticate admin credentials with the server.');
        }
      }
    };

    verifyClearance();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const loadAllAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [st, fList, exList, upiRes, usersRes] = await Promise.all([
        api.getAdminStats().catch(() => ({})),
        api.getFoods().catch(() => ({ foods: [] })),
        api.getExercises().catch(() => ({ exercises: [] })),
        api.getAdminUpiSubmissions().catch(() => ({ submissions: [] })),
        api.getAdminUsers().catch(() => ({ users: [] }))
      ]);

      setStats(st);
      setFoods(fList.foods || []);
      setExercises(exList.exercises || []);
      setUpiSubmissions(upiRes.submissions || []);
      setAdminUsers(usersRes.users || []);
    } catch (e: any) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyUtr = (utr: string, id: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtrId(id);
    setTimeout(() => setCopiedUtrId(null), 2000);
  };

  // Open Approval Confirmation
  const promptApprove = (sub: UpiPaymentSubmission) => {
    setActionFeedback(null);
    setApprovalNote(`Verified against HDFC statement on ${new Date().toLocaleDateString('en-IN')}`);
    setApprovingSub(sub);
  };

  // Submit Approval
  const confirmApprove = async () => {
    if (!approvingSub) return;

    // Frontend validation of self-approval rule
    if (approvingSub.userId === user?.id) {
      setActionFeedback({
        type: 'error',
        message: 'Security Policy Violation: You cannot approve your own payment submission. Dual-control security policy requires a separate administrator.'
      });
      setApprovingSub(null);
      return;
    }

    try {
      setActionLoadingId(approvingSub.id);
      const res = await api.approveAdminUpiSubmission(approvingSub.id, approvalNote);
      setActionFeedback({
        type: 'success',
        message: res.message || `Payment approved! Plan activated for ${approvingSub.userName}.`
      });
      setApprovingSub(null);
      await loadAllAdminData();
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Failed to approve payment submission.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Rejection Dialog
  const promptReject = (sub: UpiPaymentSubmission) => {
    setActionFeedback(null);
    setRejectionReason('UTR not found on bank statement');
    setRejectingSub(sub);
  };

  // Submit Rejection
  const confirmReject = async () => {
    if (!rejectingSub) return;

    // Frontend validation of self-review rule
    if (rejectingSub.userId === user?.id) {
      setActionFeedback({
        type: 'error',
        message: 'Security Policy Violation: You cannot review or reject your own payment submission.'
      });
      setRejectingSub(null);
      return;
    }

    try {
      setActionLoadingId(rejectingSub.id);
      const res = await api.rejectAdminUpiSubmission(rejectingSub.id, rejectionReason);
      setActionFeedback({
        type: 'success',
        message: res.message || 'Payment submission marked as rejected. Plan kept inactive.'
      });
      setRejectingSub(null);
      await loadAllAdminData();
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Failed to reject payment submission.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter and Search Submissions
  const filteredSubmissions = useMemo(() => {
    return upiSubmissions.filter(sub => {
      // Status filter
      if (upiFilterStatus === 'PENDING' && sub.status !== 'verification_pending') return false;
      if (upiFilterStatus === 'APPROVED' && sub.status !== 'approved') return false;
      if (upiFilterStatus === 'REJECTED' && sub.status !== 'rejected') return false;

      // Tier filter
      if (tierFilter !== 'ALL' && sub.planTier !== tierFilter) return false;

      // Search query filter (matches UTR, user name, email, or upiRefId)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesUtr = sub.utr?.toLowerCase().includes(q);
        const matchesName = sub.userName?.toLowerCase().includes(q);
        const matchesEmail = sub.userEmail?.toLowerCase().includes(q);
        const matchesRef = sub.upiRefId?.toLowerCase().includes(q);
        if (!matchesUtr && !matchesName && !matchesEmail && !matchesRef) return false;
      }

      return true;
    });
  }, [upiSubmissions, upiFilterStatus, tierFilter, searchQuery]);

  // Counts for Badges
  const pendingCount = useMemo(() => upiSubmissions.filter(s => s.status === 'verification_pending').length, [upiSubmissions]);
  const approvedCount = useMemo(() => upiSubmissions.filter(s => s.status === 'approved').length, [upiSubmissions]);
  const rejectedCount = useMemo(() => upiSubmissions.filter(s => s.status === 'rejected').length, [upiSubmissions]);
  const totalVerifiedAmount = useMemo(() => {
    return upiSubmissions
      .filter(s => s.status === 'approved')
      .reduce((sum, s) => sum + (Number(s.amountInr) || 0), 0);
  }, [upiSubmissions]);

  // Handle Quick Create Food
  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName.trim()) return;
    try {
      await api.createCustomFood({
        name: newFoodName.trim(),
        category: newFoodCat,
        servingUnit: newFoodServing,
        servingGrams: 100,
        calories: Number(newFoodCals) || 0,
        protein: Number(newFoodProtein) || 0,
        carbs: Number(newFoodCarbs) || 0,
        fat: Number(newFoodFat) || 0
      });
      setNewFoodName('');
      await loadAllAdminData();
    } catch (e) {
      console.error('Failed to add food:', e);
    }
  };

  // Handle Quick Create Exercise
  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    try {
      await api.createExercise({
        name: newExName.trim(),
        category: newExCategory,
        equipment: newExEquipment,
        primaryMuscle: newExCategory
      });
      setNewExName('');
      await loadAllAdminData();
    } catch (e) {
      console.error('Failed to add exercise:', e);
    }
  };

  // --------------------------------------------------------------------------
  // ACCESS CONTROL BARRIER (If not authenticated as Admin)
  // --------------------------------------------------------------------------
  if (user?.role !== 'admin' || isServerVerified === false) {
    return (
      <div id="admin-access-denied-view" className="py-8 px-2 max-w-lg mx-auto">
        <div className="rounded-3xl border border-red-800/80 bg-[#17191C] p-6 sm:p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-950/70 border border-red-700/80 text-red-500 mx-auto flex items-center justify-center shadow-lg shadow-red-950/50">
            <ShieldAlert className="h-8 w-8 text-red-500 animate-pulse" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest font-athletic bg-red-950/80 text-red-400 border border-red-800/80 px-2.5 py-1 rounded-full">
              SECURITY CLEARANCE ENFORCED
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-athletic uppercase text-white mt-3 tracking-wide">
              ADMINISTRATIVE ACCESS RESTRICTED
            </h2>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              The FITTRACK Payment Verification Center and Management Console is strictly restricted to verified administrative accounts.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#121316] p-3 text-left space-y-1">
            <div className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Current Account:</span>
              <span className="font-mono text-white font-semibold">{user ? user.email : 'Unauthenticated Guest'}</span>
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Account Role:</span>
              <span className="font-athletic uppercase font-bold text-red-400">{user?.role || 'None'}</span>
            </div>
            {securityError && (
              <div className="pt-2 text-[11px] text-red-400 border-t border-zinc-800 mt-2 font-medium">
                {securityError}
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              id="admin-denied-return-btn"
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-athletic uppercase text-xs font-bold transition cursor-pointer"
            >
              Return to Dashboard
            </button>

            <button
              id="admin-denied-login-btn"
              onClick={async () => {
                try {
                  // Switch directly to administrator account
                  await login('admin@fittrack.com');
                } catch {
                  if (onOpenAuthModal) onOpenAuthModal('login');
                }
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-athletic uppercase text-xs font-bold transition shadow-lg shadow-red-950/60 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Shield className="h-4 w-4" />
              <span>Sign In as Admin</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ADMIN AUTHORIZED CONSOLE
  // --------------------------------------------------------------------------
  return (
    <div id="admin-panel-view" className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Banner & Identity */}
      <div className="rounded-2xl border border-zinc-800 bg-[#17191C] p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-athletic bg-red-950/80 border border-red-800/80 text-red-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                VERIFIED ADMIN GATEWAY
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                Self-Review Block: ACTIVE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase font-athletic tracking-wide text-white mt-2 flex items-center gap-2">
              <Shield className="h-6 w-6 text-[#E53935]" />
              <span>UPI PAYMENT VERIFICATION &amp; ADMIN CONSOLE</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Authenticated Admin: <strong className="text-white">{user?.name}</strong> (<span className="text-zinc-300 font-mono">{user?.email}</span>)
            </p>
          </div>

          {/* Quick Refresh & Secondary Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="admin-refresh-data-btn"
              onClick={loadAllAdminData}
              disabled={isRefreshing}
              className="px-3 py-2 rounded-xl bg-[#202328] hover:bg-[#2A2E35] border border-zinc-700 text-zinc-200 text-xs font-bold font-athletic uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-red-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div className="mt-5 flex items-center gap-1 border-t border-zinc-800/80 pt-4 overflow-x-auto pb-1 scrollbar-none">
          <button
            id="admin-tab-upi"
            onClick={() => setActiveTab('upi')}
            className={`px-3 py-2 rounded-xl text-xs font-bold font-athletic uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'upi'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>UPI Verification Center</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-black font-extrabold animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            id="admin-tab-stats"
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-2 rounded-xl text-xs font-bold font-athletic uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>System Telemetry</span>
          </button>

          <button
            id="admin-tab-foods"
            onClick={() => setActiveTab('foods')}
            className={`px-3 py-2 rounded-xl text-xs font-bold font-athletic uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'foods'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span>Food Database ({foods.length})</span>
          </button>

          <button
            id="admin-tab-exercises"
            onClick={() => setActiveTab('exercises')}
            className={`px-3 py-2 rounded-xl text-xs font-bold font-athletic uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'exercises'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Dumbbell className="h-4 w-4" />
            <span>Exercise Registry ({exercises.length})</span>
          </button>

          <button
            id="admin-tab-users"
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-xl text-xs font-bold font-athletic uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Athletes Directory ({adminUsers.length})</span>
          </button>
        </div>
      </div>

      {/* Global Action Feedback Alert */}
      {actionFeedback && (
        <div
          className={`rounded-2xl p-4 text-xs font-bold font-athletic uppercase tracking-wide flex items-center justify-between gap-3 border shadow-lg ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300'
              : 'bg-red-950/80 border-red-700/80 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="p-1 hover:bg-black/30 rounded-lg text-zinc-300 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. UPI VERIFICATION DASHBOARD (CORE USER REQUIREMENT)               */}
      {/* ==================================================================== */}
      {activeTab === 'upi' && (
        <div className="space-y-5">
          {/* KPI Metrics Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Pending */}
            <button
              onClick={() => setUpiFilterStatus('PENDING')}
              className={`rounded-2xl border p-4 text-left transition cursor-pointer ${
                upiFilterStatus === 'PENDING'
                  ? 'border-amber-500 bg-[#252018] shadow-md shadow-amber-950/40 ring-1 ring-amber-500'
                  : 'border-zinc-800 bg-[#17191C] hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase font-athletic text-amber-400">
                <span>Pending Review</span>
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold font-athletic text-white flex items-center gap-2">
                <span>{pendingCount}</span>
                {pendingCount > 0 && (
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 uppercase font-athletic">Awaiting verification</p>
            </button>

            {/* Approved */}
            <button
              onClick={() => setUpiFilterStatus('APPROVED')}
              className={`rounded-2xl border p-4 text-left transition cursor-pointer ${
                upiFilterStatus === 'APPROVED'
                  ? 'border-emerald-500 bg-[#18251e] shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500'
                  : 'border-zinc-800 bg-[#17191C] hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase font-athletic text-emerald-400">
                <span>Approved</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold font-athletic text-emerald-400">
                {approvedCount}
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 uppercase font-athletic">Active memberships</p>
            </button>

            {/* Rejected */}
            <button
              onClick={() => setUpiFilterStatus('REJECTED')}
              className={`rounded-2xl border p-4 text-left transition cursor-pointer ${
                upiFilterStatus === 'REJECTED'
                  ? 'border-red-500 bg-[#25181a] shadow-md shadow-red-950/40 ring-1 ring-red-500'
                  : 'border-zinc-800 bg-[#17191C] hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase font-athletic text-red-400">
                <span>Rejected</span>
                <XCircle className="h-4 w-4 text-red-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold font-athletic text-red-400">
                {rejectedCount}
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 uppercase font-athletic">Declined transactions</p>
            </button>

            {/* Verified Revenue */}
            <div className="rounded-2xl border border-zinc-800 bg-[#17191C] p-4 text-left">
              <div className="flex items-center justify-between text-xs font-bold uppercase font-athletic text-zinc-400">
                <span>Verified Volume</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold font-athletic text-white">
                ₹{totalVerifiedAmount}
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 uppercase font-athletic">Direct UPI settlements</p>
            </div>
          </div>

          {/* Filtering & Search Toolbar */}
          <div className="rounded-2xl border border-zinc-800 bg-[#17191C] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Filter Status Pills */}
            <div className="flex items-center gap-1 bg-[#121316] border border-zinc-800 rounded-xl p-1 overflow-x-auto scrollbar-none">
              {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(status => (
                <button
                  key={status}
                  id={`filter-status-${status.toLowerCase()}`}
                  onClick={() => setUpiFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-athletic uppercase transition whitespace-nowrap cursor-pointer ${
                    upiFilterStatus === status
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {status === 'ALL' ? `All (${upiSubmissions.length})` : status === 'PENDING' ? `Pending (${pendingCount})` : status === 'APPROVED' ? `Approved (${approvedCount})` : `Rejected (${rejectedCount})`}
                </button>
              ))}
            </div>

            {/* Search Input & Tier Filter */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  id="admin-upi-search-input"
                  type="text"
                  placeholder="Search UTR, Athlete, Email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-[#202328] pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <select
                id="admin-upi-tier-filter"
                value={tierFilter}
                onChange={e => setTierFilter(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-[#202328] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600"
              >
                <option value="ALL">All Tiers</option>
                <option value="PLAN_299">Nutrition (₹299)</option>
                <option value="PLAN_449">Performance (₹449)</option>
                <option value="PLAN_699">Elite (₹699)</option>
              </select>
            </div>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-[#17191C] p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold font-athletic uppercase text-white tracking-wide">
                No Submissions Found
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                {searchQuery
                  ? `No payment submissions match the query "${searchQuery}".`
                  : upiFilterStatus === 'PENDING'
                  ? 'Great job! All pending UPI payment submissions have been reviewed.'
                  : 'No payment submissions currently exist in this category.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map(sub => {
                const isPending = sub.status === 'verification_pending';
                const isApproved = sub.status === 'approved';
                const isRejected = sub.status === 'rejected';
                const isSelfSubmission = sub.userId === user?.id;
                const isLoading = actionLoadingId === sub.id;

                return (
                  <div
                    key={sub.id}
                    id={`submission-card-${sub.id}`}
                    className={`rounded-2xl border bg-[#17191C] p-4 sm:p-5 transition space-y-4 ${
                      isPending
                        ? 'border-amber-600/50 hover:border-amber-500'
                        : isApproved
                        ? 'border-emerald-800/40 hover:border-emerald-700/60'
                        : 'border-red-800/40 hover:border-red-700/60'
                    }`}
                  >
                    {/* Header Row: User Info + Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-base font-athletic uppercase tracking-wide">
                            {sub.userName || 'Athlete'}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono">
                            {sub.userEmail}
                          </span>
                          {isSelfSubmission && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold font-athletic uppercase bg-red-950/80 border border-red-800 text-red-300">
                              Your Personal Submission (Self-Approval Prohibited)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          User ID: {sub.userId} • Ref: {sub.upiRefId || sub.id}
                        </p>
                      </div>

                      {/* Status Pill */}
                      <div className="shrink-0">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-athletic uppercase bg-amber-950/80 text-amber-300 border border-amber-600/60">
                            <Clock className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                            <span>Verification Pending</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-athletic uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-600/60">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Approved &amp; Plan Activated</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-athletic uppercase bg-red-950/80 text-red-300 border border-red-600/60">
                            <XCircle className="h-3.5 w-3.5 text-red-400" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* Plan & Amount */}
                      <div className="rounded-xl border border-zinc-800/80 bg-[#121316] p-3">
                        <span className="block text-[10px] font-bold font-athletic uppercase text-zinc-400">
                          Selected Plan &amp; Fee
                        </span>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <strong className="text-white font-athletic uppercase text-sm">
                            {sub.planName}
                          </strong>
                          <span className="text-emerald-400 font-bold font-athletic text-base">
                            ₹{sub.amountInr}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-athletic uppercase">Monthly Billing</span>
                      </div>

                      {/* Submitted UTR Number */}
                      <div className="rounded-xl border border-zinc-800/80 bg-[#121316] p-3">
                        <span className="block text-[10px] font-bold font-athletic uppercase text-zinc-400">
                          Submitted UTR / Transaction ID
                        </span>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="font-mono text-white text-sm font-bold tracking-wider select-all">
                            {sub.utr}
                          </span>
                          <button
                            onClick={() => handleCopyUtr(sub.utr, sub.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                            title="Copy UTR to clipboard"
                          >
                            {copiedUtrId === sub.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-500">Match with bank statement</span>
                      </div>

                      {/* Payee Details */}
                      <div className="rounded-xl border border-zinc-800/80 bg-[#121316] p-3">
                        <span className="block text-[10px] font-bold font-athletic uppercase text-zinc-400">
                          Payee UPI &amp; Merchant
                        </span>
                        <div className="mt-1 font-mono text-zinc-200 text-xs truncate">
                          {sub.payeeUpiId || 'mtushar9801@okhdfcbank'}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-athletic uppercase">
                          Merchant: {sub.payeeName || 'FITTRACK'}
                        </span>
                      </div>

                      {/* Submission Timestamp */}
                      <div className="rounded-xl border border-zinc-800/80 bg-[#121316] p-3">
                        <span className="block text-[10px] font-bold font-athletic uppercase text-zinc-400">
                          Submission Date &amp; Time
                        </span>
                        <div className="mt-1 text-zinc-200 text-xs font-medium">
                          {new Date(sub.submittedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })} • {new Date(sub.submittedAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-athletic uppercase">Recorded Timestamp</span>
                      </div>
                    </div>

                    {/* Optional User Remarks / Notes */}
                    {sub.userNotes && (
                      <div className="rounded-xl border border-zinc-800 bg-[#121316] p-3 text-xs">
                        <span className="font-bold text-zinc-400 font-athletic uppercase text-[10px] block">
                          Athlete Remark / Note:
                        </span>
                        <p className="text-zinc-300 italic mt-0.5">&quot;{sub.userNotes}&quot;</p>
                      </div>
                    )}

                    {/* Admin Notes & Verification Details (If verified/rejected) */}
                    {!isPending && (
                      <div className={`rounded-xl border p-3 text-xs ${
                        isApproved ? 'border-emerald-800/40 bg-emerald-950/20' : 'border-red-800/40 bg-red-950/20'
                      }`}>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold font-athletic uppercase text-[10px] text-zinc-400">
                            {isApproved ? 'Admin Verification Record:' : 'Rejection Reason Stored:'}
                          </span>
                          {sub.verifiedAt && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Verified: {new Date(sub.verifiedAt).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-200 mt-1 font-medium">
                          {sub.adminNotes || (isApproved ? 'Approved by administrator' : 'Transaction rejected')}
                        </p>
                      </div>
                    )}

                    {/* Action Controls for Pending Items */}
                    {isPending && (
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                        {isSelfSubmission ? (
                          <div className="w-full sm:w-auto text-xs text-red-400 bg-red-950/60 border border-red-800/60 rounded-xl px-3 py-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>Self-approval blocked: Another administrator must approve this submission.</span>
                          </div>
                        ) : (
                          <>
                            <button
                              id={`reject-btn-${sub.id}`}
                              onClick={() => promptReject(sub)}
                              disabled={isLoading}
                              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-800/80 bg-red-950/40 hover:bg-red-900/60 text-red-200 font-athletic uppercase text-xs font-bold tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4 text-red-400" />
                              <span>Reject Payment</span>
                            </button>

                            <button
                              id={`approve-btn-${sub.id}`}
                              onClick={() => promptApprove(sub)}
                              disabled={isLoading}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-athletic uppercase text-xs font-bold tracking-wider flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Approve &amp; Activate Plan</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. OVERVIEW TELEMETRY TAB                                            */}
      {/* ==================================================================== */}
      {activeTab === 'stats' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-[#17191C] p-5">
              <div className="flex justify-between items-center text-xs font-bold uppercase font-athletic text-zinc-400">
                <span>Registered Athletes</span>
                <Users className="h-4 w-4 text-red-500" />
              </div>
              <div className="mt-3 text-3xl font-bold font-athletic text-white">
                {stats.totalUsers || adminUsers.length || 2}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Total user accounts</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#17191C] p-5">
              <div className="flex justify-between items-center text-xs font-bold uppercase font-athletic text-zinc-400">
                <span>Active Subscriptions</span>
                <Award className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-3 text-3xl font-bold font-athletic text-emerald-400">
                {approvedCount || stats.activeSubscriptions || 1}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Paid active members</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#17191C] p-5">
              <div className="flex justify-between items-center text-xs font-bold uppercase font-athletic text-zinc-400">
                <span>Food Items</span>
                <UtensilsCrossed className="h-4 w-4 text-red-500" />
              </div>
              <div className="mt-3 text-3xl font-bold font-athletic text-white">
                {foods.length || stats.totalFoods || 42}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Indian nutritional database</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#17191C] p-5">
              <div className="flex justify-between items-center text-xs font-bold uppercase font-athletic text-zinc-400">
                <span>Exercise Movements</span>
                <Dumbbell className="h-4 w-4 text-red-500" />
              </div>
              <div className="mt-3 text-3xl font-bold font-athletic text-white">
                {exercises.length || stats.totalExercises || 28}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Strength benchmark registry</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. FOODS DATABASE TAB                                               */}
      {/* ==================================================================== */}
      {activeTab === 'foods' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-[#17191C] p-5">
            <h3 className="text-base font-bold uppercase font-athletic text-white pb-3 border-b border-zinc-800">
              Add New Food to Registry
            </h3>
            <form onSubmit={handleCreateFood} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase font-athletic text-zinc-300">Food Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sattu Drink with Water"
                  value={newFoodName}
                  onChange={e => setNewFoodName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#202328] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase font-athletic text-zinc-300">Category</label>
                  <select
                    value={newFoodCat}
                    onChange={e => setNewFoodCat(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#202328] px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="Indian Meals">Indian Meals</option>
                    <option value="Indian Snacks">Indian Snacks</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Eggs">Eggs</option>
                    <option value="Chicken">Chicken</option>
                    <option value="Fish">Fish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase font-athletic text-zinc-300">Serving Unit</label>
                  <input
                    type="text"
                    required
                    value={newFoodServing}
                    onChange={e => setNewFoodServing(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#202328] px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase font-athletic text-zinc-400">Calories</label>
                  <input
                    type="number"
                    value={newFoodCals}
                    onChange={e => setNewFoodCals(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#202328] px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase font-athletic text-zinc-400">Protein (g)</label>
                  <input
                    type="number"
                    value={newFoodProtein}
                    onChange={e => setNewFoodProtein(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#202328] px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase font-athletic text-zinc-400">Carbs (g)</label>
                  <input
                    type="number"
                    value={newFoodCarbs}
                    onChange={e => setNewFoodCarbs(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#202328] px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase font-athletic text-zinc-400">Fat (g)</label>
                  <input
                    type="number"
                    value={newFoodFat}
                    onChange={e => setNewFoodFat(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#202328] px-2 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-athletic font-bold uppercase text-xs text-white tracking-wider transition cursor-pointer"
              >
                Add Food to Global Library
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-[#17191C] p-5">
            <h3 className="text-base font-bold uppercase font-athletic text-white pb-3 border-b border-zinc-800">
              Global Food Catalog ({foods.length} items)
            </h3>
            <div className="mt-3 divide-y divide-zinc-800 max-h-[500px] overflow-y-auto pr-1">
              {foods.map(f => (
                <div key={f.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-white font-athletic uppercase block">{f.name}</strong>
                    <span className="text-zinc-400 text-[11px]">
                      {f.calories} kcal • P: {f.protein}g • C: {f.carbs}g • F: {f.fat}g
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                    {f.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. EXERCISE REGISTRY TAB                                             */}
      {/* ==================================================================== */}
      {activeTab === 'exercises' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-[#17191C] p-5">
            <h3 className="text-base font-bold uppercase font-athletic text-white pb-3 border-b border-zinc-800">
              Add New Exercise Movement
            </h3>
            <form onSubmit={handleCreateExercise} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase font-athletic text-zinc-300">Exercise Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Dumbbell Press"
                  value={newExName}
                  onChange={e => setNewExName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#202328] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase font-athletic text-zinc-300">Muscle Group</label>
                  <select
                    value={newExCategory}
                    onChange={e => setNewExCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#202328] px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="Chest">Chest</option>
                    <option value="Back">Back</option>
                    <option value="Shoulders">Shoulders</option>
                    <option value="Legs">Legs</option>
                    <option value="Arms">Arms</option>
                    <option value="Core">Core</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase font-athletic text-zinc-300">Equipment</label>
                  <select
                    value={newExEquipment}
                    onChange={e => setNewExEquipment(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-[#202328] px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="Barbell">Barbell</option>
                    <option value="Dumbbell">Dumbbell</option>
                    <option value="Machine">Machine</option>
                    <option value="Cable">Cable</option>
                    <option value="Bodyweight">Bodyweight</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-athletic font-bold uppercase text-xs text-white tracking-wider transition cursor-pointer"
              >
                Register Exercise
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-[#17191C] p-5">
            <h3 className="text-base font-bold uppercase font-athletic text-white pb-3 border-b border-zinc-800">
              Exercise Library ({exercises.length} movements)
            </h3>
            <div className="mt-3 divide-y divide-zinc-800 max-h-[500px] overflow-y-auto pr-1">
              {exercises.map(ex => (
                <div key={ex.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-white font-athletic uppercase block">{ex.name}</strong>
                    <span className="text-zinc-400 text-[11px]">{ex.category} • {ex.equipment}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-red-500 bg-red-950/70 border border-red-800/60 px-2 py-0.5 rounded">
                    {ex.primaryMuscle}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. ATHLETES DIRECTORY TAB                                            */}
      {/* ==================================================================== */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#17191C] p-5">
          <h3 className="text-base font-bold uppercase font-athletic text-white pb-3 border-b border-zinc-800 flex items-center justify-between">
            <span>Registered Athletes ({adminUsers.length})</span>
            <span className="text-xs text-zinc-400 font-mono">User Registry</span>
          </h3>

          <div className="mt-4 divide-y divide-zinc-800">
            {adminUsers.map(u => (
              <div key={u.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white font-athletic uppercase text-sm">{u.name}</strong>
                    <span className={`text-[9px] font-bold font-athletic uppercase px-2 py-0.5 rounded border ${
                      u.role === 'admin'
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  <p className="text-zinc-400 font-mono text-[11px] mt-0.5">
                    {u.email} • ID: {u.id}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-athletic uppercase px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                    Tier: {u.subscription?.tier || 'FREE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: APPROVE PAYMENT CONFIRMATION                                  */}
      {/* ==================================================================== */}
      {approvingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-emerald-700/80 bg-[#17191C] p-6 shadow-2xl text-white space-y-4">
            <button
              onClick={() => setApprovingSub(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-athletic uppercase text-white">
                  Approve UPI Payment
                </h3>
                <p className="text-xs text-zinc-400">
                  Activates subscription for this athlete immediately
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#121316] p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Athlete Name:</span>
                <span className="text-white font-bold">{approvingSub.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Athlete Email:</span>
                <span className="font-mono text-zinc-300">{approvingSub.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Plan to Activate:</span>
                <span className="text-emerald-400 font-bold font-athletic uppercase">{approvingSub.planName} (₹{approvingSub.amountInr})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Submitted UTR:</span>
                <span className="font-mono text-white font-bold">{approvingSub.utr}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-athletic uppercase text-zinc-300 mb-1">
                Verification / Audit Note (Optional)
              </label>
              <input
                type="text"
                value={approvalNote}
                onChange={e => setApprovalNote(e.target.value)}
                placeholder="e.g. Verified on HDFC NetBanking statement"
                className="w-full rounded-xl border border-zinc-700 bg-[#202328] px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApprovingSub(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-athletic uppercase text-xs font-bold text-zinc-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-approve-submission-btn"
                onClick={confirmApprove}
                disabled={actionLoadingId === approvingSub.id}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-athletic uppercase text-xs font-bold text-white transition shadow-lg shadow-emerald-950/60 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {actionLoadingId === approvingSub.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>Confirm &amp; Activate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: REJECT PAYMENT DIALOG                                         */}
      {/* ==================================================================== */}
      {rejectingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-red-700/80 bg-[#17191C] p-6 shadow-2xl text-white space-y-4">
            <button
              onClick={() => setRejectingSub(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-700 text-red-400 flex items-center justify-center">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-athletic uppercase text-white">
                  Reject UPI Payment Submission
                </h3>
                <p className="text-xs text-zinc-400">
                  The plan remains inactive and reason will be saved
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#121316] p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Athlete:</span>
                <span className="text-white font-bold">{rejectingSub.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Plan Requested:</span>
                <span className="text-white font-athletic">{rejectingSub.planName} (₹{rejectingSub.amountInr})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Submitted UTR:</span>
                <span className="font-mono text-red-400 font-bold">{rejectingSub.utr}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-athletic uppercase text-zinc-300 mb-1.5">
                Select or Enter Rejection Reason:
              </label>

              {/* Quick Reason Chips */}
              <div className="space-y-1.5 mb-2">
                {[
                  'UTR not found on bank statement',
                  'Incorrect payment amount (less than plan fee)',
                  'Duplicate UTR already claimed',
                  'Payment cancelled or reversed by bank'
                ].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRejectionReason(r)}
                    className={`w-full text-left p-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      rejectionReason === r
                        ? 'border-red-600 bg-red-950/70 text-white font-bold'
                        : 'border-zinc-800 bg-[#121316] text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    • {r}
                  </button>
                ))}
              </div>

              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Specific reason for declining this payment..."
                rows={2}
                className="w-full rounded-xl border border-zinc-700 bg-[#202328] px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingSub(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-athletic uppercase text-xs font-bold text-zinc-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-reject-submission-btn"
                onClick={confirmReject}
                disabled={actionLoadingId === rejectingSub.id}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 font-athletic uppercase text-xs font-bold text-white transition shadow-lg shadow-red-950/60 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {actionLoadingId === rejectingSub.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
