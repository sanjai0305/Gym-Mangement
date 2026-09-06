import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Member } from '../types';

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

  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === 'ACTIVE').length;
  const expiringCount = members.filter((m) => (m.daysRemaining || 0) <= 7 && m.status === 'ACTIVE').length;
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
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-[#dae2fd]">
      {/* Top Stat Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f182e] border border-[#202c4b]">
          <div className="text-xs text-[#8090b4]">Total Roster</div>
          <div className="font-display font-bold text-xl text-white mt-1">{totalCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0f182e] border border-[#202c4b]">
          <div className="text-xs text-[#8090b4]">Active Passes</div>
          <div className="font-display font-bold text-xl text-emerald-400 mt-1">{activeCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0f182e] border border-[#202c4b]">
          <div className="text-xs text-[#8090b4]">Expiring in 7 Days</div>
          <div className="font-display font-bold text-xl text-amber-400 mt-1">{expiringCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0f182e] border border-[#202c4b]">
          <div className="text-xs text-[#8090b4]">Frozen Accounts</div>
          <div className="font-display font-bold text-xl text-blue-400 mt-1">{frozenCount}</div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="p-4 rounded-2xl bg-[#0f182e] border border-[#202c4b] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['ALL', 'ACTIVE', 'EXPIRED', 'FROZEN'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab
                  ? 'bg-primary text-[#0b1326] shadow-md shadow-primary/20'
                  : 'text-[#8797bc] hover:bg-[#15213b] hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Members' : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search box */}
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#617094]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, ID, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#121c35] border border-[#223053] text-xs text-white placeholder-[#516082] focus:outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={onOpenAddMember}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] text-[#0b1326] font-display font-bold text-xs shadow-lg shadow-primary/25 hover:brightness-110 shrink-0"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Members Directory Table */}
      <div className="border border-[#202c4b] rounded-3xl bg-[#0e172c] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#121b33] text-[#7a8ba8] uppercase text-[10px] tracking-wider border-b border-[#1f2c4b]">
              <tr>
                <th className="p-4">Member Name</th>
                <th className="p-4">Member ID</th>
                <th className="p-4">Access Status</th>
                <th className="p-4">Assigned Plan</th>
                <th className="p-4">Validity</th>
                <th className="p-4">Coach</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17233f]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-[#707f9f]">
                    Loading member directory...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-[#707f9f]">
                    No members match your criteria.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr
                    key={member._id}
                    onClick={() => onSelectMember(member._id)}
                    className="hover:bg-[#131d37] transition cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {member.profileImage ? (
                          <img
                            src={member.profileImage}
                            alt={member.name}
                            className="w-10 h-10 rounded-xl object-cover border border-primary/30"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 text-primary font-bold text-sm flex items-center justify-center border border-primary/30">
                            {member.name[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white group-hover:text-primary transition">
                            {member.name}
                          </div>
                          <div className="text-[11px] text-[#7080a2]">{member.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-primary font-medium">{member.memberId}</td>

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
                      <div className="font-semibold text-white">{member.planName}</div>
                      <div className="text-[10px] text-[#798aa9]">All Access Facility</div>
                    </td>

                    <td className="p-4">
                      <div className="font-mono text-[#a5b5d8]">
                        {member.daysRemaining !== undefined && member.daysRemaining >= 0 ? (
                          <span
                            className={
                              member.daysRemaining <= 7 ? 'text-amber-400 font-bold' : 'text-white'
                            }
                          >
                            {member.daysRemaining} days left
                          </span>
                        ) : (
                          <span className="text-rose-400">Expired</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-[#8a9bbd]">{member.trainerName || 'Unassigned'}</td>

                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMember(member._id);
                        }}
                        className="px-3 py-1 rounded-xl bg-[#172340] hover:bg-[#1f2f56] text-[#bccae8] hover:text-white border border-[#273760] transition text-[11px] font-semibold"
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
      </div>
    </div>
  );
};
