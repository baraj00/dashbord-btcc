export function RecentMempool() {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-200">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-200">Mempool</h2>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
        <span className="text-3xl">🔧</span>
        <p className="text-sm font-medium text-slate-400">Coming soon</p>
        <p className="text-xs text-center max-w-xs">
          实时内存池需要完整的 BTCC 节点，敬请期待。
        </p>
      </div>
    </div>
  );
}
