import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, LogOut, Tag, Settings, Sun, Moon, X, CalendarClock } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function Sidebar({ unreadAlerts, isOpen, onClose }) {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggle } = useTheme();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/animals') return location.pathname.startsWith('/animals');
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/animals', label: 'Animals', icon: Tag },
    { path: '/alerts', label: 'Alerts', icon: AlertCircle, badge: unreadAlerts },
    { path: '/consultations', label: 'Consultations', icon: CalendarClock },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`
        fixed left-0 top-0 bottom-0 w-72 md:w-64
        bg-white dark:bg-slate-950
        border-r border-slate-200 dark:border-white/10
        flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
        <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
          HybridHerd
        </h1>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon, badge }) => (
          <Link
            key={path}
            to={path}
            onClick={onClose}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative
              ${isActive(path)
                ? 'bg-teal-500/10 border border-teal-500/40 text-teal-600 dark:bg-teal-500/20 dark:border-teal-500/50 dark:text-teal-300'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
              }
            `}
          >
            <Icon size={20} />
            <span className="text-sm font-semibold">{label}</span>
            {badge && badge > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Theme Toggle */}
      <button
        onClick={toggle}
        className="mx-4 mb-2 flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors text-sm font-medium"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
      </button>

      {/* User Section */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-3">
        <div className="px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl">
          <p className="text-xs text-slate-400 mb-1">Email</p>
          <p className="text-sm text-slate-900 dark:text-white truncate font-medium">{user?.email}</p>
          {user?.role && (
            <>
              <p className="text-xs text-slate-400 mt-2 mb-1">Role</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 capitalize">{user.role}</p>
            </>
          )}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30 transition-colors text-sm font-semibold"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
