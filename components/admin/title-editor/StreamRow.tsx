'use client';

export function StreamRow({
  thumbnail,
  children,
  action,
}: {
  thumbnail: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 shadow-sm flex flex-row items-center gap-4 hover:bg-white/10 transition-colors">
      <div className="w-32 aspect-video bg-black border border-white/5 rounded-md overflow-hidden relative flex-shrink-0 flex items-center justify-center">
        {thumbnail}
      </div>
      <div className="flex-1 flex flex-col justify-center min-w-0">{children}</div>
      {action && <div className="flex items-center pr-2">{action}</div>}
    </div>
  );
}
