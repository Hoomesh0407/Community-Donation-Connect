import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetTrustLeaderboard } from "@workspace/api-client-react";
import { TrustBadge } from "@/components/ui/trust-badge";
import { Star, Award } from "lucide-react";

const RANK_STYLES = [
  "bg-amber-50 border-amber-300",
  "bg-slate-50 border-slate-300",
  "bg-orange-50 border-orange-300",
];

const RANK_LABELS = ["1st", "2nd", "3rd"];

export default function Leaderboard() {
  const { data: leaders, isLoading } = useGetTrustLeaderboard();

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Award size={32} className="text-amber-500" />
            <h1 className="text-3xl font-bold">Trust Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">
            Top community donors ranked by trust score
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground font-medium uppercase tracking-wide text-center">
          <span>Donor</span>
          <span>Trust Level</span>
          <span>Stats</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="h-20 animate-pulse bg-muted" />
            ))}
          </div>
        ) : !leaders?.length ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground space-y-2">
              <Award size={40} className="mx-auto text-muted-foreground/30" />
              <p>No donors ranked yet. Be the first to donate!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {leaders.map((entry, idx) => (
              <Card
                key={entry.userId}
                className={`transition-all border-2 ${idx < 3 ? RANK_STYLES[idx] : "border-border"}`}
              >
                <CardContent className="py-4 px-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      idx === 0 ? "bg-amber-400 text-white" :
                      idx === 1 ? "bg-slate-400 text-white" :
                      idx === 2 ? "bg-orange-400 text-white" :
                      "bg-primary/10 text-primary"
                    }`}>
                      {idx < 3 ? RANK_LABELS[idx] : `#${entry.rank}`}
                    </div>

                    {entry.profilePhoto ? (
                      <img src={entry.profilePhoto} alt={entry.fullName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center shrink-0">
                        {entry.fullName.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{entry.fullName}</p>
                      <TrustBadge score={entry.trustScore} level={entry.trustLevel} />
                    </div>

                    <div className="text-right space-y-1 shrink-0">
                      <p className="text-sm font-medium">{entry.totalDonations} donations</p>
                      {entry.averageRating != null && (
                        <div className="flex items-center gap-1 justify-end text-amber-500 text-sm">
                          <Star size={13} fill="currentColor" />
                          <span className="font-medium">{entry.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl font-bold text-primary">{entry.trustScore}</span>
                      <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-muted/40 border-dashed">
          <CardContent className="py-4 px-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">How trust scores work</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              {[
                { label: "New", range: "0–50 pts", color: "text-muted-foreground" },
                { label: "Trusted", range: "51–150 pts", color: "text-blue-600" },
                { label: "Highly Trusted", range: "151–300 pts", color: "text-green-600" },
                { label: "Champion", range: "301+ pts", color: "text-amber-600" },
              ].map((tier) => (
                <div key={tier.label} className="space-y-1">
                  <p className={`font-semibold ${tier.color}`}>{tier.label}</p>
                  <p className="text-muted-foreground">{tier.range}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
