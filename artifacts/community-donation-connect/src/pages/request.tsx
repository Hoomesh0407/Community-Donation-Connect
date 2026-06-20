import React, { useState } from "react";
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
import { MapPin, Navigation, Loader2 } from "lucide-react";

const CATEGORIES = [
  { id: "Food", label: "Food", icon: "🍱" },
  { id: "Clothing", label: "Clothing", icon: "👕" },
  { id: "Books", label: "Books", icon: "📚" },
  { id: "Electronics", label: "Electronics", icon: "📱" },
  { id: "Furniture", label: "Furniture", icon: "🪑" },
  { id: "Medical", label: "Medical", icon: "💊" },
  { id: "Toys", label: "Toys", icon: "🧸" },
  { id: "Other", label: "Other", icon: "📦" },
];

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
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

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

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS not available", description: "Your browser does not support GPS.", variant: "destructive" });
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Math.round(pos.coords.latitude * 100000) / 100000;
        const lng = Math.round(pos.coords.longitude * 100000) / 100000;
        form.setValue("latitude", lat);
        form.setValue("longitude", lng);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const area = data.address?.suburb || data.address?.village || data.address?.town || data.address?.city || "";
          const district = data.address?.state_district || data.address?.county || "";
          setLocationLabel([area, district].filter(Boolean).join(", ") || `${lat}, ${lng}`);
          if (area) form.setValue("village", area);
          if (district) form.setValue("district", district);
        } catch {
          setLocationLabel(`${lat}, ${lng}`);
        }
        setGpsLoading(false);
        toast({ title: "Location detected", description: "Your GPS location has been set." });
      },
      () => {
        setGpsLoading(false);
        toast({ title: "Location denied", description: "Please allow location access or enter your area manually.", variant: "destructive" });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

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
              <h2 className="text-xl font-semibold">Sign in to request an item</h2>
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

            {/* Category */}
            <Card>
              <CardHeader><CardTitle className="text-base font-semibold">Category</CardTitle></CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => field.onChange(cat.id)}
                            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer flex flex-col items-center gap-1 ${
                              field.value === cat.id
                                ? "border-primary bg-primary/10 text-primary shadow-sm"
                                : "border-border hover:border-primary/40 hover:bg-muted/50"
                            }`}
                          >
                            <span className="text-xl">{cat.icon}</span>
                            <span className="text-xs font-semibold leading-tight">{cat.label}</span>
                          </button>
                        ))}
                      </div>
                      {field.value && (
                        <p className="mt-2 text-sm text-primary">
                          Selected: <span className="font-semibold">{field.value}</span>
                        </p>
                      )}
                      <FormMessage className="mt-2" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Details */}
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {URGENCIES.map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => field.onChange(u)}
                            className={`p-2 rounded-lg border-2 text-sm font-semibold transition-all cursor-pointer ${
                              field.value === u ? URGENCY_COLORS[u] : "border-border hover:border-primary/50"
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

            {/* Location */}
            <Card>
              <CardHeader><CardTitle className="text-base font-semibold">Your Location</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/5"
                  onClick={detectLocation}
                  disabled={gpsLoading}
                >
                  {gpsLoading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                  {gpsLoading ? "Detecting location..." : "Use Current Location (GPS)"}
                </Button>

                {locationLabel && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                    <MapPin size={14} className="shrink-0" />
                    <span className="font-medium">{locationLabel}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
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

                <div className="grid grid-cols-2 gap-3">
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
                      <FormLabel>Search Radius: <span className="font-bold text-primary">{field.value} km</span></FormLabel>
                      <FormControl>
                        <input
                          type="range" min={1} max={50} step={1}
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
