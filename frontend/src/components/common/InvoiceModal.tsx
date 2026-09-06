import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface InvoiceModalProps {
  invoiceNumber: string | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoiceNumber, onClose }) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoiceNumber) {
      setLoading(true);
      api
        .getInvoice(invoiceNumber)
        .then((res) => setInvoice(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [invoiceNumber]);

  if (!invoiceNumber) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-[calc(100%-24px)] sm:max-w-2xl bg-[#0f172a] border border-[#233152] rounded-3xl shadow-2xl p-4 sm:p-8 text-[#dae2fd] my-auto max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-[#1e2c4d]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
            <h2 className="font-display font-extrabold text-base sm:text-lg text-white">Tax Invoice</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#172340] hover:bg-[#1e2f57] border border-[#263760] text-xs font-semibold text-white transition min-h-[38px]"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>Print / PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-[#7382a5] hover:text-white min-h-[38px] min-w-[38px] flex items-center justify-center">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-[#7383a8]">Loading invoice data...</div>
        ) : invoice ? (
          <div id="printable-invoice" className="pt-4 sm:pt-6 space-y-4 sm:space-y-6">
            {/* Gym Header & Invoice Metas */}
            <div className="flex flex-col md:flex-row justify-between gap-4 sm:gap-6">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary text-[#0b1326] flex items-center justify-center font-extrabold text-sm shrink-0">
                    FC
                  </div>
                  <span className="font-display font-extrabold text-lg sm:text-xl text-white tracking-wider">
                    {invoice.gym?.name}
                  </span>
                </div>
                <div className="text-xs text-[#8090b4] max-w-xs leading-relaxed">
                  {invoice.gym?.address}
                  <br />
                  Email: {invoice.gym?.email} • Tel: {invoice.gym?.phone}
                </div>
              </div>

              <div className="text-left md:text-right space-y-1 border-t md:border-t-0 border-[#1c2742] pt-2 md:pt-0">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
                  Payment Status: {invoice.status}
                </div>
                <div className="text-xs font-mono text-[#a5b4d8] pt-1">
                  Invoice #: <span className="font-bold text-white">{invoice.invoiceNumber}</span>
                </div>
                <div className="text-xs font-mono text-[#8090b4]">
                  Txn ID: {invoice.transactionId}
                </div>
                <div className="text-xs text-[#8090b4]">Date: {invoice.date}</div>
              </div>
            </div>

            {/* Billed To */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#131d36] border border-[#202d4f] flex flex-col md:flex-row justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-[#7384a8] uppercase tracking-wider block mb-1">
                  Billed Client:
                </span>
                <div className="font-display font-bold text-sm text-white">{invoice.member?.name}</div>
                <div className="text-xs font-mono text-primary font-medium">{invoice.member?.memberId}</div>
                <div className="text-xs text-[#8292b6] mt-0.5">{invoice.member?.email}</div>
              </div>

              <div className="text-left md:text-right">
                <span className="text-[11px] font-semibold text-[#7384a8] uppercase tracking-wider block mb-1">
                  Payment Method:
                </span>
                <div className="font-mono font-bold text-xs text-white uppercase">
                  {invoice.paymentMethod}
                </div>
                <div className="text-xs text-[#7c8cae] mt-1">{invoice.notes || 'Gym Membership Services'}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-[#202d4f] rounded-2xl overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[400px]">
                <thead className="bg-[#141f39] text-[#7889ae] uppercase text-[10px] tracking-wider border-b border-[#202d4f]">
                  <tr>
                    <th className="p-3.5">Service Description</th>
                    <th className="p-3.5 text-center">Period</th>
                    <th className="p-3.5 text-right">Taxable Amt</th>
                    <th className="p-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#182542]">
                  <tr>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">
                        {invoice.plan?.name || 'Performance Gym Membership Tier'}
                      </div>
                      <div className="text-[11px] text-[#7e8eb3]">
                        {invoice.plan?.features?.join(' • ') || 'Full facility access'}
                      </div>
                    </td>
                    <td className="p-3.5 text-center text-[#90a0c4] font-mono">
                      {invoice.plan?.durationMonths || 12} Months
                    </td>
                    <td className="p-3.5 text-right font-mono text-[#90a0c4]">
                      {invoice.gym?.currency}
                      {invoice.subtotal?.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      {invoice.gym?.currency}
                      {invoice.total?.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Subtotal & Total summary */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-[#8596bd]">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">
                    {invoice.gym?.currency}
                    {invoice.subtotal?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#8596bd]">
                  <span>GST / Tax (18%):</span>
                  <span className="font-mono font-semibold">
                    {invoice.gym?.currency}
                    {invoice.taxGst?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-display font-extrabold text-white border-t border-[#233152] pt-2">
                  <span>Grand Total:</span>
                  <span className="text-primary font-mono">
                    {invoice.gym?.currency}
                    {invoice.total?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1a253e] text-center text-[11px] text-[#5e6d8e]">
              Thank you for training with {invoice.gym?.name}. Official computer generated receipt.
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-rose-400">Invoice not found.</div>
        )}
      </div>
    </div>
  );
};
