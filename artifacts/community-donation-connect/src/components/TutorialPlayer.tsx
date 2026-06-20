import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Globe, Maximize2, Minimize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tutorial } from "@/data/tutorialContent";

const STORAGE_KEY = "cdc_tutorial_progress";

function loadProgress(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveProgress(id: string, step: number) {
  const p = loadProgress();
  p[id] = step;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

interface TutorialPlayerProps {
  tutorial: Tutorial;
  compact?: boolean;
  onClose?: () => void;
}

export function TutorialPlayer({ tutorial, compact = false, onClose }: TutorialPlayerProps) {
  const saved = loadProgress()[tutorial.id] ?? 0;
  const [current, setCurrent] = useState(Math.min(saved, tutorial.steps.length - 1));
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [lang, setLang] = useState<"en" | "te">("en");
  const [fullscreen, setFullscreen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const TICK = 80;

  const step = tutorial.steps[current];
  const stepDuration = step.duration ?? 4000;
  const totalSteps = tutorial.steps.length;
  const completed = loadProgress()[tutorial.id] >= totalSteps - 1;

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const goTo = useCallback((idx: number, autoplay = false) => {
    stop();
    setElapsed(0);
    const next = Math.max(0, Math.min(idx, totalSteps - 1));
    setCurrent(next);
    saveProgress(tutorial.id, next);
    if (!autoplay) setPlaying(false);
  }, [stop, totalSteps, tutorial.id]);

  useEffect(() => {
    stop();
    if (!playing) return;
    setElapsed(0);
    intervalRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + TICK;
        if (next >= stepDuration) {
          const nextStep = current + 1;
          if (nextStep >= totalSteps) {
            setPlaying(false);
            saveProgress(tutorial.id, totalSteps - 1);
            stop();
            return stepDuration;
          }
          setCurrent(nextStep);
          saveProgress(tutorial.id, nextStep);
          return 0;
        }
        return next;
      });
    }, TICK);
    return stop;
  }, [playing, current, stepDuration, totalSteps, stop, tutorial.id]);

  const togglePlay = () => {
    if (!playing && current >= totalSteps - 1 && elapsed >= stepDuration - TICK) {
      goTo(0, true);
      setTimeout(() => setPlaying(true), 50);
    } else {
      setPlaying((p) => !p);
    }
  };

  const progressPct =
    ((current / totalSteps) + (Math.min(elapsed, stepDuration) / stepDuration / totalSteps)) * 100;

  const title = lang === "te" ? step.titleTe : step.title;
  const desc = lang === "te" ? step.descTe : step.desc;
  const tutTitle = lang === "te" ? tutorial.titleTe : tutorial.title;
  const tutSub = lang === "te" ? tutorial.subtitleTe : tutorial.subtitle;

  const isFinished = current >= totalSteps - 1 && elapsed >= stepDuration - TICK && !playing;

  const container = (
    <div className={`flex flex-col bg-white rounded-2xl border shadow-sm overflow-hidden ${fullscreen ? "fixed inset-4 z-50 rounded-3xl shadow-2xl" : ""}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b flex items-center gap-3 bg-gradient-to-r ${tutorial.color} text-white shrink-0`}>
        <span className="text-2xl">{tutorial.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight truncate">{tutTitle}</p>
          <p className="text-xs opacity-80 truncate">{tutSub}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setLang((l) => l === "en" ? "te" : "en")}
            className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors"
            title="Toggle language"
          >
            <Globe size={12} />
            {lang === "en" ? "తెలుగు" : "English"}
          </button>
          <button
            onClick={() => setFullscreen((f) => !f)}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Visual area */}
      <div className={`flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4 ${compact ? "min-h-[240px]" : "min-h-[280px] flex-1"}`}>
        <div key={`${tutorial.id}-${current}`} className="w-full animate-in fade-in zoom-in-95 duration-300">
          {step.visual}
        </div>
      </div>

      {/* Caption */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-start gap-2">
          <div className="shrink-0 mt-0.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {current + 1}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-snug">{title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="px-4 pb-1 shrink-0">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-100 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
          <span>Step {current + 1} of {totalSteps}</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-1 pb-2 shrink-0">
        {tutorial.steps.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? "w-5 bg-primary" : i < current ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted-foreground/20"
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 px-4 pb-4 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => goTo(current - 1)} disabled={current === 0}>
          <ChevronLeft size={16} />
        </Button>

        <Button onClick={togglePlay} size="sm" className={`flex-1 gap-2 bg-gradient-to-r ${tutorial.color} hover:opacity-90 text-white border-0`}>
          {isFinished ? <><RotateCcw size={13} /> Replay</> : playing ? <><Pause size={13} /> Pause</> : <><Play size={13} /> {current === 0 && elapsed === 0 ? "Play" : "Resume"}</>}
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => goTo(current + 1)} disabled={current >= totalSteps - 1}>
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Completion badge */}
      {isFinished && (
        <div className="mx-4 mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 text-center font-medium">
          Tutorial complete! You can replay or explore the next one.
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setFullscreen(false)} />
        {container}
      </>
    );
  }

  return container;
}

/* Compact card for home page preview */
export function TutorialCard({ tutorial, onClick }: { tutorial: Tutorial; onClick: () => void }) {
  const progress = loadProgress();
  const done = progress[tutorial.id] ?? 0;
  const total = tutorial.steps.length;
  const pct = Math.round((done / (total - 1)) * 100);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border bg-white hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden group"
    >
      <div className={`h-2 bg-gradient-to-r ${tutorial.color}`} />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tutorial.color} flex items-center justify-center text-2xl shadow-sm`}>
            {tutorial.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight">{tutorial.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{tutorial.subtitle}</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{total} steps</span>
            <span>{pct}% complete</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${tutorial.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className={`flex-1 text-center py-1.5 rounded-lg bg-gradient-to-r ${tutorial.color} text-white text-xs font-semibold group-hover:opacity-90 transition-opacity`}>
            {pct === 0 ? "Start Tutorial" : pct === 100 ? "Watch Again" : "Continue"}
          </div>
        </div>
      </div>
    </button>
  );
}
