import React from "react";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useGetPlatformStats } from "@workspace/api-client-react";
import { Box, MapPin, HandHeart, Shield, Star, Award } from "lucide-react";
import { TutorialVideo } from "@/components/TutorialVideo";

// ─── Tutorial step visuals ────────────────────────────────────────────────────

function StepIcon({ emoji, bg }: { emoji: string; bg: string }) {
  return (
    <div className={`w-20 h-20 rounded-2xl ${bg} flex items-center justify-center text-4xl shadow-sm`}>
      {emoji}
    </div>
  );
}

// Register & Login tutorial
const registerSteps = [
  {
    title: "Open Community Donation Connect",
    description: "Visit the website and click Register on the top-right corner of the screen.",
    visual: <StepIcon emoji="🌐" bg="bg-blue-100" />,
  },
  {
    title: "Fill in your details",
    description: "Enter your full name, email, phone number, and a secure password. Choose your role — Donor, Receiver, or both!",
    visual: <StepIcon emoji="📝" bg="bg-indigo-100" />,
  },
  {
    title: "Create your account",
    description: "Click 'Register' to create your profile. Your account is active immediately — no email verification wait.",
    visual: <StepIcon emoji="✅" bg="bg-green-100" />,
  },
  {
    title: "Login anytime",
    description: "Click Login, enter your email and password, and you are in. Your session stays active across pages.",
    visual: <StepIcon emoji="🔑" bg="bg-yellow-100" />,
  },
  {
    title: "Explore your dashboard",
    description: "After login, visit your Profile to see your trust score, total donations, badges, and community reviews.",
    visual: <StepIcon emoji="👤" bg="bg-purple-100" />,
  },
];

// Donate tutorial
const donateSteps = [
  {
    title: "Click 'I Want To Donate'",
    description: "From the home page or the Donate button in the menu, open the donation form.",
    visual: <StepIcon emoji="🎁" bg="bg-blue-100" />,
  },
  {
    title: "Pick a category",
    description: "Choose what type of item you are donating — Food, Clothing, Books, Electronics, Furniture, Medical, Toys, or Other.",
    visual: <StepIcon emoji="📦" bg="bg-orange-100" />,
  },
  {
    title: "Describe your item",
    description: "Enter the item name (e.g. 'Winter Jacket'), select its condition (Like New / Good / Fair), and set the quantity.",
    visual: <StepIcon emoji="✏️" bg="bg-yellow-100" />,
  },
  {
    title: "Set your location",
    description: "Tap 'Use Current Location (GPS)' for automatic detection, or type your area manually. Set your pickup radius (e.g. 10 km).",
    visual: <StepIcon emoji="📍" bg="bg-red-100" />,
  },
  {
    title: "Publish and get matched",
    description: "Click 'Publish Donation'. Our engine finds receivers nearby with the same category within your radius.",
    visual: <StepIcon emoji="🔍" bg="bg-green-100" />,
  },
  {
    title: "Accept the match",
    description: "Go to Matches. You will see a receiver's first name and area. Click Accept to connect — contact details are revealed only when both accept.",
    visual: <StepIcon emoji="🤝" bg="bg-teal-100" />,
  },
  {
    title: "Complete the exchange",
    description: "Meet up and hand over the item. Click Confirm Exchange when done. Your donor count goes up.",
    visual: <StepIcon emoji="📬" bg="bg-indigo-100" />,
  },
  {
    title: "Earn trust points",
    description: "The receiver leaves a review (1–5 stars on quality, condition, and satisfaction). Each review earns you 10–20 trust points.",
    visual: <StepIcon emoji="⭐" bg="bg-yellow-100" />,
  },
  {
    title: "Level up your badge",
    description: "0–50 pts = New Donor. 51–150 = Trusted. 151–300 = Highly Trusted. 301+ = Community Champion! Check your rank on the Leaderboard.",
    visual: <StepIcon emoji="🏆" bg="bg-amber-100" />,
  },
];

// Receive tutorial
const receiveSteps = [
  {
    title: "Click 'I Need Help'",
    description: "From the home page, click 'I Need Help' to open the item request form. Any registered user can request items.",
    visual: <StepIcon emoji="🙏" bg="bg-blue-100" />,
  },
  {
    title: "Choose a category",
    description: "Select the category of what you need — Food, Clothing, Medical supplies, etc.",
    visual: <StepIcon emoji="🗂️" bg="bg-purple-100" />,
  },
  {
    title: "Describe your need",
    description: "Enter the item name, explain why you need it, and mark urgency (Low / Medium / High / Critical).",
    visual: <StepIcon emoji="💬" bg="bg-yellow-100" />,
  },
  {
    title: "Share your location",
    description: "Use GPS or type your area. Set the search radius (e.g. 15 km) to find donors near you.",
    visual: <StepIcon emoji="🗺️" bg="bg-green-100" />,
  },
  {
    title: "Wait for a smart match",
    description: "Our engine finds active donors nearby with matching items. Critical urgency requests are prioritised first.",
    visual: <StepIcon emoji="⚡" bg="bg-orange-100" />,
  },
  {
    title: "Accept your match",
    description: "You will see a notification when matched. Go to Matches, review the donor's trust score and badge, then click Accept.",
    visual: <StepIcon emoji="🔔" bg="bg-teal-100" />,
  },
  {
    title: "Check the donor's trust score",
    description: "Before accepting, you can view the donor's average rating, total donations completed, and their badge (Trusted / Champion).",
    visual: <StepIcon emoji="🛡️" bg="bg-indigo-100" />,
  },
  {
    title: "Collect your item",
    description: "Once both parties accept, full contact details are revealed. Coordinate pickup and collect your item.",
    visual: <StepIcon emoji="🎒" bg="bg-pink-100" />,
  },
  {
    title: "Leave a review",
    description: "After receiving, leave a review for the donor — rate quality, condition, and satisfaction. This builds community trust.",
    visual: <StepIcon emoji="⭐" bg="bg-yellow-100" />,
  },
];

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

        {/* Tutorial Videos */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Step-by-Step Tutorials</h2>
            <p className="text-muted-foreground">Watch how to use Community Donation Connect from start to finish</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TutorialVideo
              title="Getting Started"
              subtitle="How to Register and Login"
              steps={registerSteps}
            />
            <TutorialVideo
              title="Donate an Item"
              subtitle="Full donation process with trust score"
              steps={donateSteps}
            />
            <TutorialVideo
              title="Receive an Item"
              subtitle="Request, match, collect and review"
              steps={receiveSteps}
            />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Click Play on any tutorial above to see it step-by-step. Use the arrows to navigate manually.
          </p>
        </section>

      </div>
    </AppLayout>
  );
}
