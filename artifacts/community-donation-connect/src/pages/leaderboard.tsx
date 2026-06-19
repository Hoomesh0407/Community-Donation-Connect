import React from "react";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Leaderboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Top donors in your community.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
