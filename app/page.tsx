export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-light tracking-tight text-white">
          SafeSphere <span className="text-[#C6FF00] font-semibold">AI</span>
        </h1>
        <p className="text-gray-400 font-mono text-sm tracking-wide">
          //: PREDICT. PROTECT. RESPOND.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-[#00E676]">
          <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
          Core Foundation & Middleware Initialized
        </div>
      </div>
    </main>
  );
}
