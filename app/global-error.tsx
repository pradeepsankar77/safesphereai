'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white flex flex-col items-center justify-center min-h-screen p-4 font-mono text-center">
        <div className="p-8 rounded-2xl bg-[#0b0b0b] border border-white/10 max-w-md w-full space-y-4">
          <span className="text-xs text-[#C6FF00] tracking-widest uppercase block">
            //: RECOVERABLE EXCEPTION
          </span>
          <h2 className="text-lg font-light text-white">
            System encountered an unexpected state
          </h2>
          <p className="text-xs text-zinc-400">
            {error.message || 'An unexpected error occurred during execution.'}
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-2.5 rounded-xl bg-[#C6FF00] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#d4ff33] transition-colors cursor-pointer"
          >
            RETRY APPLICATION
          </button>
        </div>
      </body>
    </html>
  );
}
