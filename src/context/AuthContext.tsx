import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile, SubscriptionInfo, SubscriptionTier } from '../types';
import { api } from '../api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  subscription: SubscriptionInfo | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  signup: (formData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changeSubscriptionTier: (tier: SubscriptionTier) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
      setSubscription(data.subscription);
    } catch (e) {
      console.warn('No active session, fallback to demo user');
      // Set default demo token
      localStorage.setItem('fittrack_token', 'user-demo');
      try {
        const data = await api.getMe();
        setUser(data.user);
        setProfile(data.profile);
        setSubscription(data.subscription);
      } catch (err) {
        console.error('Failed to init demo user:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email);
      localStorage.setItem('fittrack_token', res.token);
      setUser(res.user);
      setProfile(res.profile);
      setSubscription(res.subscription);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (formData: any) => {
    setIsLoading(true);
    try {
      const res = await api.signup(formData);
      localStorage.setItem('fittrack_token', res.token);
      setUser(res.user);
      setProfile(res.profile);
      setSubscription(res.subscription);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('fittrack_token');
    setUser(null);
    setProfile(null);
    setSubscription(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const res = await api.updateProfile(data);
    setProfile(res.profile);
  };

  const changeSubscriptionTier = async (tier: SubscriptionTier) => {
    const res = await api.upgradeSubscription(tier);
    setSubscription(res.subscription);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        changeSubscriptionTier,
        refreshAuth: loadUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
