import React from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeartHandshake } from "lucide-react";

export default function LanguageSelect() {
  const { setLang, t } = useTranslation();
  const [_, setLocation] = useLocation();

  const handleSelect = (lang: "en" | "te") => {
    setLang(lang);
    setLocation("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="max-w-3xl w-full space-y-12 animate-in fade-in zoom-in duration-500">
        
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
            <HeartHandshake className="text-primary-foreground" size={32} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Welcome to <span className="text-primary">CDC</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Community Donation Connect
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
          <Card 
            className="hover-elevate cursor-pointer border-2 hover:border-primary transition-all duration-300"
            onClick={() => handleSelect("en")}
          >
            <CardContent className="flex flex-col items-center justify-center p-12 text-center h-full space-y-4">
              <span className="text-4xl font-bold text-foreground">English</span>
              <span className="text-muted-foreground">Continue in English</span>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer border-2 hover:border-primary transition-all duration-300"
            onClick={() => handleSelect("te")}
          >
            <CardContent className="flex flex-col items-center justify-center p-12 text-center h-full space-y-4">
              <span className="text-4xl font-bold text-foreground">తెలుగు</span>
              <span className="text-muted-foreground">తెలుగులో కొనసాగించండి</span>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
