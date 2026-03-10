import { useMemo, useState } from "react";
import { DollarSign, TrendingUp, Clock, CheckCircle, MapPin, Check, X } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

const initialRides = [
  { id: 1, passenger: "Sarah M.", pickup: "123 Main St", drop: "Airport Terminal 2", fare: 24.5, distance: "8.2 mi", rating: 4.8 },
  { id: 2, passenger: "John D.", pickup: "456 Oak Ave", drop: "Downtown Mall", fare: 12.0, distance: "3.1 mi", rating: 4.5 },
  { id: 3, passenger: "Emily R.", pickup: "789 Pine Rd", drop: "University Campus", fare: 15.75, distance: "5.4 mi", rating: 4.9 },
];

const steps = ["Requested", "Accepted", "Picked Up", "Dropping Off", "Completed"];

const DriverDashboard = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [rides, setRides] = useState(initialRides);

  const progressWidth = useMemo(
    () => `${(activeStep / (steps.length - 1)) * 100}%`,
    [activeStep]
  );

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
      <header>
        <h1 className="text-2xl font-display font-bold">Driver Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage rides and earnings</p>
      </header>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "Today", value: 142.5, icon: DollarSign, prefix: "₹", decimals: 2 },
          { label: "This Week", value: 856.25, icon: TrendingUp, prefix: "₹", decimals: 2 },
          { label: "Trips", value: 12, icon: Clock, prefix: "", decimals: 0 },
        ].map((stat) => (
          <GlassCard key={stat.label} className="!p-4 text-center">
            <stat.icon size={18} className="text-primary mx-auto mb-2" />
            <div className="text-xl font-display font-bold">
              <AnimatedCounter value={stat.value} prefix={stat.prefix} decimals={stat.decimals} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </GlassCard>
        ))}
      </section>

      <GlassCard className="space-y-4">
        <p className="text-sm font-medium">Current Ride Status</p>
        <div className="relative">
          <div className="h-1 rounded-full bg-secondary" />
          <div className="absolute inset-y-0 left-0 h-1 rounded-full bg-primary transition-[width] duration-200" style={{ width: progressWidth }} />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {steps.map((step, i) => (
            <div key={step} className="text-center">
              <div className={`mx-auto mb-1 h-6 w-6 rounded-full flex items-center justify-center text-[11px] ${i <= activeStep ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {i < activeStep ? <CheckCircle size={12} /> : i + 1}
              </div>
              <span className="text-[10px] text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <MagneticButton variant="outline" className="flex-1 text-xs" onClick={() => setActiveStep(Math.max(0, activeStep - 1))}>
            Previous
          </MagneticButton>
          <MagneticButton className="flex-1 text-xs" onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}>
            Next Step
          </MagneticButton>
        </div>
      </GlassCard>

      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Available Rides</h3>
        <div className="space-y-3">
          {rides.map((ride) => (
            <GlassCard key={ride.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{ride.passenger}</p>
                  <p className="text-xs text-muted-foreground">Rating {ride.rating} | {ride.distance}</p>
                </div>
                <span className="text-lg font-display font-bold text-primary">₹{ride.fare.toFixed(2)}</span>
              </div>
              <div className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground space-y-1.5">
                <p className="inline-flex items-center gap-1.5"><MapPin size={12} /> {ride.pickup}</p>
                <p className="inline-flex items-center gap-1.5"><MapPin size={12} /> {ride.drop}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 h-9 rounded-lg border border-primary/35 bg-primary/10 text-primary text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors hover:bg-primary/15"
                  onClick={() => setRides((prev) => prev.filter((r) => r.id !== ride.id))}
                >
                  <Check size={14} />
                  Accept
                </button>
                <button
                  type="button"
                  className="flex-1 h-9 rounded-lg border border-border bg-secondary text-muted-foreground text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors hover:border-destructive/40 hover:text-destructive"
                  onClick={() => setRides((prev) => prev.filter((r) => r.id !== ride.id))}
                >
                  <X size={14} />
                  Decline
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DriverDashboard;
