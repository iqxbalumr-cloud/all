import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  GraduationCap, 
  UserCircle,
  Trash2,
  Edit2,
  Filter
} from 'lucide-react';
import { db } from '../core/db';
import type { User, Class } from '../core/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'STUDENT' | 'TEACHER'>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'STUDENT' as const,
    studentId: '',
    classId: '',
    email: '',
    parentPhone: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allUsers = await db.users.toArray();
    const allClasses = await db.classes.toArray();
    setUsers(allUsers);
    setClasses(allClasses);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: crypto.randomUUID(),
      schoolId: 's1',
      status: 'ACTIVE',
      ...formData
    };
    await db.users.add(newUser);
    setFormData({ name: '', type: 'STUDENT', studentId: '', classId: '', email: '', parentPhone: '' });
    setShowAddModal(false);
    loadData();
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await db.users.delete(id);
      loadData();
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || user.type === filterType;
    
    // Class and Grade filters only apply to students
    const userClass = classes.find(c => c.id === user.classId);
    const matchesClass = filterClass === 'all' || user.classId === filterClass;
    const matchesGrade = filterGrade === 'all' || userClass?.grade === filterGrade;
    
    return matchesSearch && matchesType && matchesClass && matchesGrade;
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight text-balance">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage students, teachers, and staff members</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          <UserPlus className="w-5 h-5" />
          Add New User
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select 
              className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
            >
              <option value="all">All Grades</option>
              {Array.from(new Set(classes.map(c => c.grade))).sort().map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>

            <select 
              className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes
                .filter(c => filterGrade === 'all' || c.grade === filterGrade)
                .map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div className="flex gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl">
              <button 
                onClick={() => setFilterType('all')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  filterType === 'all' ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                )}
              >
                All
              </button>
              <button 
                onClick={() => setFilterType('STUDENT')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  filterType === 'STUDENT' ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                )}
              >
                Students
              </button>
              <button 
                onClick={() => setFilterType('TEACHER')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  filterType === 'TEACHER' ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                )}
              >
                Teachers
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-50 dark:border-slate-800">
                <th className="pb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Name</th>
                <th className="pb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Type</th>
                <th className="pb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Student ID</th>
                <th className="pb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Class</th>
                <th className="pb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{user.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{user.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      user.type === 'STUDENT' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    )}>
                      {user.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{user.studentId || '-'}</td>
                  <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">
                    {classes.find(c => c.id === user.classId)?.name || '-'}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-slate-200 dark:text-slate-700" />
              </div>
              <p className="text-slate-400 dark:text-slate-500 font-medium">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Add New User</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none dark:text-white"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Student ID (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Class (Students Only)</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none dark:text-white"
                    value={formData.classId}
                    onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Parent Phone (WA)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 628..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                Save User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const XCircle = ({ className, onClick }: { className?: string, onClick?: () => void }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    onClick={onClick}
  >
    <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
  </svg>
);
