import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useListMatches, useAcceptMatch, useConfirmMatch, useCreateReview } from "@workspace/api-client-react";
import type { Match } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, CheckCircle, Clock, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const STATUS_COLORS: Record<string, string> = {
  pending: "secondary",
  accepted: "default",
  confirmed: "default",
  completed: "default",
  rejected: "destructive",
  cancelled: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  confirmed: "Confirmed",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`transition-colors ${s <= value ? "text-amber-400" : "text-muted-foreground/40"}`}
        >
          <Star size={24} fill={s <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

export default function Matches() {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const { data: matches, isLoading, refetch } = useListMatches();
  const acceptMatch = useAcceptMatch();
  const confirmMatch = useConfirmMatch();
  const createReview = useCreateReview();

  const [reviewMatch, setReviewMatch] = useState<Match | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewQuality, setReviewQuality] = useState(5);
  const [reviewCondition, setReviewCondition] = useState(5);

  const handleAccept = (id: number) => {
    acceptMatch.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Match accepted!" });
        refetch();
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      },
    });
  };

  const handleConfirm = (id: number) => {
    confirmMatch.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Exchange confirmed!", description: "Please leave a review." });
        refetch();
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      },
    });
  };

  const submitReview = () => {
    if (!reviewMatch) return;
    createReview.mutate(
      {
        data: {
          matchId: reviewMatch.id,
          qualityRating: reviewQuality,
          conditionRating: reviewCondition,
          satisfactionRating: reviewRating,
          feedback: reviewComment || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Review submitted!", description: "Thank you for helping build community trust." });
          setReviewMatch(null);
          setReviewComment("");
          setReviewRating(5);
          refetch();
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-24">
          <Card className="max-w-md w-full text-center">
            <CardContent className="py-12 space-y-4">
              <h2 className="text-xl font-semibold">Sign in to view matches</h2>
              <Button asChild><Link href="/login">Login</Link></Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold">Your Matches</h1>
          <p className="text-muted-foreground mt-1">Connections between you and the community</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-32 animate-pulse bg-muted" />
            ))}
          </div>
        ) : !matches?.length ? (
          <Card>
            <CardContent className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-primary/40" />
              </div>
              <h3 className="text-xl font-semibold">No matches yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Matches appear here when a donor's item aligns with a receiver's request nearby.
              </p>
              {user?.role === "donor" ? (
                <Button asChild variant="outline"><Link href="/donate">List an Item</Link></Button>
              ) : (
                <Button asChild variant="outline"><Link href="/request">Request an Item</Link></Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const isDonor = match.donorId === user?.id;
              const myAccepted = isDonor ? match.donorAccepted : match.receiverAccepted;
              const theirAccepted = isDonor ? match.receiverAccepted : match.donorAccepted;
              const contactRevealed = match.donorAccepted && match.receiverAccepted;
              const otherPhone = isDonor ? match.receiverPhone : match.donorPhone;
              const otherEmail = isDonor ? match.receiverEmail : match.donorEmail;
              const otherName = isDonor ? match.receiverName : match.donorName;

              return (
                <Card key={match.id} className="overflow-hidden">
                  <div className={`h-1 w-full ${
                    match.status === "completed" ? "bg-green-500" :
                    match.status === "confirmed" ? "bg-blue-500" :
                    match.status === "accepted" ? "bg-amber-500" :
                    match.status === "pending" ? "bg-muted-foreground/30" : "bg-destructive/40"
                  }`} />
                  <CardContent className="pt-4 pb-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{match.itemName}</h3>
                          <Badge variant={STATUS_COLORS[match.status] as any}>
                            {STATUS_LABELS[match.status] || match.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{match.category}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin size={13} /> {match.distanceKm.toFixed(1)} km away
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isDonor ? "Receiver" : "Donor"}: <span className="font-medium text-foreground">{otherName || "—"}</span>
                        </div>

                        {contactRevealed && (otherPhone || otherEmail) ? (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg space-y-1">
                            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Contact Revealed</p>
                            {otherPhone && (
                              <div className="flex items-center gap-2 text-sm text-green-800">
                                <Phone size={13} /> {otherPhone}
                              </div>
                            )}
                            {otherEmail && (
                              <div className="flex items-center gap-2 text-sm text-green-800">
                                <Mail size={13} /> {otherEmail}
                              </div>
                            )}
                          </div>
                        ) : match.status === "pending" || match.status === "accepted" ? (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={12} />
                            {myAccepted
                              ? "Waiting for the other party to accept..."
                              : "Accept to reveal contact info after both agree."}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2 items-start">
                        {(match.status === "pending" || match.status === "accepted") && !myAccepted && (
                          <Button size="sm" onClick={() => handleAccept(match.id)} disabled={acceptMatch.isPending}>
                            Accept Match
                          </Button>
                        )}
                        {match.status === "accepted" && myAccepted && theirAccepted && (
                          <Button size="sm" variant="outline" onClick={() => handleConfirm(match.id)} disabled={confirmMatch.isPending}>
                            Confirm Exchange
                          </Button>
                        )}
                        {match.status === "confirmed" && (
                          <Button size="sm" variant="outline" onClick={() => setReviewMatch(match)}>
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!reviewMatch} onOpenChange={(open) => !open && setReviewMatch(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              How was the experience donating/receiving "{reviewMatch?.itemName}"?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label>Overall Rating</Label>
              <StarRating value={reviewRating} onChange={setReviewRating} />
            </div>
            <div className="space-y-2">
              <Label>Item Quality</Label>
              <StarRating value={reviewQuality} onChange={setReviewQuality} />
            </div>
            <div className="space-y-2">
              <Label>Item Condition</Label>
              <StarRating value={reviewCondition} onChange={setReviewCondition} />
            </div>
            <div className="space-y-2">
              <Label>Comment (optional)</Label>
              <Textarea
                placeholder="Share your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
              />
            </div>
            <Button className="w-full" onClick={submitReview} disabled={createReview.isPending}>
              {createReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
