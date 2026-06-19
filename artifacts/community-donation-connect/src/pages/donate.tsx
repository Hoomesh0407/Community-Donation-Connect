import React, { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateDonation } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

const CATEGORIES = ["Food", "Clothing", "Books", "Electronics", "Furniture", "Medical", "Toys", "Other"];
const CONDITIONS = ["likeNew", "excellent", "good", "fair", "poor"] as const;
const CONDITION_LABELS: Record<string, string> = { likeNew: "Like New", excellent: "Excellent", good: "Good", fair: "Fair", poor: "Poor" };

const donateSchema = z.object({
  category: z.string().min(1, "Select a category"),
  itemName: z.string().min(2, "Item name is required"),
  condition: z.enum(["likeNew", "excellent", "good", "fair", "poor"]),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(1).max(100),
  address: z.string().optional(),
});

type DonateFormValues = z.infer<typeof donateSchema>;

export default function Donate() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const createDonation = useCreateDonation();

  const form = useForm<DonateFormValues>({
    resolver: zodResolver(donateSchema),
    defaultValues: {
      category: "",
      itemName: "",
      condition: "good",
      quantity: 1,
      latitude: 17.385,
      longitude: 78.4867,
      radiusKm: 10,
      address: "",
    },
  });

  const onSubmit = (data: DonateFormValues) => {
    createDonation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: "Donation listed!", description: "Your item is now visible to receivers nearby." });
          setLocation("/donations");
        },
        onError: (err: any) => {
          toast({ title: "Failed to list donation", description: err.message || "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-24">
          <Card className="max-w-md w-full text-center">
            <CardContent className="py-12 space-y-4">
              <h2 className="text-xl font-semibold">Sign in to donate</h2>
              <p className="text-muted-foreground">You need an account to list a donation.</p>
              <Button asChild><Link href="/login">Login</Link></Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold">Donate an Item</h1>
          <p className="text-muted-foreground mt-1">Help a neighbor — list what you can give away.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <Card>
              <CardHeader><CardTitle className="text-base font-semibold">Category</CardTitle></CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => field.onChange(cat)}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-150 cursor-pointer ${
                              field.value === cat
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <FormMessage className="mt-2" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base font-semibold">Item Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="itemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Winter jacket, Old textbooks..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {CONDITIONS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => field.onChange(c)}
                              className={`p-2 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
                                field.value === c
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              {CONDITION_LABELS[c]}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl><Input type="number" min={1} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base font-semibold">Location &amp; Pickup Radius</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address / Area (optional)</FormLabel>
                      <FormControl><Input placeholder="e.g. Kukatpally, Hyderabad" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="radiusKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Radius: {field.value} km</FormLabel>
                      <FormControl>
                        <input
                          type="range"
                          min={1}
                          max={50}
                          step={1}
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="w-full accent-primary"
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 km</span><span>50 km</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={createDonation.isPending}>
              {createDonation.isPending ? "Publishing..." : "Publish Donation"}
            </Button>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
