import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Payment, Expense, Member } from '../types';
import { useAuth } from '../context/AuthContext';

interface BillingPageProps {
  onOpenInvoice: (invoiceNumber: string) => void;
  onSelectMember: (memberId: string) => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({
  onOpenInvoice,
  onSelectMember,
}) => {
  const { gym } = useAuth();
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // New Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    memberId: '',
    amount: 14999,
    paymentMethod: 'UPI',
    notes: 'Annual Membership Renewal',
  });

  // New Expense modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Equipment',
    description: '',
    amount: 5000,
    paymentMethod: 'BANK_TRANSFER',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, expRes, memRes] = await Promise.all([
        api.getPayments(),
        api.getExpenses(),
        api.getMembers(),
      ]);
      setPayments(payRes.data || []);
      setExpenses(expRes.data || []);
      setMembers(memRes.data || []);
      if (memRes.data?.[0] && !paymentForm.memberId) {
        setPaymentForm((prev) => ({ ...prev, memberId: memRes.data[0]._id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.recordPayment(paymentForm);
      setShowPaymentModal(false);
      fetchData();
      if (res.data?.invoiceNumber) {
        onOpenInvoice(res.data.invoiceNumber);
      }
    } catch (err: any) {
      alert(err.message || 'Payment recording failed');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addExpense(expenseForm);
      setShowExpenseModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Remove this expense entry?')) return;
    try {
      await api.deleteExpense(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-[#dae2fd]">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f182e] border border-[#202c4b]">
          <div className="text-xs text-[#8090b4]">Total Gross Revenue</div>
          <div className="font-display font-extrabold text-xl sm:text-2xl text-emerald-400 mt-1">
            {gym?.currency || '₹'}
            {totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#6e7e9f] mt-1">{payments.length} verified transactions</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f182e] border border-[#202c4b]">
          <div className="text-xs text-[#8090b4]">Operating Expenses</div>
          <div className="font-display font-extrabold text-xl sm:text-2xl text-rose-400 mt-1">
            {gym?.currency || '₹'}
            {totalExpenses.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#6e7e9f] mt-1">Rent, electricity, repairs</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f182e] border border-[#202c4b]">
          <div className="text-xs text-[#8090b4]">Net Operating Margin</div>
          <div className="font-display font-extrabold text-xl sm:text-2xl text-primary mt-1">
            {gym?.currency || '₹'}
            {netProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            {totalRevenue > 0 ? `${((netProfit / totalRevenue) * 100).toFixed(1)}% net margin` : '0%'}
          </div>
        </div>
      </div>

      {/* Tabs & Action Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#0f182e] border border-[#202c4b] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'payments'
                ? 'bg-primary text-[#0b1326] shadow-md shadow-primary/20'
                : 'text-[#8797bc] hover:bg-[#141f39] hover:text-white'
            }`}
          >
            Payment Receipts ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'expenses'
                ? 'bg-primary text-[#0b1326] shadow-md shadow-primary/20'
                : 'text-[#8797bc] hover:bg-[#141f39] hover:text-white'
            }`}
          >
            Facility Expenses ({expenses.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {activeTab === 'payments' ? (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] text-[#0b1326] font-display font-bold text-xs shadow-lg shadow-primary/25 hover:brightness-110 shrink-0"
            >
              <span className="material-symbols-outlined text-base">add_card</span>
              <span>Record Payment</span>
            </button>
          ) : (
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-display font-bold text-xs shadow-lg shadow-rose-500/25 hover:brightness-110 shrink-0"
            >
              <span className="material-symbols-outlined text-base">receipt</span>
              <span>Log Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Tables based on active tab */}
      {activeTab === 'payments' ? (
        <div className="border border-[#202c4b] rounded-3xl bg-[#0e172c] overflow-hidden shadow-xl">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#121b33] text-[#7a8ba8] uppercase text-[10px] tracking-wider border-b border-[#1f2c4b]">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Member Name</th>
                  <th className="p-4">Txn ID</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17233f]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-xs text-[#707f9f]">
                      Loading payment records...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-xs text-[#707f9f]">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-[#131d37] transition">
                      <td className="p-4 font-mono font-bold text-white">{p.invoiceNumber}</td>
                      <td className="p-4">
                        <span
                          onClick={() => onSelectMember(p.memberId)}
                          className="font-semibold text-white hover:text-primary transition cursor-pointer"
                        >
                          {p.memberName}
                        </span>
                        <div className="text-[10px] font-mono text-[#6c7c9e]">{p.memberCode}</div>
                      </td>
                      <td className="p-4 font-mono text-[#8a9bbd]">{p.transactionId}</td>
                      <td className="p-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#182649] text-primary border border-primary/30 font-mono">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 text-[#8a9bbd]">{p.paymentDate}</td>
                      <td className="p-4 font-mono font-bold text-white">
                        {gym?.currency || '₹'}
                        {p.amount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onOpenInvoice(p.invoiceNumber)}
                          className="px-3 py-1 rounded-xl bg-[#172340] hover:bg-[#1f2f57] border border-[#273760] text-primary text-[11px] font-semibold transition"
                        >
                          View Invoice
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Payment Cards */}
          <div className="md:hidden p-3 space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#707f9f]">Loading payment records...</div>
            ) : payments.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#707f9f]">No payments found.</div>
            ) : (
              payments.map((p) => (
                <div key={p._id} className="p-3.5 rounded-2xl bg-[#121c35] border border-[#1e2d4e] space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono text-xs font-bold text-white">{p.invoiceNumber}</div>
                      <div
                        onClick={() => onSelectMember(p.memberId)}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        {p.memberName}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#1a2748]">
                    <div>
                      <span className="text-[#6c7c9e] block text-[9px]">AMOUNT</span>
                      <span className="font-mono font-bold text-white text-xs">
                        {gym?.currency || '₹'}{p.amount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6c7c9e] block text-[9px]">METHOD & DATE</span>
                      <span className="text-slate-300 text-[10px]">{p.paymentMethod} • {p.paymentDate}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => onOpenInvoice(p.invoiceNumber)}
                      className="w-full py-2 rounded-xl bg-[#172340] hover:bg-[#1f2f57] border border-[#273760] text-primary text-xs font-semibold"
                    >
                      View Invoice Receipt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="border border-[#202c4b] rounded-3xl bg-[#0e172c] overflow-hidden shadow-xl">
          {/* Desktop Expenses Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#121b33] text-[#7a8ba8] uppercase text-[10px] tracking-wider border-b border-[#1f2c4b]">
                <tr>
                  <th className="p-4">Expense Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17233f]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-xs text-[#707f9f]">
                      Loading facility expenses...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-xs text-[#707f9f]">
                      No expenses logged yet.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-[#131d37] transition">
                      <td className="p-4">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-white">{exp.description}</td>
                      <td className="p-4 font-mono text-[#8a9bbd]">{exp.paymentMethod}</td>
                      <td className="p-4 text-[#8a9bbd]">{exp.date}</td>
                      <td className="p-4 font-mono font-bold text-rose-400">
                        {gym?.currency || '₹'}
                        {exp.amount.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteExpense(exp._id)}
                          className="p-1 text-[#6c7b9c] hover:text-rose-400 transition"
                          title="Delete expense"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Expense Cards */}
          <div className="md:hidden p-3 space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#707f9f]">Loading expenses...</div>
            ) : expenses.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#707f9f]">No expenses logged yet.</div>
            ) : (
              expenses.map((exp) => (
                <div key={exp._id} className="p-3.5 rounded-2xl bg-[#121c35] border border-[#1e2d4e] space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                      {exp.category}
                    </span>
                    <span className="font-mono font-bold text-rose-400 text-xs">
                      {gym?.currency || '₹'}{exp.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="font-semibold text-white text-xs">{exp.description}</div>

                  <div className="flex items-center justify-between text-[10px] text-[#7888ab] pt-1 border-t border-[#1a2748]">
                    <span>{exp.paymentMethod} • {exp.date}</span>
                    <button
                      onClick={() => handleDeleteExpense(exp._id)}
                      className="text-rose-400 p-1 hover:bg-rose-500/10 rounded-lg"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-[#0e162b] border border-[#233154] rounded-2xl shadow-2xl text-[#dae2fd]">
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#1c2744] shrink-0">
              <h3 className="font-display font-bold text-base text-white">Record Member Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-[#6d7c9e] hover:text-white p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Select Member</label>
                <select
                  value={paymentForm.memberId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, memberId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
                >
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.memberId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">
                    Amount ({gym?.currency || '₹'})
                  </label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option value="UPI">UPI / QR</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="CASH">Cash Over Counter</option>
                    <option value="BANK_TRANSFER">Bank Wire / IMPS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Notes / Description</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-[#1c2744]">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs text-[#7e8eb2] hover:bg-[#16213a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-[#0b1326] font-display font-bold text-xs hover:brightness-110"
                >
                  Generate Tax Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-[#0e162b] border border-[#233154] rounded-2xl shadow-2xl text-[#dae2fd]">
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#1c2744] shrink-0">
              <h3 className="font-display font-bold text-base text-white">Log Operating Expense</h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-[#6d7c9e] hover:text-white p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Expense Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="Rent">Facility Rent</option>
                  <option value="Electricity">Electricity & HVAC</option>
                  <option value="Equipment">Equipment & Plates</option>
                  <option value="Salary">Staff & Trainer Payroll</option>
                  <option value="Maintenance">Janitorial & Sanitization</option>
                  <option value="Marketing">Marketing & Lead Acquisition</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Olympic Barbell Replacement"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">
                    Amount ({gym?.currency || '₹'})
                  </label>
                  <input
                    type="number"
                    required
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#8b9bc1] block mb-1">Payment Method</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, paymentMethod: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131d36] border border-[#223053] text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option value="BANK_TRANSFER">Bank Wire</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-[#1c2744]">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs text-[#7e8eb2] hover:bg-[#16213a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-display font-bold text-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
