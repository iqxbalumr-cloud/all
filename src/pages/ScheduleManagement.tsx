import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Clock, 
  Users, 
  ChevronRight,
  BookOpen,
  Trash2,
  Edit2,
  Layers
} from 'lucide-react';
import { db } from '../core/db';
import type { Class, Schedule } from '../core/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ScheduleManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);
  
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allClasses = await db.classes.toArray();
    const allSchedules = await db.schedules.toArray();
    setClasses(allClasses);
    setSchedules(allSchedules);
    if (allClasses.length > 0 && !activeClassId) {
      setActiveClassId(allClasses[0].id);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClass: Class = {
      id: crypto.randomUUID(),
      schoolId: 's1',
      name: newClassName,
      grade: newClassGrade,
      academicYear: '2023/2024'
    };
    await db.classes.add(newClass);
    setNewClassName('');
    setNewClassGrade('');
    setShowClassModal(false);
    loadData();
  };

  const activeClassSchedules = schedules.filter(s => s.classId === activeClassId);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight text-balance">Schedule & Classes</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Configure academic schedules and class groups</p>
        </div>
        <button 
          onClick={() => setShowClassModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          Create New Class
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Classes List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-4 mb-2">
            <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Class Groups</span>
          </div>
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setActiveClassId(cls.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left",
                activeClassId === cls.id 
                  ? "bg-white dark:bg-slate-800 shadow-md shadow-indigo-50 dark:shadow-none border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/10" 
                  : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                  activeClassId === cls.id ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700"
                )}>
                  {cls.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm leading-none mb-1">{cls.name}</p>
                  <p className="text-[10px] opacity-70 uppercase tracking-wider font-bold">Grade {cls.grade}</p>
                </div>
              </div>
              <ChevronRight className={cn("w-4 h-4 transition-transform", activeClassId === cls.id ? "rotate-90" : "")} />
            </button>
          ))}
        </div>

        {/* Schedule Detail */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {classes.find(c => c.id === activeClassId)?.name || 'Select a class'}
                  </h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Daily Attendance Schedule</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl text-sm font-bold transition-all">
                <Plus className="w-4 h-4" />
                Add Schedule
              </button>
            </div>

            <div className="space-y-4">
              {DAYS.filter((_, i) => i > 0 && i < 6).map((dayName, index) => {
                const dayNum = index + 1;
                const schedule = activeClassSchedules.find(s => s.day === dayNum);
                
                return (
                  <div key={dayName} className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-all group">
                    <div className="w-32">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{dayName}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Weekday</p>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-emerald-500">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Entry Start</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{schedule?.startTime || '07:00'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-amber-500">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Late Threshold</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{schedule?.lateAfter || '07:30'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[2.5rem] text-white border dark:border-slate-800">
               <h4 className="font-bold mb-2 flex items-center gap-2">
                 <BookOpen className="w-4 h-4 text-indigo-400" />
                 Academic Policy
               </h4>
               <p className="text-slate-400 text-sm leading-relaxed">
                 Attendance rules apply globally to all students in the class. Late records will be flagged automatically based on the thresholds defined above.
               </p>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/20 p-8 rounded-[2.5rem] border border-indigo-200 dark:border-indigo-900">
               <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                 <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                 Class Size
               </h4>
               <p className="text-indigo-800 dark:text-indigo-400 text-sm leading-relaxed">
                 Manage student enrollment for this class in the User Management section to ensure accurate attendance reporting.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowClassModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Create New Class</h2>
              <button onClick={() => setShowClassModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Trash2 className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddClass} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Class Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. X-IPA-1"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Grade</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. 10"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                Create Class
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
