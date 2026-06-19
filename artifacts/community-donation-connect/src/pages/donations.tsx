import React from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { useListDonations } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Box } from "lucide-react";
import { TrustBadge } from "@/components/ui/trust-badge";

export default function Donations() {
  const { t } = useTranslation();
  const [_, setLocation] = useLocation();
  const { data: donations, isLoading } = useListDonations();

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Community Donations</h1>
            <p className="text-muted-foreground mt-1">Available items from trusted neighbors</p>
          </div>
          <Button onClick={() => setLocation("/donate")} className="gap-2">
            <Box size={16} /> List an Item
          </Button>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="h-64 animate-pulse bg-muted" />
            ))}
          </div>
        ) : !donations?.length ? (
          <div className="text-center py-24 bg-muted/50 rounded-2xl border border-dashed">
            <Box size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No donations right now</h3>
            <p className="text-muted-foreground mb-6">Be the first to help your community today.</p>
            <Button onClick={() => setLocation("/donate")}>Donate an Item</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((item) => (
              <Card key={item.id} className="hover:border-primary/50 transition-colors flex flex-col cursor-pointer overflow-hidden" onClick={() => setLocation(`/donations/${item.id}`)}>
                {item.images?.[0] ? (
                  <div className="h-48 w-full bg-muted overflow-hidden">
                    <img src={item.images[0]} alt={item.itemName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-primary/5 flex items-center justify-center text-primary/40">
                    <Box size={48} />
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{item.itemName}</h3>
                    <Badge variant="secondary">{item.condition}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin size={14} /> {item.village || "Local Area"} 
                    {item.distance && ` • ${item.distance.toFixed(1)} km`}
                  </div>
                </CardHeader>
                
                <CardContent className="pb-4 mt-auto">
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {item.donorName.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{item.donorName}</p>
                      <TrustBadge score={item.donorTrustScore || 0} level={item.donorTrustLevel || 'new'} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
