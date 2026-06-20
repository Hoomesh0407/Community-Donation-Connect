import React from "react";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useGetPlatformStats } from "@workspace/api-client-react";
import { Box, MapPin, HandHeart, Shield, Star, Award, BookOpen, ArrowRight } from "lucide-react";
import { TutorialCard } from "@/components/TutorialPlayer";
import { TUTORIALS } from "@/data/tutorialContent";

export default function Home() {
  const { t } = useTranslation();
  const { data: stats } = useGetPlatformStats();

  return (
    <AppLayout>
      <div className="space-y-20 pb-16">

        {/* Hero */}
        <section className="text-center space-y-8 pt-10 lg:pt-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            {t("app.subtitle")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of neighbors sharing resources. A trustworthy digital goodwill network right in your community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8" asChild>
              <Link href="/donate">{t("action.donate")}</Link>
            </Button>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg h-14 px-8" asChild>
              <Link href="/request">{t("action.request")}</Link>
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-primary/5 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: stats?.totalDonors ?? 0, label: "Donors" },
              { value: stats?.totalReceivers ?? 0, label: "Receivers" },
              { value: stats?.totalItemsDonated ?? 0, label: "Items Shared" },
              { value: stats?.totalCommunitiesServed ?? 0, label: "Communities" },
            ].map(({ value, label }) => (
              <div key={label} className="space-y-2">
                <h3 className="text-4xl font-bold text-primary">{value}</h3>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground">Simple, private, and community-powered</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Box size={32} />, bg: "bg-blue-100 text-blue-600", title: "List an Item", desc: "Describe what you have to give and set your pickup radius." },
              { icon: <MapPin size={32} />, bg: "bg-green-100 text-green-600", title: "Match Locally", desc: "Our engine finds nearby matches. Contact stays private until both accept." },
              { icon: <HandHeart size={32} />, bg: "bg-amber-100 text-amber-600", title: "Build Trust", desc: "Exchange, review, and earn trust points toward your community badge." },
            ].map(({ icon, bg, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl border hover:border-primary/30 transition-colors">
                <div className={`w-16 h-16 ${bg} rounded-full flex items-center justify-center`}>{icon}</div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Score explainer */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-3xl font-bold">Trust Score System</h2>
            <p className="text-muted-foreground">Every completed donation earns you points and builds your reputation</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Shield size={24} />, label: "New Donor", range: "0 – 50 pts", color: "text-slate-600 bg-slate-100" },
              { icon: <Star size={24} />, label: "Trusted", range: "51 – 150 pts", color: "text-blue-600 bg-blue-100" },
              { icon: <Award size={24} />, label: "Highly Trusted", range: "151 – 300 pts", color: "text-purple-600 bg-purple-100" },
              { icon: <Award size={24} />, label: "Champion", range: "301+ pts", color: "text-amber-600 bg-amber-100" },
            ].map(({ icon, label, range, color }) => (
              <div key={label} className="bg-white rounded-2xl p-5 text-center space-y-2 shadow-sm">
                <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mx-auto`}>{icon}</div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{range}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tutorial previews */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <BookOpen size={16} /> Tutorial Center
              </div>
              <h2 className="text-3xl font-bold">Step-by-Step Tutorials</h2>
              <p className="text-muted-foreground">Animated guides in English and Telugu — learn every feature from start to finish</p>
            </div>
            <Button variant="outline" className="gap-2 shrink-0" asChild>
              <Link href="/tutorials">
                View All Tutorials <ArrowRight size={14} />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TUTORIALS.slice(0, 3).map((t) => (
              <TutorialCard
                key={t.id}
                tutorial={t}
                onClick={() => {
                  window.location.href = "/tutorials";
                }}
              />
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/tutorials">
                <BookOpen size={16} /> Open Tutorial Center — All 5 Guides
              </Link>
            </Button>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
