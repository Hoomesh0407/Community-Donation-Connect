import React from "react";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle } from "lucide-react";
import { useListRequests } from "@workspace/api-client-react";

export default function Requests() {
  const { data: requests, isLoading } = useListRequests();
  const [_, setLocation] = useLocation();

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Community Requests</h1>
            <p className="text-muted-foreground mt-1">Help neighbors in need</p>
          </div>
          <Button onClick={() => setLocation("/request")} className="gap-2" variant="secondary">
            <AlertCircle size={16} /> Request an Item
          </Button>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-48 animate-pulse bg-muted" />
            ))}
          </div>
        ) : !requests?.length ? (
          <div className="text-center py-24 bg-muted/50 rounded-2xl border border-dashed">
            <h3 className="text-xl font-semibold mb-2">No active requests</h3>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((item) => (
              <Card key={item.id} className="hover:border-primary/50 transition-colors flex flex-col cursor-pointer" onClick={() => setLocation(`/requests/${item.id}`)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{item.itemName}</h3>
                    <Badge variant={item.urgency === "high" || item.urgency === "critical" ? "destructive" : "secondary"}>
                      {item.urgency}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin size={14} /> {item.village || "Local Area"} 
                  </div>
                </CardHeader>
                <CardContent className="mt-auto pt-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
