import React from "react";
import { useParams, Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetDonation, useGetUser } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { TrustBadge } from "@/components/ui/trust-badge";
import { MapPin, Package, CheckCircle, ArrowLeft, Phone, Mail } from "lucide-react";

const CONDITION_LABELS: Record<string, string> = {
  likeNew: "Like New", excellent: "Excellent", good: "Good", fair: "Fair", poor: "Poor",
};

export default function DonationDetail() {
  const { id } = useParams<{ id: string }>();
  const donationId = parseInt(id || "0", 10);
  const { user, isLoggedIn } = useAuth();
  const [_, setLocation] = useLocation();

  const { data: donation, isLoading } = useGetDonation(donationId);
  const { data: donor } = useGetUser(donation?.donorId ?? 0);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-64 rounded-2xl bg-muted animate-pulse" />
          <div className="h-40 rounded-2xl bg-muted animate-pulse" />
        </div>
      </AppLayout>
    );
  }

  if (!donation) {
    return (
      <AppLayout>
        <div className="flex justify-center py-24">
          <Card className="max-w-md w-full text-center">
            <CardContent className="py-12 space-y-4">
              <h2 className="text-xl font-semibold">Donation not found</h2>
              <Button asChild variant="outline"><Link href="/donations">Back to Donations</Link></Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/donations")} className="gap-2 -ml-2">
          <ArrowLeft size={16} /> Back to Donations
        </Button>

        {donation.images?.[0] ? (
          <div className="h-72 rounded-2xl overflow-hidden bg-muted">
            <img src={donation.images[0]} alt={donation.itemName} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-72 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/30">
            <Package size={80} />
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{donation.itemName}</h1>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{donation.category}</Badge>
              <Badge variant="secondary">{CONDITION_LABELS[donation.condition] || donation.condition}</Badge>
              <Badge variant={donation.status === "active" ? "default" : "outline"} className="capitalize">
                {donation.status}
              </Badge>
            </div>
          </div>
          {donation.village && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin size={13} /> {donation.village}
              {donation.distance && ` · ${donation.distance.toFixed(1)} km away`}
            </div>
          )}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Item Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground">Quantity</p><p className="font-medium">{donation.quantity}</p></div>
              <div><p className="text-muted-foreground">Condition</p><p className="font-medium">{CONDITION_LABELS[donation.condition] || donation.condition}</p></div>
              <div><p className="text-muted-foreground">Pickup Radius</p><p className="font-medium">{donation.radiusKm} km</p></div>
              <div><p className="text-muted-foreground">Listed</p><p className="font-medium">{new Date(donation.createdAt).toLocaleDateString()}</p></div>
            </div>
          </CardContent>
        </Card>

        {donor && (
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Donor</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center">
                  {donor.fullName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{donor.fullName.split(" ")[0]}</p>
                    {donor.isVerified && (
                      <span className="text-xs text-green-600 flex items-center gap-0.5">
                        <CheckCircle size={11} /> Verified
                      </span>
                    )}
                  </div>
                  <TrustBadge score={donor.trustScore} level={donor.trustLevel} />
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/profile/${donor.id}`}>View Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {donation.status === "active" && isLoggedIn && user?.id !== donation.donorId && user?.role === "receiver" && (
          <Button size="lg" className="w-full h-12" onClick={() => setLocation("/request")}>
            Request this Item
          </Button>
        )}

        {!isLoggedIn && (
          <Button size="lg" className="w-full h-12" asChild>
            <Link href="/login">Login to Request</Link>
          </Button>
        )}
      </div>
    </AppLayout>
  );
}
