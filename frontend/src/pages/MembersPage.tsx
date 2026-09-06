import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  Phone,
  Mail,
  Dumbbell,
  CreditCard,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { Member } from '../types';
import { formatDate } from '../utils';

interface MembersPageProps {
  onSelectMember: (memberId: string) => void;
  onOpenAddMember: () => void;
}

export const MembersPage: React.FC<MembersPageProps> = ({
  onSelectMember,
  onOpenAddMember,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'joiningDate' | 'daysRemaining'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.getMembers({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        tier: tierFilter !== 'ALL' ? tierFilter : undefined,
      });
      setMembers(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [statusFilter, tierFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchMembers();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Sort and Paginate
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      let valA: any = a[sortBy] ?? '';
      let valB: any = b[sortBy] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [members, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedMembers.length / pageSize));
  const paginatedMembers = sortedMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === 'ACTIVE').length;
  const expiringCount = members.filter(
    (m) => (m.daysRemaining || 0) <= 7 && m.status === 'ACTIVE'
  ).length;
  const frozenCount = members.filter((m) => m.status === 'FROZEN').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'EXPIRED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'FROZEN':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0e172e] border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400">Total Roster</div>
          <div className="font-black text-2xl text-white mt-1">{totalCount}</div>
        </div>
        <div className="p-4 bg-[#0e172e] border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400">Active Passes</div>
          <div className="font-black text-2xl text-emerald-400 mt-1">{activeCount}</div>
        </div>
        <div className="p-4 bg-[#0e172e] border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400">Expiring in 7 Days</div>
          <div className="font-black text-2xl text-amber-400 mt-1">{expiringCount}</div>
        </div>
        <div className="p-4 bg-[#0e172e] border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400">Frozen Accounts</div>
          <div className="font-black text-2xl text-blue-400 mt-1">{frozenCount}</div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="p-4 bg-[#0e172e] border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['ALL', 'ACTIVE', 'EXPIRED', 'FROZEN'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-emerald-500 text-[#070e1e] shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Members' : tab}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, ID, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#090f20] border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <button
            onClick={onOpenAddMember}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#070e1e] font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 shrink-0 transition transform active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Member</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#0e172e] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#090f20] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => { setSortBy('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                <div className="flex items-center gap-1">Member Name <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-4">Member ID</th>
              <th className="p-4">Status</th>
              <th className="p-4">Assigned Plan</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => { setSortBy('daysRemaining'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                <div className="flex items-center gap-1">Validity <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-4">Trainer</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-xs text-slate-500 animate-pulse">
                  Loading member directory...
                </td>
              </tr>
            ) : paginatedMembers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-xs text-slate-400">
                  No members match your criteria.
                </td>
              </tr>
            ) : (
              paginatedMembers.map((member) => (
                <tr
                  key={member._id}
                  onClick={() => onSelectMember(member._id)}
                  className="hover:bg-[#121c38] transition cursor-pointer group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt={member.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/20">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{member.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-emerald-400 font-medium">{member.memberId}</td>

                  <td className="p-4">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-bold ${getStatusBadge(
                        member.status
                      )}`}
                    >
                      {member.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="font-semibold text-white">{member.planName || 'Core Access'}</div>
                  </td>

                  <td className="p-4">
                    <div className="font-mono text-slate-300">
                      {member.daysRemaining !== undefined && member.daysRemaining >= 0 ? (
                        <span className={member.daysRemaining <= 7 ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                          {member.daysRemaining} days left
                        </span>
                      ) : (
                        <span className="text-rose-400">Expired</span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-slate-400">{member.trainerName || 'Unassigned'}</td>

                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMember(member._id);
                      }}
                      className="px-3 py-1 bg-[#14203d] hover:bg-[#1b2b52] text-slate-300 hover:text-white border border-slate-700/60 rounded-lg transition text-[11px] font-semibold"
                    >
                      Inspect Dossier
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-800/40 rounded-2xl border border-slate-800" />
            ))}
          </div>
        ) : paginatedMembers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-[#0e172e] rounded-2xl border border-slate-800">
            No members found matching your search.
          </div>
        ) : (
          paginatedMembers.map((member) => (
            <div
              key={member._id}
              onClick={() => onSelectMember(member._id)}
              className="p-4 bg-[#0e172e] border border-slate-800 rounded-2xl space-y-3 active:scale-[0.99] transition-transform shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  {member.profileImage ? (
                    <img src={member.profileImage} alt={member.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/20 shrink-0">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-white text-sm truncate">{member.name}</div>
                    <div className="text-xs text-slate-400 truncate">{member.email}</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold shrink-0 ${getStatusBadge(member.status)}`}>
                  {member.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/60">
                <div>
                  <span className="text-slate-500 block text-[10px]">ID CODE</span>
                  <span className="font-mono text-emerald-400 font-bold">{member.memberId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">VALIDITY</span>
                  <span className="font-mono text-slate-200">
                    {member.daysRemaining !== undefined && member.daysRemaining >= 0 ? (
                      <span className={member.daysRemaining <= 7 ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                        {member.daysRemaining} days left
                      </span>
                    ) : (
                      <span className="text-rose-400">Expired</span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">PLAN</span>
                  <span className="text-slate-300 font-medium truncate block">{member.planName || 'Core Access'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TRAINER</span>
                  <span className="text-slate-300 font-medium truncate block">{member.trainerName || 'Unassigned'}</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMember(member._id);
                  }}
                  className="w-full py-2 bg-[#14203d] hover:bg-[#1b2b52] text-emerald-400 border border-slate-700/60 rounded-xl transition text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  Inspect Member Dossier
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#0e172e] border border-slate-800 rounded-2xl text-xs">
          <div className="text-slate-400 text-center sm:text-left">
            Showing <span className="text-white font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="text-white font-semibold">
              {Math.min(currentPage * pageSize, sortedMembers.length)}
            </span>{' '}
            of <span className="text-white font-semibold">{sortedMembers.length}</span> members
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono font-bold text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
