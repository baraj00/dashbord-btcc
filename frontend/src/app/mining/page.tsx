import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mining Guide — BTCC Explorer',
  description: 'Step-by-step guide to start mining Bitcoin Classic (BTCC)',
};

interface Step {
  number: number;
  title: string;
  subtitle: string;
  comment: string;
  commands: string[];
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Update your system',
    subtitle: '系统更新',
    comment: '# Make sure your system is up to date',
    commands: [
      'sudo apt update && sudo apt upgrade -y',
    ],
  },
  {
    number: 2,
    title: 'Install dependencies',
    subtitle: '安装依赖',
    comment: '# Install the required build tools',
    commands: [
      'sudo apt install -y build-essential git curl wget',
    ],
  },
  {
    number: 3,
    title: 'Install a CPU miner',
    subtitle: '安装挖矿程序',
    comment: '# Clone and build cpuminer-multi',
    commands: [
      'git clone https://github.com/tpruvot/cpuminer-multi.git',
      'cd cpuminer-multi',
      './build.sh',
    ],
  },
  {
    number: 4,
    title: 'Start mining BTCC',
    subtitle: '开始挖矿',
    comment: '# Connect to a BTCC mining pool and start earning',
    commands: [
      './cpuminer -a sha256d -o stratum+tcp://POOL_ADDRESS:PORT -u YOUR_WALLET_ADDRESS -p x',
    ],
  },
];

function TerminalBlock({ step }: { step: Step }) {
  return (
    <div className="rounded-xl overflow-hidden border border-dark-200 shadow-2xl">
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a2e] border-b border-dark-200">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-slate-500 font-mono">Terminal</span>
      </div>

      {/* Terminal body */}
      <div className="bg-[#0d1117] px-5 py-5 font-mono text-sm space-y-2">
        {/* Comment line */}
        <p className="text-slate-500">{step.comment}</p>

        {/* Commands */}
        {step.commands.map((cmd, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[#28c840] select-none flex-shrink-0">$</span>
            <span className="text-slate-100 break-all">{cmd}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MiningPage() {
  return (
    <main className="container mx-auto px-4 max-w-3xl py-12">
      {/* Page header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">⛏️</span>
          <h1 className="text-2xl font-bold text-slate-100">Mining Guide</h1>
          <span className="text-slate-500 text-sm font-medium">/ 挖矿指南</span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
          Follow these steps to start mining Bitcoin Classic (BTCC) on Linux.
          No prior experience needed — each command is explained.
          <br />
          <span className="text-slate-500">按照以下步骤在 Linux 上开始挖矿 BTCC。</span>
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-10">
        {steps.map((step) => (
          <div key={step.number} className="space-y-3">
            {/* Step header */}
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-btcc-500/20 text-btcc-400 text-xs font-bold flex-shrink-0">
                {step.number}
              </span>
              <div>
                <h2 className="text-slate-200 font-semibold text-sm">{step.title}</h2>
                <span className="text-slate-500 text-xs">{step.subtitle}</span>
              </div>
            </div>

            {/* Terminal block */}
            <TerminalBlock step={step} />
          </div>
        ))}
      </div>

      {/* Note at the bottom */}
      <div className="mt-12 rounded-lg border border-btcc-500/20 bg-btcc-500/5 px-5 py-4 text-sm text-slate-400 space-y-1">
        <p className="font-medium text-btcc-400">📌 Note</p>
        <p>
          Replace <code className="text-btcc-300 bg-dark-200 px-1 rounded">POOL_ADDRESS:PORT</code> and{' '}
          <code className="text-btcc-300 bg-dark-200 px-1 rounded">YOUR_WALLET_ADDRESS</code> with
          your own values before running the last command.
        </p>
        <p className="text-slate-500 text-xs">
          请将 <code className="text-btcc-300 bg-dark-200 px-1 rounded">POOL_ADDRESS:PORT</code> 和{' '}
          <code className="text-btcc-300 bg-dark-200 px-1 rounded">YOUR_WALLET_ADDRESS</code> 替换为你自己的信息。
        </p>
      </div>
    </main>
  );
}
