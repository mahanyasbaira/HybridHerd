import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { DottedBackground } from '../components/ui/DottedBackground';

export function SettingsPage() {
  const { user, logout } = useContext(AuthContext);

  const getInitial = (email) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="relative z-10 p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Card */}
      <GlassCard className="p-8 max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{getInitial(user?.email)}</span>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">{user?.email}</h2>
            <p className="text-slate-500 dark:text-slate-400 capitalize mt-1">{user?.role || 'User'}</p>
          </div>
        </div>

        {/* Account Section */}
        <div className="mb-8 pb-8 border-b border-slate-200 dark:border-white/10">
          <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-4">Account</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Email</p>
              <p className="text-sm text-slate-900 dark:text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Role</p>
              <p className="text-sm text-slate-900 dark:text-white capitalize">{user?.role || 'User'}</p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-8">
          <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-4">About</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">HybridHerd</p>
              <p className="text-sm text-slate-900 dark:text-white">HybridHerd v1.0 — BRD Monitoring System</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Backend URL</p>
              <p className="text-sm text-slate-900 dark:text-white font-mono">http://localhost:4000</p>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="w-full px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30 transition-colors text-sm font-medium"
        >
          Sign Out
        </button>
      </GlassCard>
    </div>
  );
}
