import { ScheduleView } from '@/components/schedule/ScheduleView';

export default function SchedulePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Match Schedule</h1>
        <p className="text-sm text-white/40 mt-1">All 104 matches · June 11 – July 19, 2026 · Times in ET</p>
      </div>
      <ScheduleView />
    </div>
  );
}
