import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useRegisterUser } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, HandHeart } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["donor", "receiver"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { t } = useTranslation();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"donor" | "receiver" | null>(null);

  const registerMutation = useRegisterUser();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: "donor",
    },
  });

  const handleRoleSelect = (selectedRole: "donor" | "receiver") => {
    setRole(selectedRole);
    form.setValue("role", selectedRole);
    setStep(2);
  };

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: "Registration successful!", description: "Please login to continue." });
          setLocation("/login");
        },
        onError: (err: any) => {
          toast({ 
            title: "Registration failed", 
            description: err.message || "An error occurred", 
            variant: "destructive" 
          });
        }
      }
    );
  };

  return (
    <AppLayout>
      <div className="flex justify-center items-center py-12">
        <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-primary">
              {t("nav.register")}
            </CardTitle>
            <CardDescription>
              Join the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="space-y-6">
                <h3 className="text-xl font-medium text-center">How would you like to participate?</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className="cursor-pointer hover:border-primary transition-colors hover-elevate"
                    onClick={() => handleRoleSelect("donor")}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <Heart className="w-12 h-12 text-primary" />
                      <div className="font-semibold text-lg">I want to donate</div>
                    </CardContent>
                  </Card>
                  <Card 
                    className="cursor-pointer hover:border-primary transition-colors hover-elevate"
                    onClick={() => handleRoleSelect("receiver")}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <HandHeart className="w-12 h-12 text-secondary" />
                      <div className="font-semibold text-lg">I need help</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full capitalize">
                      {role} Account
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)} type="button">Change</Button>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full mt-4" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Complete Registration"}
                  </Button>
                </form>
              </Form>
            )}

            <div className="text-center text-sm mt-6 text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t("nav.login")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
