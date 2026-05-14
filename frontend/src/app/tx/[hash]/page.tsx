import { api } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  formatDateTime, formatNumber, formatBtcc, shortHash, formatBytes,
} from '@/lib/format';
import { CopyButton } from '@/components/ui/CopyButton';
import { Badge } from '@/components/ui/Badge';
import type { Transaction } from '@shared/types';

interface Props {
  params: { hash: string };
}

export async function generateMetadata({ params }: Props) {
  return { title: `Tx ${params.hash.slice(0, 10)}… | BTCC Explorer` };
}

export default async function TxPage({ params }: Props) {
  let tx: Transaction;
  try {
    tx = await api.get<Transaction>(`/tx/${params.hash}`);
  } catch {
    notFound();
  }

  const fee = BigInt(tx.fee);
  const feeRate = tx.vsize > 0 ? Number(fee) / tx.vsize : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-btcc-400">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">Transaction</span>
      </nav>

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg font-bold text-slate-100">Transaction</h1>
            <CopyButton hash={tx.txid} className="mt-2" />
          </div>
          <div className="flex flex-wrap gap-2">
            {tx.is_coinbase && <Badge variant="gold">Coinbase</Badge>}
            {tx.blockhash ? (
              <Badge variant="green">{tx.confirmations} confirmations</Badge>
            ) : (
              <Badge variant="orange">Unconfirmed</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tx.blockhash && (
            <DetailRow label="Block">
              <Link
                href={`/blocks/${tx.blockhash}`}
                className="hash text-xs font-mono"
              >
                {shortHash(tx.blockhash)}
              </Link>
              <span className="ml-2 text-slate-500 text-xs">
                (#{formatNumber(tx.blockheight!)})
              </span>
            </DetailRow>
          )}
          <DetailRow label="Time">
            <span className="text-slate-300">{formatDateTime(tx.time)}</span>
          </DetailRow>
          <DetailRow label="Size">
            <span className="font-mono text-slate-300">
              {formatBytes(tx.size)} / {tx.vsize} vbytes
            </span>
          </DetailRow>
          <DetailRow label="Fee">
            <span className="font-mono text-slate-300">
              {formatBtcc(tx.fee)}{' '}
              <span className="text-slate-500">({feeRate.toFixed(2)} sat/vB)</span>
            </span>
          </DetailRow>
          <DetailRow label="Version">
            <span className="font-mono text-slate-400">{tx.version}</span>
          </DetailRow>
          <DetailRow label="Locktime">
            <span className="font-mono text-slate-400">{tx.locktime}</span>
          </DetailRow>
          <DetailRow label="Total Input">
            <span className="font-mono text-slate-300">{formatBtcc(tx.total_input)}</span>
          </DetailRow>
          <DetailRow label="Total Output">
            <span className="font-mono text-slate-300">{formatBtcc(tx.total_output)}</span>
          </DetailRow>
        </div>
      </div>

      {/* Inputs & Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-200">
            <h2 className="font-semibold text-slate-200">
              Inputs ({tx.vin.length})
            </h2>
          </div>
          <div className="divide-y divide-dark-200">
            {tx.vin.map((vin, i) => (
              <div key={i} className="p-4 space-y-1">
                {vin.coinbase ? (
                  <div>
                    <Badge variant="gold">Coinbase</Badge>
                    <p className="text-xs text-slate-500 font-mono mt-1 break-all">
                      {vin.coinbase}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">From:</span>
                      {vin.address ? (
                        <Link
                          href={`/address/${vin.address}`}
                          className="hash text-xs"
                        >
                          {shortHash(vin.address, 12, 8)}
                        </Link>
                      ) : (
                        <span className="text-slate-600 text-xs">unknown</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Amount:</span>
                      <span className="font-mono text-xs text-slate-300">
                        {vin.value ? formatBtcc(vin.value) : '—'}
                      </span>
                    </div>
                    {vin.prev_txid && (
                      <p className="text-xs text-slate-600 font-mono">
                        {shortHash(vin.prev_txid)}:{vin.prev_vout}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Outputs */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-200">
            <h2 className="font-semibold text-slate-200">
              Outputs ({tx.vout.length})
            </h2>
          </div>
          <div className="divide-y divide-dark-200">
            {tx.vout.map((vout, i) => (
              <div key={i} className="p-4 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {vout.address ? (
                      <Link
                        href={`/address/${vout.address}`}
                        className="hash text-xs"
                      >
                        {shortHash(vout.address, 12, 8)}
                      </Link>
                    ) : (
                      <span className="text-slate-600 text-xs">OP_RETURN / non-standard</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-xs text-btcc-400">
                      {formatBtcc(vout.value)}
                    </span>
                    {vout.spent ? (
                      <Badge variant="orange" size="sm">Spent</Badge>
                    ) : (
                      <Badge variant="green" size="sm">Unspent</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-400/50">
      <span className="text-xs text-slate-500 uppercase tracking-wide font-medium w-28 flex-shrink-0 mt-0.5">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
