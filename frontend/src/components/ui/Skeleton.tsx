export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-dark-200 rounded ${className}`}
    />
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-dark-200">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[12rem]" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="stat-card animate-pulse">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-20 mt-1" />
    </div>
  );
}
