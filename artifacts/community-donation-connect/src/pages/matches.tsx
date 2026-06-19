import React from "react";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Matches() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Matches</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Your matches will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
