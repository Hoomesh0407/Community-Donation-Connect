import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  useGetAdminStats,
  useListAdminUsers,
  useGetCategoryStats,
  useVerifyUser,
  useSuspendUser,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { TrustBadge } from "@/components/ui/trust-badge";
import { Users, Package, ArrowLeftRight, CheckCircle, XCircle, ShieldCheck, ShieldOff, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [suspendTarget, setSuspendTarget] = useState<{ id: number; name: string } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useListAdminUsers();
  const { data: catStats } = useGetCategoryStats();
  const verifyUser = useVerifyUser();
  const suspendUser = useSuspendUser();

  if (user?.role !== "admin") {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-24">
          <Card className="max-w-md w-full text-center">
            <CardContent className="py-12 space-y-4">
              <ShieldOff size={40} className="mx-auto text-destructive/50" />
              <h2 className="text-xl font-semibold">Access Denied</h2>
              <p className="text-muted-foreground">You must be an admin to view this page.</p>
              <Button asChild variant="outline"><Link href="/home">Go Home</Link></Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const handleVerify = (id: number) => {
    verifyUser.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "User verified!" });
        refetchUsers();
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      },
    });
  };

  const handleSuspend = () => {
    if (!suspendTarget) return;
    suspendUser.mutate(
      { id: suspendTarget.id, data: { suspended: true, reason: suspendReason || "Suspended by admin" } },
      {
        onSuccess: () => {
          toast({ title: `${suspendTarget.name} suspended.` });
          setSuspendTarget(null);
          setSuspendReason("");
          refetchUsers();
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const filteredUsers = users?.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3">
          <ShieldCheck size={28} className="text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Platform management and oversight</p>
          </div>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Card key={i} className="h-24 animate-pulse bg-muted" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600" },
              { label: "Donations", value: stats.totalDonations, icon: Package, color: "text-green-600" },
              { label: "Matches", value: stats.totalMatches, icon: ArrowLeftRight, color: "text-amber-600" },
              { label: "Completed", value: stats.totalCompleted, icon: CheckCircle, color: "text-primary" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{stat.label}</p>
                    </div>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {stats && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-5 pb-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Match Success Rate</p>
                <p className="text-3xl font-bold text-primary">{stats.matchSuccessRate.toFixed(1)}%</p>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${stats.matchSuccessRate}%` }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">User Breakdown</p>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="text-2xl font-bold">{stats.totalDonors}</p>
                    <p className="text-xs text-muted-foreground">Donors</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalReceivers}</p>
                    <p className="text-xs text-muted-foreground">Receivers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.verifiedUsers ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Verified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {catStats && catStats.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Category Analytics</CardTitle></CardHeader>
            <CardContent className="space-y-3 pt-0">
              {catStats.map((cat) => {
                const max = Math.max(...catStats.map((c) => c.count));
                return (
                  <div key={cat.category} className="flex items-center gap-3">
                    <span className="w-24 text-sm font-medium truncate">{cat.category}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded-full"
                        style={{ width: `${(cat.count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{cat.count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base">User Management</CardTitle>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {usersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
              </div>
            ) : !filteredUsers?.length ? (
              <p className="text-center text-muted-foreground py-8">No users found.</p>
            ) : (
              <div className="space-y-1">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                      {u.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{u.fullName}</p>
                        <Badge variant="outline" className="text-xs capitalize">{u.role}</Badge>
                        {u.isVerified && (
                          <span className="text-xs text-green-600 flex items-center gap-0.5">
                            <CheckCircle size={10} /> Verified
                          </span>
                        )}
                        {u.status === "suspended" && (
                          <Badge variant="destructive" className="text-xs">Suspended</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <TrustBadge score={u.trustScore ?? 0} level={u.trustLevel ?? "new"} />
                    <div className="flex gap-1 shrink-0">
                      {!u.isVerified && u.status !== "suspended" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleVerify(u.id)}
                          disabled={verifyUser.isPending}
                        >
                          <ShieldCheck size={12} /> Verify
                        </Button>
                      )}
                      {u.status !== "suspended" && u.role !== "admin" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => setSuspendTarget({ id: u.id, name: u.fullName })}
                        >
                          <XCircle size={12} /> Suspend
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Suspend {suspendTarget?.name}?</DialogTitle>
            <DialogDescription>
              This user will be prevented from making new donations or requests.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Explain why this user is being suspended..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setSuspendTarget(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleSuspend} disabled={suspendUser.isPending}>
                {suspendUser.isPending ? "Suspending..." : "Suspend User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
