import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Nfc, CheckCircle2, XCircle, Clock, Wifi, WifiOff, CreditCard, MessageSquare } from 'lucide-react';
import { db } from '../core/db';
import type { User, NFCCard, Attendance } from '../core/types';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ReaderSimulation() {
  const [status, setStatus] = useState<'IDLE' | 'READING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [online, setOnline] = useState(true);
  const [waStatus, setWaStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');
  const [lastAttendance, setLastAttendance] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Simulation controls
  const [mockCards, setMockCards] = useState<NFCCard[]>([]);
  const [mockUsers, setMockUsers] = useState<User[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadMockData();
    return () => clearInterval(timer);
  }, []);

  const loadMockData = async () => {
    // Seed some data if empty
    const usersCount = await db.users.count();
    if (usersCount === 0) {
      const users: User[] = [
        { id: 'u1', schoolId: 's1', name: 'Ahmad Fauzi', type: 'STUDENT', studentId: '2023001', classId: 'c1', status: 'ACTIVE', parentPhone: '628123456789' },
        { id: 'u2', schoolId: 's1', name: 'Siti Aminah', type: 'STUDENT', studentId: '2023002', classId: 'c1', status: 'ACTIVE', parentPhone: '628987654321' },
        { id: 'u3', schoolId: 's1', name: 'Budi Santoso', type: 'TEACHER', status: 'ACTIVE' },
      ];
      const classes = [
        { id: 'c1', schoolId: 's1', name: 'X-IPA-1', grade: '10', academicYear: '2023/2024' }
      ];
      const cards: NFCCard[] = [
        { id: 'card1', cardUid: 'NFC_001', schoolId: 's1', status: 'ACTIVE' },
        { id: 'card2', cardUid: 'NFC_002', schoolId: 's1', status: 'ACTIVE' },
        { id: 'card3', cardUid: 'NFC_003', schoolId: 's1', status: 'ACTIVE' },
      ];
      await db.users.bulkAdd(users);
      await db.classes.bulkAdd(classes);
      await db.cards.bulkAdd(cards);
    }

    const allCards = await db.cards.toArray();
    const allUsers = await db.users.toArray();
    setMockCards(allCards);
    setMockUsers(allUsers);
  };

  const simulateWhatsApp = async (user: User, attendance: Attendance) => {
    if (!user.parentPhone) return;
    
    setWaStatus('SENDING');
    // Simulate API call to WA Gateway
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`[WA SIMULATION] Sent to ${user.parentPhone}: Halo, ${user.name} sudah hadir di sekolah pada ${format(new Date(attendance.checkInTime), 'HH:mm')}. Status: ${attendance.status}`);
    setWaStatus('SENT');
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID'; // Set to Indonesian as requested in context
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTap = async (cardUid: string) => {
    if (status !== 'IDLE') return;

    setStatus('READING');
    setWaStatus('IDLE');
    
    // Simulate reading delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const card = mockCards.find(c => c.cardUid === cardUid);
      if (!card) {
        speak("Kartu tidak terdaftar");
        throw new Error('Card not recognized');
      }
      
      // Simple lookup
      const userId = cardUid === 'NFC_001' ? 'u1' : cardUid === 'NFC_002' ? 'u2' : 'u3';
      const user = mockUsers.find(u => u.id === userId);
      
      if (!user) {
        speak("Siswa tidak ditemukan");
        throw new Error('User not found');
      }

      const attendance: Attendance = {
        id: crypto.randomUUID(),
        eventId: crypto.randomUUID(),
        userId: user.id,
        cardId: card.id,
        readerId: 'READER_MAIN_GATE',
        date: format(new Date(), 'yyyy-MM-dd'),
        checkInTime: new Date().toISOString(),
        status: new Date().getHours() >= 8 ? 'LATE' : 'PRESENT',
        source: 'NFC',
        synced: false
      };

      await db.attendanceQueue.add(attendance);
      setLastAttendance({ user, attendance });
      setStatus('SUCCESS');

      // Voice Feedback
      const greeting = attendance.status === 'PRESENT' ? 'Halo' : 'Wah kamu terlambat';
      speak(`${greeting}, ${user.name}. Absensi berhasil dicatat.`);

      // Trigger WhatsApp
      simulateWhatsApp(user, attendance);

      // Auto reset to IDLE after showing success longer to allow WA status to be seen
      setTimeout(() => {
        setStatus('IDLE');
        setLastAttendance(null);
        setWaStatus('IDLE');
      }, 5000);

    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('ERROR');
      setTimeout(() => setStatus('IDLE'), 3000);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">NFC Reader Simulator</h1>
          <p className="text-slate-500 dark:text-slate-400">Simulate hardware interaction and offline queueing</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 px-3 py-1">
            {online ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-slate-400" />}
            <span className={online ? "text-emerald-600 dark:text-emerald-400 font-medium text-sm" : "text-slate-400 dark:text-slate-500 font-medium text-sm"}>
              {online ? 'Online' : 'Offline'}
            </span>
          </div>
          <button 
            onClick={() => setOnline(!online)}
            className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg font-semibold transition-colors text-slate-700 dark:text-slate-300"
          >
            Toggle Sync
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hardware UI */}
        <div className="relative">
          <div className="bg-slate-900 rounded-[3rem] p-4 shadow-2xl aspect-[4/5] flex flex-col border-[8px] border-slate-800">
            {/* Screen */}
            <div className="flex-1 bg-indigo-950/50 rounded-[2rem] overflow-hidden relative flex flex-col items-center justify-center p-8 text-center">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-indigo-300/50">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-mono tracking-widest">{format(currentTime, 'HH:mm:ss')}</span>
              </div>

              <AnimatePresence mode="wait">
                {status === 'IDLE' && (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-6"
                  >
                    <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-indigo-500/30">
                      <Nfc className="w-12 h-12 text-indigo-400 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">Ready to Scan</h2>
                      <p className="text-indigo-300/60 text-sm">Please tap your school card on the reader below</p>
                    </div>
                  </motion.div>
                )}

                {status === 'READING' && (
                  <motion.div 
                    key="reading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-4 border-indigo-400/20 rounded-full"></div>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-indigo-400 border-t-transparent rounded-full"
                      ></motion.div>
                    </div>
                    <p className="text-indigo-200 font-medium">Reading Card...</p>
                  </motion.div>
                )}

                {status === 'SUCCESS' && (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4 w-full"
                  >
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-white">{lastAttendance?.user.name}</h2>
                      <p className="text-emerald-400 font-bold tracking-wider uppercase text-xs">
                        {lastAttendance?.attendance.status}
                      </p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-indigo-300/50">Time</span>
                        <span className="text-white font-mono">{format(new Date(lastAttendance?.attendance.checkInTime), 'HH:mm:ss')}</span>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-indigo-300/50">Status</span>
                        <span className="text-white">Confirmed</span>
                      </div>
                      {lastAttendance?.user.parentPhone && (
                        <div className="flex justify-between text-xs mt-3 pt-3 border-t border-white/5">
                          <div className="flex items-center gap-1 text-indigo-300/50">
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </div>
                          <span className={cn(
                            "font-bold uppercase tracking-widest text-[9px]",
                            waStatus === 'SENT' ? "text-emerald-400" : "text-amber-400"
                          )}>
                            {waStatus === 'SENDING' ? 'Sending...' : waStatus === 'SENT' ? 'Sent to Parent' : 'Pending'}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {status === 'ERROR' && (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-red-500/30">
                      <XCircle className="w-12 h-12 text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                      <p className="text-red-300/60 text-sm">{errorMsg}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tap Area Simulation */}
            <div className="mt-4 p-8 border-2 border-slate-800 border-dashed rounded-[2rem] flex items-center justify-center group relative overflow-hidden">
               <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors"></div>
               <Nfc className="w-12 h-12 text-slate-700 group-hover:text-indigo-400 transition-colors relative z-10" />
               <p className="absolute bottom-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest z-10">Sensor Area</p>
            </div>
          </div>
        </div>

        {/* Mock Controls */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Simulated NFC Cards
            </h3>
            <div className="space-y-3">
              {mockCards.map(card => {
                const user = mockUsers.find(u => u.id === (card.cardUid === 'NFC_001' ? 'u1' : card.cardUid === 'NFC_002' ? 'u2' : 'u3'));
                return (
                  <button
                    key={card.id}
                    onClick={() => handleTap(card.cardUid)}
                    disabled={status !== 'IDLE'}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-600">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Unassigned Card'}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{card.cardUid}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 border border-slate-100 dark:border-slate-700">
                      TAP CARD
                    </div>
                  </button>
                );
              })}
              <button 
                onClick={() => handleTap('UNKNOWN_UID')}
                className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-600 text-sm font-medium hover:border-red-200 dark:hover:border-red-900 hover:text-red-400 transition-all"
              >
                Tap Unknown Card
              </button>
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-100 dark:shadow-none text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 className="font-bold mb-2 relative z-10">Developer Note</h3>
            <p className="text-indigo-100 text-sm leading-relaxed relative z-10">
              In production, the NFC Reader hardware would communicate with this system via a Secure WebSocket or MQTT. This simulation uses local state to demonstrate the UX and offline logic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
