import React, { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TutorialPlayer, TutorialCard } from "@/components/TutorialPlayer";
import { TUTORIALS } from "@/data/tutorialContent";
import type { Tutorial } from "@/data/tutorialContent";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, PlayCircle, CheckCircle2 } from "lucide-react";

const CATEGORIES = ["All", "Getting Started", "Donating", "Receiving", "Matching", "Trust"];

function getProgress(id: string, total: number): number {
  try {
    const p = JSON.parse(localStorage.getItem("cdc_tutorial_progress") || "{}");
    return Math.round(((p[id] ?? 0) / (total - 1)) * 100);
  } catch { return 0; }
}

export default function TutorialsPage() {
  const [active, setActive] = useState<Tutorial | null>(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() => TUTORIALS.filter((t) => {
    const matchesCat = cat === "All" || t.category === cat;
    const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  }), [cat, search]);

  const completed = TUTORIALS.filter((t) => getProgress(t.id, t.steps.length) === 100).length;
  const inProgress = TUTORIALS.filter((t) => { const p = getProgress(t.id, t.steps.length); return p > 0 && p < 100; }).length;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Page header */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold">
            <BookOpen size={14} />
            Tutorial Center
          </div>
          <h1 className="text-4xl font-extrabold">Learn How CDC Works</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Step-by-step animated tutorials in English and Telugu — from registration to becoming a Community Champion.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { icon: <PlayCircle size={16} />, label: "Total Tutorials", value: TUTORIALS.length, color: "text-blue-600" },
            { icon: <CheckCircle2 size={16} />, label: "Completed", value: completed, color: "text-green-600" },
            { icon: <BookOpen size={16} />, label: "In Progress", value: inProgress, color: "text-amber-600" },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border p-4 text-center">
              <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Active player */}
        {active && (
          <div className="max-w-2xl mx-auto">
            <TutorialPlayer tutorial={active} onClose={() => setActive(null)} />
          </div>
        )}

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tutorials..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  cat === c ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted hover:bg-muted/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Tutorial grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => (
            <TutorialCard key={t.id} tutorial={t} onClick={() => { setActive(t); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-muted-foreground">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p>No tutorials match your search.</p>
            </div>
          )}
        </div>

        {/* Continue watching */}
        {inProgress > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h3 className="font-semibold text-amber-800 mb-3">Continue Watching</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TUTORIALS.filter((t) => { const p = getProgress(t.id, t.steps.length); return p > 0 && p < 100; }).map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setActive(t); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="flex items-center gap-3 bg-white rounded-xl border border-amber-200 p-3 hover:shadow-sm transition text-left"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-xl shrink-0`}>{t.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{t.title}</p>
                    <p className="text-xs text-amber-600">{getProgress(t.id, t.steps.length)}% complete</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Language note */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
          <p className="text-sm text-blue-800">
            All tutorials support <strong>English</strong> and <strong>తెలుగు</strong> captions.
            Use the language toggle (Globe icon) inside any tutorial to switch instantly.
          </p>
        </div>

      </div>
    </AppLayout>
  );
}
