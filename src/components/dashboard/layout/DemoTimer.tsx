import { Timer } from 'lucide-react';

interface DemoTimerProps {
  remainingTime: number; // in milliseconds
}

function formatTime(ms: number) {
  if (ms < 0) {
    ms = 0;
  }
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function DemoTimer({ remainingTime }: DemoTimerProps) {
  const formattedTime = formatTime(remainingTime);

  return (
    <div className="bg-background border-border fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full border px-4 py-2 shadow-lg">
      <Timer className="text-primary h-5 w-5" />
      <div className="flex flex-col text-right">
        <span className="text-foreground text-sm font-medium">Δοκιμαστική Περίοδος</span>
        <span className="text-muted-foreground text-xs">Απομένει: {formattedTime}</span>
      </div>
    </div>
  );
}
