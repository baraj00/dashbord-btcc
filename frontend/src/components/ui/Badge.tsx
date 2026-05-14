import clsx from 'clsx';

interface Props {
  children: React.ReactNode;
  variant?: 'green' | 'blue' | 'orange' | 'red' | 'gold';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  green:  'bg-neon-green/10 text-neon-green border-neon-green/20',
  blue:   'bg-neon-blue/10 text-neon-blue border-neon-blue/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  red:    'bg-red-500/10 text-red-400 border-red-500/20',
  gold:   'bg-btcc-500/10 text-btcc-400 border-btcc-500/20',
};

const sizes = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-sm',
};

export function Badge({ children, variant = 'gold', size = 'sm', className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded border font-medium',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
