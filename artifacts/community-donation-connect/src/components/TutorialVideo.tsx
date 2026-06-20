import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  title: string;
  description: string;
  visual: React.ReactNode;
  duration?: number;
}

interface TutorialVideoProps {
  title: string;
  subtitle: string;
  steps: Step[];
  accentColor?: string;
}

export function TutorialVideo({ title, subtitle, steps, accentColor = "#1e40af" }: TutorialVideoProps) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const STEP_DURATION = steps[current]?.duration ?? 4000;
  const TICK = 50;

  const clearAll = useCallback(() => {
    if (intervalRef.current) clearTimeout(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  const goTo = useCallback((idx: number) => {
    clearAll();
    setPlaying(false);
    setProgress(0);
    setCurrent(Math.max(0, Math.min(idx, steps.length - 1)));
  }, [clearAll, steps.length]);

  const startPlay = useCallback(() => {
    clearAll();
    setProgress(0);
    let elapsed = 0;
    progressRef.current = setInterval(() => {
      elapsed += TICK;
      setProgress(Math.min((elapsed / STEP_DURATION) * 100, 100));
    }, TICK);
    intervalRef.current = setTimeout(() => {
      setCurrent(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          setPlaying(false);
          setProgress(100);
          return prev;
        }
        setProgress(0);
        return next;
      });
    }, STEP_DURATION);
  }, [clearAll, STEP_DURATION, steps.length]);

  useEffect(() => {
    if (playing) startPlay();
    else clearAll();
    return clearAll;
  }, [playing, current, startPlay, clearAll]);

  const toggle = () => {
    if (current >= steps.length - 1 && progress >= 100) {
      goTo(0);
      setTimeout(() => setPlaying(true), 50);
    } else {
      setPlaying(p => !p);
    }
  };

  const step = steps[current];

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400 block" />
            <span className="w-3 h-3 rounded-full bg-yellow-400 block" />
            <span className="w-3 h-3 rounded-full bg-green-400 block" />
          </div>
          <div className="ml-2">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Visual area */}
      <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 min-h-[220px] flex flex-col items-center justify-center p-6 transition-all duration-500">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm animate-in fade-in zoom-in-95 duration-300" key={current}>
          <div className="w-20 h-20 flex items-center justify-center">
            {step.visual}
          </div>
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
              Step {current + 1} of {steps.length}
            </div>
            <h4 className="text-lg font-bold text-foreground leading-snug">{step.title}</h4>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{step.description}</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted relative overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all"
          style={{ width: `${((current / steps.length) + (progress / 100 / steps.length)) * 100}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-1.5 py-3 px-4">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-primary" : i < current ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted-foreground/20"}`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 pb-4 gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
        >
          <ChevronLeft size={18} />
        </Button>

        <Button
          onClick={toggle}
          size="sm"
          className="gap-2 px-6 flex-1 max-w-[160px]"
        >
          {current >= steps.length - 1 && progress >= 100 ? (
            <><RotateCcw size={14} /> Replay</>
          ) : playing ? (
            <><Pause size={14} /> Pause</>
          ) : (
            <><Play size={14} /> {current === 0 && progress === 0 ? "Play" : "Resume"}</>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => goTo(current + 1)}
          disabled={current >= steps.length - 1}
        >
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}
