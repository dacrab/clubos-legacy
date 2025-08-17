import { Timer } from 'lucide-react';

interface DemoTimerProps {
  remainingTime: number; // in milliseconds
}

function formatTime(ms: number) {
  if (ms < 0) {ms = 0;}
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function DemoTimer({ remainingTime }: DemoTimerProps) {
  const formattedTime = formatTime(remainingTime);

  return (
    <div className="fixed bottom-4 right-4 bg-background border border-border rounded-full px-4 py-2 flex items-center gap-2 shadow-lg z-50">
      <Timer className="h-5 w-5 text-primary" />
      <div className="flex flex-col text-right">
        <span className="text-sm font-medium text-foreground">Δοκιμαστική Περίοδος</span>
        <span className="text-xs text-muted-foreground">Απομένει: {formattedTime}</span>
      </div>
    </div>
  );
} 