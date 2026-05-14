import { api } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  timeAgo, formatDateTime, formatNumber, formatBtcc, shortHash, formatBytes,
} from '@/lib/format';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { CopyButton } from '@/components/ui/CopyButton';
import { Badge } from '@/components/ui/Badge';
import type { Block } from '@shared/types';

interface BlockDetail extends Block {
  transactions: {
    txid: string;
    is_coinbase: boolean;
    fee: string;
    total_output: string;
    time: number;
  }[];
}

interface Props {
  params: { hash: string };
}

export async function generateMetadata({ params }: Props) {
  return { title: `Block ${params.hash.slice(0, 10)}… | BTCC Explorer` };
}

export default async function BlockDetailPage({ params }: Props) {
  let block: BlockDetail;
  try {
    block = await api.get<BlockDetail>(`/block/${params.hash}`);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-btcc-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/blocks" className="hover:text-btcc-400">Blocks</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">{formatNumber(block.height)}</span>
      </nav>

      {/* Block header */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              Block #{formatNumber(block.height)}
            </h1>
            <p className="text-slate-500 text-sm mt-1">{formatDateTime(block.time)}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="green">{block.confirmations} confirmations</Badge>
            <Badge variant="gold">{block.tx_count} transactions</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailRow label="Hash">
            <CopyButton hash={block.hash} className="font-mono text-xs" />
          </DetailRow>
          <DetailRow label="Previous Block">
            <Link href={`/blocks/${block.previousblockhash}`} className="hash text-xs font-mono">
              {shortHash(block.previousblockhash)}
            </Link>
          </DetailRow>
          <DetailRow label="Merkle Root">
            <span className="font-mono text-xs text-slate-400">{shortHash(block.merkleroot)}</span>
          </DetailRow>
          <DetailRow label="Timestamp">
            <span className="text-slate-300">{formatDateTime(block.time)}</span>
          </DetailRow>
          <DetailRow label="Difficulty">
            <span className="font-mono text-slate-300">{formatNumber(Math.round(block.difficulty))}</span>
          </DetailRow>
          <DetailRow label="Nonce">
            <span className="font-mono text-slate-300">{formatNumber(block.nonce)}</span>
          </DetailRow>
          <DetailRow label="Size">
            <span className="font-mono text-slate-300">{formatBytes(block.size)}</span>
          </DetailRow>
          <DetailRow label="Reward">
            <span className="text-btcc-400 font-semibold">{formatBtcc(block.reward)}</span>
          </DetailRow>
          <DetailRow label="Total Fees">
            <span className="font-mono text-slate-300">{formatBtcc(block.total_fees)}</span>
          </DetailRow>
          <DetailRow label="Bits">
            <span className="font-mono text-slate-400">{block.bits}</span>
          </DetailRow>
          <DetailRow label="Version">
            <span className="font-mono text-slate-400">0x{block.version.toString(16)}</span>
          </DetailRow>
          <DetailRow label="Weight">
            <span className="font-mono text-slate-300">{formatNumber(block.weight)} WU</span>
          </DetailRow>
        </div>
      </div>

      {/* Transactions */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-200">
          <h2 className="font-semibold text-slate-200">Transactions ({block.tx_count})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-dark-200">
                <th className="px-4 py-2 text-left">TxID</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Output</th>
                <th className="px-4 py-2 text-right">Fee</th>
              </tr>
            </thead>
            <tbody>
              {block.transactions.map((tx) => (
                <tr key={tx.txid} className="table-row">
                  <td className="px-4 py-3">
                    <Link href={`/tx/${tx.txid}`} className="hash text-xs">
                      {shortHash(tx.txid)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {tx.is_coinbase ? (
                      <Badge variant="gold">Coinbase</Badge>
                    ) : (
                      <Badge variant="blue">Transfer</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300 font-mono">
                    {formatBtcc(tx.total_output)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 font-mono">
                    {tx.is_coinbase ? '—' : formatBtcc(tx.fee)}
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

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-400/50">
      <span className="text-xs text-slate-500 uppercase tracking-wide font-medium w-32 flex-shrink-0 mt-0.5">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
