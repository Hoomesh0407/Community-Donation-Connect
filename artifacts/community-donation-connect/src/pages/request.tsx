import React from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateRequest } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = ["Food", "Clothing", "Books", "Electronics", "Furniture", "Medical", "Toys", "Other"];
const URGENCIES = ["low", "medium", "high", "critical"] as const;
const URGENCY_LABELS: Record<string, string> = { low: "Low", medium: "Medium", high: "High", critical: "Critical" };
const URGENCY_COLORS: Record<string, string> = {
  low: "border-green-400 bg-green-50 text-green-700",
  medium: "border-yellow-400 bg-yellow-50 text-yellow-700",
  high: "border-orange-400 bg-orange-50 text-orange-700",
  critical: "border-red-500 bg-red-50 text-red-700",
};

const requestSchema = z.object({
  category: z.string().min(1, "Select a category"),
  itemName: z.string().min(2, "Item name is required"),
  reason: z.string().min(10, "Please explain why you need this item"),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  quantity: z.coerce.number().min(1),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(1).max(100),
  village: z.string().optional(),
  district: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestSchema>;

export default function RequestItem() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const createRequest = useCreateRequest();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      category: "",
      itemName: "",
      reason: "",
      urgency: "medium",
      quantity: 1,
      latitude: 17.385,
      longitude: 78.4867,
      radiusKm: 15,
      village: "",
      district: "",
    },
  });

  const onSubmit = (data: RequestFormValues) => {
    createRequest.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: "Request submitted!", description: "We will match you with a nearby donor." });
          setLocation("/requests");
        },
        onError: (err: any) => {
          toast({ title: "Failed to submit request", description: err.message || "Please try again.", variant: "destructive" });
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
              <h2 className="text-xl font-semibold">Sign in to request</h2>
              <p className="text-muted-foreground">You need an account to request an item.</p>
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
          <h1 className="text-3xl font-bold">Request an Item</h1>
          <p className="text-muted-foreground mt-1">Tell the community what you need. Someone nearby may help.</p>
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
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
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
              <CardHeader><CardTitle className="text-base font-semibold">Request Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="itemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What do you need?</FormLabel>
                      <FormControl><Input placeholder="e.g. School uniform, Rice bag..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why do you need it?</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Share your situation so donors can understand..." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity needed</FormLabel>
                      <FormControl><Input type="number" min={1} className="w-32" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency</FormLabel>
                      <div className="grid grid-cols-4 gap-2">
                        {URGENCIES.map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => field.onChange(u)}
                            className={`p-2 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
                              field.value === u
                                ? URGENCY_COLORS[u]
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {URGENCY_LABELS[u]}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base font-semibold">Your Location</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Village / Area</FormLabel>
                        <FormControl><Input placeholder="e.g. Kukatpally" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <FormControl><Input placeholder="e.g. Hyderabad" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                      <FormLabel>Search Radius: {field.value} km</FormLabel>
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

            <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={createRequest.isPending}>
              {createRequest.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
