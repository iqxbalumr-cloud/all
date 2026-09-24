import { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Sparkles,
  Zap,
  BrainCircuit
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { db } from '../core/db';
import { format, startOfToday, subDays } from 'date-fns';

const data = [
  { name: 'Mon', present: 420, late: 45 },
  { name: 'Tue', present: 435, late: 30 },
  { name: 'Wed', present: 410, late: 55 },
  { name: 'Thu', present: 445, late: 20 },
  { name: 'Fri', present: 425, late: 40 },
];

const StatCard = ({ title, value, change, trend, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {change}
      </div>
    </div>
    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
    <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
  </div>
);

export default function Dashboard() {
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const theme = localStorage.getItem('app-theme') || 'light';

  useEffect(() => {
    loadRecentActivity();
    fetchAiInsights();
  }, []);

  const fetchAiInsights = async () => {
    setIsAiLoading(true);
    try {
      const records = await db.attendanceQueue.toArray();
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceData: records.slice(-50) })
      });
      const insights = await response.json();
      setAiInsights(insights);
    } catch (err) {
      console.error("Failed to fetch AI insights", err);
      setAiInsights(["Pattern analysis temporarily unavailable", "System monitoring active", "Attendance tracking steady"]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    const records = await db.attendanceQueue
      .orderBy('checkInTime')
      .reverse()
      .limit(10)
      .toArray();
    
    // Enrich with user data
    const enriched = await Promise.all(records.map(async r => {
      const user = await db.users.get(r.userId);
      return { ...r, user };
    }));
    
    setRecentAttendance(enriched);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring attendance for High School Campus A</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value="1,248" 
          change="+12" 
          trend="up" 
          icon={Users} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Present Today" 
          value="1,152" 
          change="+2.4%" 
          trend="up" 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Late Arrivals" 
          value="42" 
          change="-5" 
          trend="down" 
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Absence Rate" 
          value="4.3%" 
          change="+0.8%" 
          trend="up" 
          icon={AlertCircle} 
          color="bg-rose-500" 
        />
      </div>

      {/* AI Smart Insights Section */}
      <div className="bg-slate-900 dark:bg-slate-900/50 p-8 rounded-[2.5rem] relative overflow-hidden group border border-transparent dark:border-slate-800 transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full -ml-32 -mb-32 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 delay-100"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-indigo-400 mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em]">AI Intelligence Engine</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Smart Attendance Insights</h2>
            <p className="text-slate-400 text-sm max-w-md">Gemini is analyzing your school's attendance pulse in real-time to optimize student engagement.</p>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            {isAiLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-3xl animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              aiInsights.map((insight, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all hover:-translate-y-1 group/item">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-amber-400 opacity-50 group-hover/item:opacity-100" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Insight {i+1}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-200 leading-relaxed tracking-tight">{insight}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Weekly Attendance Trend</h3>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5 text-indigo-500">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Present
              </div>
              <div className="flex items-center gap-1.5 text-amber-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Late
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: theme === 'dark' ? 'none' : '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#fff',
                    padding: '12px',
                    color: theme === 'dark' ? '#f8fafc' : '#1e293b'
                  }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="present" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar dataKey="late" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {recentAttendance.length > 0 ? (
              recentAttendance.map((record, i) => (
                <div key={record.id} className="flex items-center gap-4 group cursor-default">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-110 ${
                    record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {record.user?.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none mb-1">{record.user?.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      {record.status} • {format(new Date(record.checkInTime), 'HH:mm')}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-300 dark:text-slate-600">
                    {format(new Date(record.checkInTime), 'ss')}s
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                </div>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">No activity recorded yet</p>
              </div>
            )}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
}
