import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAlertPoller } from '../../hooks/useAlertPoller';
import { DottedBackground } from '../ui/DottedBackground';

export function AppLayout() {
  const { unreadCount } = useAlertPoller();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#050810]">
      <DottedBackground />
      <Sidebar unreadAlerts={unreadCount} />
      <main className="relative z-10 ml-64 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
