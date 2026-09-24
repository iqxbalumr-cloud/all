import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  School, 
  MessageSquare, 
  Clock, 
  Database, 
  Save, 
  Download, 
  Upload, 
  Smartphone,
  ShieldCheck,
  Palette
} from 'lucide-react';
import { db } from '../core/db';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all text-sm w-full",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none" 
        : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
    )}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

export default function Settings() {
  const [activeTab, setActiveTab] = useState('school');
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');

  const toggleTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Form States
  const [schoolInfo, setSchoolInfo] = useState({
    name: 'High School Campus A',
    address: 'Jl. Pendidikan No. 123, Jakarta',
    phone: '+62 21 555 1234',
    logo: ''
  });

  const [waConfig, setWaConfig] = useState({
    gatewayUrl: 'https://api.wa-gateway.mock/v1',
    apiKey: 'sk_test_nfc_sync_2026',
    template: 'Halo {parent_name}, {student_name} sudah hadir di sekolah pada {time}. Status: {status}.',
    notifyOnLate: true
  });

  const [attendanceRules, setAttendanceRules] = useState({
    defaultStartTime: '07:00',
    gracePeriodMinutes: 15,
    autoAbsentAfter: '09:00',
    workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    localStorage.setItem('nfc_settings', JSON.stringify({ schoolInfo, waConfig, attendanceRules }));
    setIsSaving(false);
  };

  const handleExportData = async () => {
    const users = await db.users.toArray();
    const cards = await db.cards.toArray();
    const attendance = await db.attendanceQueue.toArray();
    
    const exportObj = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: { users, cards, attendance, settings: { schoolInfo, waConfig, attendanceRules } }
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nfc_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">System Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Configure global parameters and integrations</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isSaving ? 'Saving Changes...' : 'Save All Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <TabButton 
            active={activeTab === 'school'} 
            onClick={() => setActiveTab('school')} 
            icon={School} 
            label="School Profile" 
          />
          <TabButton 
            active={activeTab === 'appearance'} 
            onClick={() => setActiveTab('appearance')} 
            icon={Palette} 
            label="Appearance" 
          />
          <TabButton 
            active={activeTab === 'whatsapp'} 
            onClick={() => setActiveTab('whatsapp')} 
            icon={MessageSquare} 
            label="WA Integration" 
          />
          <TabButton 
            active={activeTab === 'rules'} 
            onClick={() => setActiveTab('rules')} 
            icon={Clock} 
            label="Attendance Rules" 
          />
          <TabButton 
            active={activeTab === 'branding'} 
            onClick={() => setActiveTab('branding')} 
            icon={Palette} 
            label="Branding" 
          />
          <TabButton 
            active={activeTab === 'data'} 
            onClick={() => setActiveTab('data')} 
            icon={Database} 
            label="Data Management" 
          />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm min-h-[500px]">
            
            {activeTab === 'school' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">School Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Official Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                      value={schoolInfo.name}
                      onChange={(e) => setSchoolInfo({...schoolInfo, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                      value={schoolInfo.phone}
                      onChange={(e) => setSchoolInfo({...schoolInfo, phone: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Address</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                      value={schoolInfo.address}
                      onChange={(e) => setSchoolInfo({...schoolInfo, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Appearance & Theme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => toggleTheme('light')}
                    className={cn(
                      "p-6 rounded-[2rem] border-2 transition-all text-left space-y-4",
                      theme === 'light' 
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10" 
                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200"
                    )}
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-amber-500">
                      <Palette className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">Light Mode</p>
                      <p className="text-xs text-slate-400">Clean, crisp, and professional</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => toggleTheme('dark')}
                    className={cn(
                      "p-6 rounded-[2rem] border-2 transition-all text-left space-y-4",
                      theme === 'dark' 
                        ? "border-indigo-600 bg-indigo-900/10" 
                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200"
                    )}
                  >
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center text-indigo-400">
                      <Palette className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">Dark Mode</p>
                      <p className="text-xs text-slate-400">Sophisticated, high-contrast, eye-safe</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">WhatsApp Gateway</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase">
                    <ShieldCheck className="w-3 h-3" /> Encrypted Connection
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Gateway Endpoint</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                        value={waConfig.gatewayUrl}
                        onChange={(e) => setWaConfig({...waConfig, gatewayUrl: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">API Secret Key</label>
                    <input 
                      type="password" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                      value={waConfig.apiKey}
                      onChange={(e) => setWaConfig({...waConfig, apiKey: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Notification Template</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all leading-relaxed dark:text-white"
                      value={waConfig.template}
                      onChange={(e) => setWaConfig({...waConfig, template: e.target.value})}
                    />
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                      Variables: <code className="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 px-1 rounded">{"{student_name}"}</code>, 
                      <code className="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 px-1 rounded">{"{parent_name}"}</code>, 
                      <code className="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 px-1 rounded">{"{time}"}</code>, 
                      <code className="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 px-1 rounded">{"{status}"}</code>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Attendance Policies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Global Start Time</label>
                    <input 
                      type="time" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                      value={attendanceRules.defaultStartTime}
                      onChange={(e) => setAttendanceRules({...attendanceRules, defaultStartTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Grace Period (Minutes)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                      value={attendanceRules.gracePeriodMinutes}
                      onChange={(e) => setAttendanceRules({...attendanceRules, gracePeriodMinutes: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="col-span-2 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/20">
                    <p className="text-sm text-amber-800 dark:text-amber-400 leading-relaxed font-medium">
                      Note: These settings act as global fallbacks. Specific class schedules will always override these global parameters if defined.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-center flex flex-col items-center justify-center h-full max-w-md mx-auto">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Database className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Manage Data Storage</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Download a complete backup of your school data or restore from a previous session.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button 
                    onClick={handleExportData}
                    className="flex flex-col items-center gap-3 p-6 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none rounded-3xl border border-slate-100 dark:border-slate-800 transition-all group"
                  >
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-tight">Export JSON</span>
                  </button>

                  <button className="flex flex-col items-center gap-3 p-6 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none rounded-3xl border border-slate-100 dark:border-slate-800 transition-all group">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-tight">Restore Data</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-slate-800">Sponsor Branding</h3>
                <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                   <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 font-black text-xl italic">
                          B
                        </div>
                        <div>
                          <p className="font-bold">Active Sponsor</p>
                          <p className="text-xs text-slate-400">Main Partnership (Platinum)</p>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                        Your app currently displays branding for <span className="text-white font-bold tracking-tight">BrandSync Indonesia</span>. This sponsorship covers the device and software maintenance costs.
                      </p>
                      <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all">
                        Change Partnership Asset
                      </button>
                   </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
