import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  Unlink,
  ExternalLink
} from 'lucide-react';
import { db } from '../core/db';
import type { NFCCard, User } from '../core/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CardManagement() {
  const [cards, setCards] = useState<NFCCard[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCardUid, setNewCardUid] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allCards = await db.cards.toArray();
    const allUsers = await db.users.toArray();
    setCards(allCards);
    setUsers(allUsers);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardUid) return;

    const existing = await db.cards.where('cardUid').equals(newCardUid).first();
    if (existing) {
      alert('Card UID already registered');
      return;
    }

    const newCard: NFCCard = {
      id: crypto.randomUUID(),
      cardUid: newCardUid,
      schoolId: 's1',
      status: 'ACTIVE'
    };
    await db.cards.add(newCard);
    setNewCardUid('');
    setShowAddModal(false);
    loadData();
  };

  const handleDeleteCard = async (id: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      await db.cards.delete(id);
      loadData();
    }
  };

  const toggleCardStatus = async (card: NFCCard) => {
    const newStatus = card.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await db.cards.update(card.id, { status: newStatus });
    loadData();
  };

  const filteredCards = cards.filter(card => 
    card.cardUid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">NFC Card Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and monitor school NFC cards</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          Register New Card
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by Card UID..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-50 dark:border-slate-800">
                    <th className="pb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Card UID</th>
                    <th className="pb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="pb-4 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredCards.map((card) => (
                    <tr key={card.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-200 text-sm">{card.cardUid}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          onClick={() => toggleCardStatus(card)}
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors",
                            card.status === 'ACTIVE' 
                              ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50" 
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                          )}
                        >
                          {card.status}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDeleteCard(card.id)}
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
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 dark:shadow-none text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <h3 className="text-xl font-bold mb-4 relative z-10">Quick Stats</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-indigo-100 text-sm font-medium">Total Registered</span>
                <span className="text-2xl font-bold">{cards.length}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-emerald-500/20 rounded-2xl border border-white/10">
                <span className="text-emerald-100 text-sm font-medium">Active Cards</span>
                <span className="text-2xl font-bold">{cards.filter(c => c.status === 'ACTIVE').length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white">Information</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Every student and teacher must have a registered NFC card assigned to their account to record attendance. Cards can be deactivated instantly if lost.
            </p>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Register Card</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <Trash2 className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddCard} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Card UID</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. NFC_004"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                    value={newCardUid}
                    onChange={(e) => setNewCardUid(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 ml-1 italic">*Scan card with reader or enter manually</p>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Register Card
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
