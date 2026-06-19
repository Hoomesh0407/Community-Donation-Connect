import React from "react";
import { useParams, Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetRequest, useGetUser } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import { TrustBadge } from "@/components/ui/trust-badge";

const URGENCY_COLORS: Record<string, string> = {
  low: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  critical: "bg-red-50 text-red-700 border-red-200",
};

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const requestId = parseInt(id || "0", 10);
  const { user, isLoggedIn } = useAuth();
  const [_, setLocation] = useLocation();

  const { data: request, isLoading } = useGetRequest(requestId);
  const { data: receiver } = useGetUser(request?.receiverId ?? 0);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-40 rounded-2xl bg-muted animate-pulse" />
          <div className="h-32 rounded-2xl bg-muted animate-pulse" />
        </div>
      </AppLayout>
    );
  }

  if (!request) {
    return (
      <AppLayout>
        <div className="flex justify-center py-24">
          <Card className="max-w-md w-full text-center">
            <CardContent className="py-12 space-y-4">
              <h2 className="text-xl font-semibold">Request not found</h2>
              <Button asChild variant="outline"><Link href="/requests">Back to Requests</Link></Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/requests")} className="gap-2 -ml-2">
          <ArrowLeft size={16} /> Back to Requests
        </Button>

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{request.itemName}</h1>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{request.category}</Badge>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${URGENCY_COLORS[request.urgency] || "bg-muted"}`}>
                {request.urgency} urgency
              </span>
            </div>
          </div>
          {request.village && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin size={13} /> {request.village}
            </div>
          )}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Why They Need It</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-foreground leading-relaxed">{request.reason}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Request Details</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground">Quantity</p><p className="font-medium">{request.quantity}</p></div>
              <div><p className="text-muted-foreground">Search Radius</p><p className="font-medium">{request.radiusKm} km</p></div>
              <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{request.status}</p></div>
              <div><p className="text-muted-foreground">Posted</p><p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p></div>
            </div>
          </CardContent>
        </Card>

        {receiver && (
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Requester</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary font-bold text-xl flex items-center justify-center">
                  {receiver.fullName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{receiver.fullName.split(" ")[0]}</p>
                    {receiver.isVerified && (
                      <span className="text-xs text-green-600 flex items-center gap-0.5">
                        <CheckCircle size={11} /> Verified
                      </span>
                    )}
                  </div>
                  <TrustBadge score={receiver.trustScore} level={receiver.trustLevel} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {request.status === "active" && isLoggedIn && user?.id !== request.receiverId && user?.role === "donor" && (
          <Button size="lg" className="w-full h-12" onClick={() => setLocation("/donate")}>
            Donate This Item
          </Button>
        )}

        {!isLoggedIn && (
          <Button size="lg" className="w-full h-12" asChild>
            <Link href="/login">Login to Help</Link>
          </Button>
        )}
      </div>
    </AppLayout>
  );
}
