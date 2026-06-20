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

const CONDITIONS = ["likeNew", "excellent", "good", "fair", "poor"] as const;
const CONDITION_LABELS: Record<string, string> = {
  likeNew: "Like New", excellent: "Excellent", good: "Good", fair: "Fair", poor: "Poor",
};

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
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  const form = useForm<DonateFormValues>({
    resolver: zodResolver(donateSchema),
    defaultValues: {
      category: "",
      itemName: "",
      condition: "good",
      quantity: 1,
      latitude: undefined,
      longitude: undefined,
      radiusKm: 10,
      address: "",
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
          const label = [area, district].filter(Boolean).join(", ");
          setLocationLabel(label || `${lat}, ${lng}`);
          if (label) form.setValue("address", label);
        } catch {
          setLocationLabel(`${lat}, ${lng}`);
        }
        setGpsLoading(false);
        toast({ title: "Location detected", description: "Your GPS location has been set." });
      },
      (err) => {
        setGpsLoading(false);
        toast({ title: "Location denied", description: "Please allow location access or enter coordinates manually.", variant: "destructive" });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

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
                            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 cursor-pointer flex flex-col items-center gap-1 ${
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
                        <p className="mt-2 text-sm font-medium text-primary">
                          Selected: <span className="font-semibold">{field.value}</span>
                        </p>
                      )}
                      <FormMessage className="mt-2" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Item Details */}
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
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {CONDITIONS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => field.onChange(c)}
                            className={`p-2 rounded-lg border-2 text-xs font-semibold transition-all cursor-pointer ${
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
                      <FormControl><Input type="number" min={1} className="w-32" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Location &amp; Pickup Radius</CardTitle>
              </CardHeader>
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

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area / Address (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Kukatpally, Hyderabad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="17.3850"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
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
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="78.4867"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
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
                      <FormLabel>Pickup Radius: <span className="font-bold text-primary">{field.value} km</span></FormLabel>
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
