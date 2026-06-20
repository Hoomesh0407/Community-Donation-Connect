import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Heart, Bell, UserCircle, ShieldCheck, Menu, X, Home, Gift, HandHeart, Trophy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    setLocation("/");
  };

  const navLinks = [
    { href: "/home", label: t("nav.home"), icon: Home },
    { href: "/donations", label: t("nav.donations"), icon: Gift },
    { href: "/requests", label: t("nav.requests"), icon: HandHeart },
    { href: "/leaderboard", label: t("nav.leaderboard"), icon: Trophy },
  ];

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4 max-w-6xl mx-auto">

        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 shrink-0" onClick={() => setMobileOpen(false)}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Heart size={16} className="fill-current" />
          </div>
          <span className="font-bold text-base text-primary tracking-tight">CDC</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-primary ${isActive(link.href) ? "text-primary font-semibold" : "text-muted-foreground"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setMobileOpen(false); setLocation("/notifications"); }}
                className="h-9 w-9"
              >
                <Bell size={18} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <UserCircle size={22} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2 border-b mb-1">
                    {user?.fullName && <p className="font-semibold text-sm truncate">{user.fullName}</p>}
                    {user?.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
                  </div>
                  <DropdownMenuItem onClick={() => setLocation(`/profile/${user?.id}`)}>
                    {t("nav.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/matches")}>
                    {t("nav.matches")}
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setLocation("/admin")} className="gap-2">
                        <ShieldCheck size={14} /> Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t("nav.login")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">{t("nav.register")}</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="flex flex-col py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                  isActive(link.href) ? "text-primary bg-primary/5" : "text-foreground hover:bg-muted"
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}

            {isLoggedIn && (
              <>
                <div className="border-t my-1" />
                <button
                  onClick={() => { setMobileOpen(false); setLocation(`/profile/${user?.id}`); }}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-muted w-full text-left"
                >
                  <UserCircle size={16} />
                  {t("nav.profile")}
                </button>
                <button
                  onClick={() => { setMobileOpen(false); setLocation("/matches"); }}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-muted w-full text-left"
                >
                  <HandHeart size={16} />
                  {t("nav.matches")}
                </button>
                <button
                  onClick={() => { setMobileOpen(false); setLocation("/notifications"); }}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-muted w-full text-left"
                >
                  <Bell size={16} />
                  Notifications
                </button>
                {user?.role === "admin" && (
                  <button
                    onClick={() => { setMobileOpen(false); setLocation("/admin"); }}
                    className="flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-muted w-full text-left"
                  >
                    <ShieldCheck size={16} />
                    Admin Dashboard
                  </button>
                )}
                <div className="border-t my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-destructive hover:bg-destructive/5 w-full text-left"
                >
                  <X size={16} />
                  {t("nav.logout")}
                </button>
              </>
            )}

            {!isLoggedIn && (
              <>
                <div className="border-t my-2" />
                <div className="flex flex-col gap-2 px-4 pb-3">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>{t("nav.login")}</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register" onClick={() => setMobileOpen(false)}>{t("nav.register")}</Link>
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
