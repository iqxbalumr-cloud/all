import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Nfc, 
  Users, 
  Calendar, 
  CreditCard, 
  Settings as SettingsIcon,
  Bell,
  FileText
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Pages
import Dashboard from './pages/Dashboard';
import ReaderSimulation from './pages/ReaderSimulation';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import CardManagement from './pages/CardManagement';
import ScheduleManagement from './pages/ScheduleManagement';
import Settings from './pages/Settings';

// Services
import { syncService } from './services/syncService';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active?: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" 
        : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-white" : "group-hover:text-indigo-600 dark:group-hover:text-indigo-400")} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Navbar = () => {
  return (
    <header className="h-16 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Nfc className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">NFC<span className="text-indigo-600">Sync</span></span>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
        <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Admin User</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">School Principal</p>
          </div>
          <div className="w-10 h-10 bg-indigo-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border-2 border-white dark:border-slate-900 shadow-sm">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  useEffect(() => {
    // Start background sync
    const stopSync = syncService.startAutoSync(10000); // Every 10 seconds for demo

    // Initialize Theme
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => stopSync();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col p-6 fixed inset-y-0 left-0 z-20">
        <div className="space-y-2 flex-1">
          <div className="mb-8 px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Main Menu</div>
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <SidebarItem to="/reader" icon={Nfc} label="NFC Reader" active={location.pathname === '/reader'} />
          <SidebarItem to="/reports" icon={FileText} label="Attendance Recap" active={location.pathname === '/reports'} />
          <SidebarItem to="/users" icon={Users} label="Users" active={location.pathname === '/users'} />
          <SidebarItem to="/cards" icon={CreditCard} label="NFC Cards" active={location.pathname === '/cards'} />
          <SidebarItem to="/schedule" icon={Calendar} label="Schedule" active={location.pathname === '/schedule'} />
        </div>
        
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <SidebarItem to="/settings" icon={SettingsIcon} label="Settings" active={location.pathname === '/settings'} />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-72">
        <Navbar />
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/reader" element={<MainLayout><ReaderSimulation /></MainLayout>} />
        <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
        <Route path="/users" element={<MainLayout><UserManagement /></MainLayout>} />
        <Route path="/cards" element={<MainLayout><CardManagement /></MainLayout>} />
        <Route path="/schedule" element={<MainLayout><ScheduleManagement /></MainLayout>} />
        <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
