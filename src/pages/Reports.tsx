import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  User as UserIcon,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { db } from '../core/db';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Reports() {
  const [records, setRecords] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterClass, setFilterClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [filterDate, filterClass]);

  const loadData = async () => {
    const allUsers = await db.users.toArray();
    const allClasses = await db.classes.toArray();
    const allRecords = await db.attendanceQueue
      .where('date')
      .equals(filterDate)
      .toArray();

    setUsers(allUsers);
    setClasses(allClasses);
    
    // Enrich records with user and class data
    const enriched = allRecords.map(r => {
      const user = allUsers.find(u => u.id === r.userId);
      const cls = allClasses.find(c => c.id === user?.classId);
      return { ...r, user, class: cls };
    });

    // Filter by class if selected
    const filteredByClass = filterClass === 'all' 
      ? enriched 
      : enriched.filter(r => r.user?.classId === filterClass);

    setRecords(filteredByClass);
  };

  const stats = {
    present: records.filter(r => r.status === 'PRESENT').length,
    late: records.filter(r => r.status === 'LATE').length,
    total: users.length, // Total possible users
  };

  const filteredRecords = records.filter(r => 
    r.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user?.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Attendance Recap</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Generate and view detailed attendance reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            PDF Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none">
            <Download className="w-4 h-4" />
            Excel Export
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Present</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.present}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/10 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Late</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.late}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/10 rounded-2xl flex items-center justify-center">
            <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Absent (Simulated)</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{Math.max(0, stats.total - stats.present - stats.late)}</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Search User</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search name or student ID..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full lg:w-48 space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input 
                type="date" 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full lg:w-48 space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Class</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none dark:text-white"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-50 dark:border-slate-800">
                <th className="pb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Student / Teacher</th>
                <th className="pb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">ID</th>
                <th className="pb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Class</th>
                <th className="pb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Time</th>
                <th className="pb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                <th className="pb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">WA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                          {record.user?.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white text-sm">{record.user?.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{record.user?.studentId || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {record.class?.name || 'STAFF'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {format(new Date(record.checkInTime), 'HH:mm:ss')}
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        record.status === 'PRESENT' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        <MessageSquare className="w-3 h-3" />
                        SENT
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 font-medium">No records found for the selected criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
