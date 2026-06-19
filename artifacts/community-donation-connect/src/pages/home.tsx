import React from "react";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useGetPlatformStats } from "@workspace/api-client-react";
import { Heart, Box, Users, MapPin, HandHeart } from "lucide-react";

export default function Home() {
  const { t } = useTranslation();
  const { data: stats } = useGetPlatformStats();

  return (
    <AppLayout>
      <div className="space-y-24 pb-12">
        {/* Hero Section */}
        <section className="text-center space-y-8 pt-12 lg:pt-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            {t("app.subtitle")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of neighbors sharing resources. A trustworthy digital goodwill network right in your community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8" asChild>
              <Link href="/donate">{t("action.donate")}</Link>
            </Button>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg h-14 px-8" asChild>
              <Link href="/request">{t("action.request")}</Link>
            </Button>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="bg-primary/5 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">{stats?.totalDonors || 0}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Donors</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">{stats?.totalReceivers || 0}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Receivers</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">{stats?.totalItemsDonated || 0}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Items Shared</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">{stats?.totalCommunitiesServed || 0}</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Communities</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-12">
          <h2 className="text-3xl font-bold text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-4 p-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Box size={32} />
              </div>
              <h3 className="text-xl font-semibold">List an Item</h3>
              <p className="text-muted-foreground">Take a quick photo and describe what you have to give. Set your preferred pickup radius.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-semibold">Match Locally</h3>
              <p className="text-muted-foreground">Our system finds receivers nearby. Contact details stay private until both parties accept.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <HandHeart size={32} />
              </div>
              <h3 className="text-xl font-semibold">Build Trust</h3>
              <p className="text-muted-foreground">Meet up, exchange the item, and leave a review to build your community trust score.</p>
            </div>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
