import { api } from '@/lib/api';
import Link from 'next/link';
import {
  formatBtcc, formatNumber, shortHash, timeAgo,
} from '@/lib/format';
import { CopyButton } from '@/components/ui/CopyButton';
import { Badge } from '@/components/ui/Badge';
import type { Address, PaginatedResponse, AddressTx } from '@shared/types';

interface Props {
  params: { address: string };
}

export async function generateMetadata({ params }: Props) {
  return { title: `Address ${params.address.slice(0, 12)}… | BTCC Explorer` };
}

export default async function AddressPage({ params }: Props) {
  const { address } = params;
  let addr: Address | null = null;
  let txs: PaginatedResponse<AddressTx> | null = null;

  try {
    [addr, txs] = await Promise.all([
      api.get<Address>(`/address/${address}`),
      api.get<PaginatedResponse<AddressTx>>(`/address/${address}/txs`),
    ]);
  } catch {
    // Address not found — show empty state instead of generic 404
  }

  if (!addr) {
    return (
      <div className="space-y-6 animate-fade-in">
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:text-btcc-400">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Address</span>
        </nav>
        <div className="card p-8 text-center space-y-4">
          <div className="text-4xl">🔍</div>
          <h1 className="text-xl font-bold text-slate-100">Address Not Found</h1>
          <p className="text-slate-400 font-mono text-sm break-all">{address}</p>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            This address has no recorded transactions on the BTCC blockchain yet,
            or the indexer has not synced to the block containing it.
          </p>
          <p className="text-slate-600 text-xs">
            BTCC addresses start with <span className="text-btcc-400 font-mono">cc1q…</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-btcc-400">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">Address</span>
      </nav>

      {/* Address header */}
      <div className="card p-6 space-y-6">
        <div>
          <h1 className="text-lg font-bold text-slate-100 mb-2">Address</h1>
          <CopyButton hash={address} className="font-mono text-sm" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <span className="stat-label">Balance</span>
            <span className="stat-value text-btcc-400">
              {formatBtcc(addr.balance)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Received</span>
            <span className="text-xl font-semibold text-neon-green">
              {formatBtcc(addr.total_received)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Sent</span>
            <span className="text-xl font-semibold text-red-400">
              {formatBtcc(addr.total_sent)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Transactions</span>
            <span className="stat-value">{formatNumber(addr.tx_count)}</span>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-200">
          <h2 className="font-semibold text-slate-200">
            Transaction History ({formatNumber(txs?.total ?? 0)})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-dark-200">
                <th className="px-4 py-2 text-left">TxID</th>
                <th className="px-4 py-2 text-right">Block</th>
                <th className="px-4 py-2 text-right">Age</th>
              </tr>
            </thead>
            <tbody>
              {(txs?.data ?? []).map((tx) => (
                <tr key={tx.txid} className="table-row">
                  <td className="px-4 py-3">
                    <Link href={`/tx/${tx.txid}`} className="hash text-xs">
                      {shortHash(tx.txid)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {tx.blockheight ? (
                      <Link
                        href={`/blocks/${tx.blockheight}`}
                        className="text-btcc-400 hover:text-btcc-300 font-mono"
                      >
                        {formatNumber(tx.blockheight)}
                      </Link>
                    ) : (
                      <Badge variant="orange">Unconfirmed</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">
                    {timeAgo(tx.time)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
