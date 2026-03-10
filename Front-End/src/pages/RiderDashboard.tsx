import { useState } from "react";
import { Navigation, Clock, Phone, MessageCircle, MapPin } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { cn } from "@/lib/utils";

const rideTypes = [
  { id: "economy", name: "Economy", badge: "ECO", price: 12.5, time: "5 min" },
  { id: "comfort", name: "Comfort", badge: "CFT", price: 18.0, time: "3 min" },
  { id: "premium", name: "Premium", badge: "PRM", price: 28.0, time: "7 min" },
  { id: "xl", name: "XL", badge: "XL", price: 22.0, time: "8 min" },
];

const RiderDashboard = () => {
  const [selectedRide, setSelectedRide] = useState("comfort");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [rideActive, setRideActive] = useState(false);
  const currentRide = rideTypes.find((r) => r.id === selectedRide)!;

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
      <section className="rounded-2xl border border-border bg-card h-[280px] lg:h-[360px] p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.14),transparent_40%),radial-gradient(circle_at_80%_80%,hsl(var(--primary)/0.08),transparent_45%)]" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-lg bg-background/70 px-3 py-1.5 border border-border">
            <Navigation size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">Live map preview</span>
          </div>
          <div className="inline-flex items-center gap-1 rounded-lg bg-background/70 px-2.5 py-1 border border-border text-xs text-muted-foreground">
            <MapPin size={12} /> Downtown
          </div>
        </div>
      </section>

      <GlassCard className="space-y-3">
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">Pickup</label>
          <input
            placeholder="Enter pickup location"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            className="w-full h-11 px-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">Dropoff</label>
          <input
            placeholder="Where to?"
            value={drop}
            onChange={(e) => setDrop(e.target.value)}
            className="w-full h-11 px-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
      </GlassCard>

      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Choose ride</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {rideTypes.map((ride) => (
            <button
              key={ride.id}
              type="button"
              onClick={() => setSelectedRide(ride.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                selectedRide === ride.id ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary"
              )}
            >
              <div className="h-8 w-8 rounded-md bg-secondary border border-border flex items-center justify-center text-[11px] font-semibold">
                {ride.badge}
              </div>
              <p className="font-semibold text-sm mt-2">{ride.name}</p>
              <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                <Clock size={12} /> {ride.time}
              </p>
            </button>
          ))}
        </div>
      </section>

      <GlassCard className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Estimated fare</p>
          <div className="text-3xl font-display font-bold">
            <AnimatedCounter value={currentRide.price} prefix="₹" decimals={2} />
          </div>
        </div>
        <MagneticButton onClick={() => setRideActive((prev) => !prev)} className="px-8">
          {rideActive ? "Cancel Ride" : "Confirm Ride"}
        </MagneticButton>
      </GlassCard>

      {rideActive && (
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Driver arriving in 3 min</p>
              <p className="font-display font-bold text-lg">Ahmed K.</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-semibold">
              AK
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-secondary rounded-md px-2.5 py-1.5 text-muted-foreground">Toyota Camry | ABC 1234</span>
            <span className="text-xs bg-secondary rounded-md px-2.5 py-1.5 text-muted-foreground">Rating 4.9</span>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 h-10 rounded-lg bg-secondary border border-border text-sm flex items-center justify-center gap-2">
              <Phone size={14} /> Call
            </button>
            <button className="flex-1 h-10 rounded-lg bg-secondary border border-border text-sm flex items-center justify-center gap-2">
              <MessageCircle size={14} /> Message
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default RiderDashboard;
