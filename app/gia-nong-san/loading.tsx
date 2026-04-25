export default function Loading() {
  return (
    <div className="min-h-screen bg-[#07111a] px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-6 w-40 rounded-full bg-white/10" />
        <div className="h-24 rounded-[2rem] bg-white/5" />
        <div className="h-24 rounded-[2rem] bg-white/5" />
        <div className="h-[480px] rounded-[2rem] bg-white/5" />
      </div>
    </div>
  );
}
