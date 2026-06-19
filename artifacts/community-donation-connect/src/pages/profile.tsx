import React from "react";
import { useParams, Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetUser, useGetUserTrust, useGetDonorReviews, useListDonations } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { TrustBadge } from "@/components/ui/trust-badge";
import { Star, MapPin, CheckCircle, Package } from "lucide-react";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= Math.round(rating) ? "text-amber-400" : "text-muted-foreground/30"}
          fill={s <= Math.round(rating) ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id || "0", 10);
  const { user: me } = useAuth();

  const { data: profileUser, isLoading: userLoading } = useGetUser(userId);
  const { data: trust } = useGetUserTrust(userId);
  const { data: reviews, isLoading: reviewsLoading } = useGetDonorReviews(userId);
  const { data: donations } = useListDonations();

  const myDonations = donations?.filter((d) => d.donorId === userId);
  const isMe = me?.id === userId;

  if (userLoading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-40 rounded-2xl bg-muted animate-pulse" />
          <div className="h-48 rounded-2xl bg-muted animate-pulse" />
        </div>
      </AppLayout>
    );
  }

  if (!profileUser) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-24">
          <Card className="max-w-md w-full text-center">
            <CardContent className="py-12 space-y-4">
              <h2 className="text-xl font-semibold">User not found</h2>
              <Button asChild variant="outline"><Link href="/home">Go Home</Link></Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const trustNext: Record<string, { label: string; pts: number }> = {
    new: { label: "Trusted", pts: 51 },
    trusted: { label: "Highly Trusted", pts: 151 },
    highlyTrusted: { label: "Champion", pts: 301 },
    champion: { label: "Champion", pts: 9999 },
  };
  const nextTier = trustNext[profileUser.trustLevel] || trustNext.new;
  const progressPct = Math.min(100, (profileUser.trustScore / nextTier.pts) * 100);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <Card>
          <CardContent className="pt-6 pb-5">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 text-primary font-bold text-3xl flex items-center justify-center shrink-0">
                {profileUser.fullName.charAt(0)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold">{profileUser.fullName}</h1>
                  {profileUser.isVerified && (
                    <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                      <CheckCircle size={12} /> Verified
                    </div>
                  )}
                  <Badge variant="outline" className="capitalize">{profileUser.role}</Badge>
                </div>
                {profileUser.village && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin size={13} /> {profileUser.village}
                  </div>
                )}
                <TrustBadge score={profileUser.trustScore} level={profileUser.trustLevel} />
              </div>
              {isMe && (
                <Button variant="outline" size="sm">Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-3xl font-bold text-primary">{profileUser.trustScore}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Trust Points</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-3xl font-bold text-primary">{profileUser.totalDonations ?? 0}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Donations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-3xl font-bold text-primary">
                  {profileUser.averageRating != null ? profileUser.averageRating.toFixed(1) : "—"}
                </p>
                {profileUser.averageRating != null && <Star size={18} className="text-amber-400 mb-1" fill="currentColor" />}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        {profileUser.role === "donor" && profileUser.trustLevel !== "champion" && (
          <Card>
            <CardContent className="pt-4 pb-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Progress to {nextTier.label}</span>
                <span className="text-muted-foreground">{profileUser.trustScore} / {nextTier.pts} pts</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {myDonations && myDonations.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Donations</CardTitle></CardHeader>
            <CardContent className="space-y-2 pt-0">
              {myDonations.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Package size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{d.itemName}</p>
                      <p className="text-xs text-muted-foreground">{d.category} · {d.condition}</p>
                    </div>
                  </div>
                  <Badge variant={d.status === "active" ? "secondary" : d.status === "completed" ? "default" : "outline"}>
                    {d.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {!reviewsLoading && reviews && reviews.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Community Reviews</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-0">
              {reviews.map((review) => (
                <div key={review.id} className="py-3 border-b last:border-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <StarRow rating={Math.round((review.qualityRating + review.conditionRating + review.satisfactionRating) / 3)} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.feedback && (
                    <p className="text-sm text-muted-foreground">{review.feedback}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {!reviewsLoading && (!reviews || reviews.length === 0) && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <Star size={32} className="mx-auto mb-3 text-muted-foreground/30" />
              <p>No reviews yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
