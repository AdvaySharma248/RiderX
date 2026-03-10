import { useMemo, useState } from "react";
import { ChevronDown, MapPin, Clock, DollarSign, Car } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

const filters = ["All", "Completed", "Cancelled"] as const;

const rides = [
  { id: 1, date: "Today, 2:30 PM", from: "123 Main St", to: "Airport Terminal 2", fare: 24.5, status: "Completed", driver: "Ahmed K.", duration: "25 min", distance: "8.2 mi" },
  { id: 2, date: "Today, 10:15 AM", from: "456 Oak Ave", to: "Downtown Mall", fare: 12.0, status: "Completed", driver: "Sarah L.", duration: "12 min", distance: "3.1 mi" },
  { id: 3, date: "Yesterday, 6:45 PM", from: "789 Pine Rd", to: "University Campus", fare: 15.75, status: "Cancelled", driver: "-", duration: "-", distance: "5.4 mi" },
  { id: 4, date: "Yesterday, 9:00 AM", from: "321 Elm St", to: "Tech Park", fare: 18.0, status: "Completed", driver: "Mike R.", duration: "18 min", distance: "6.7 mi" },
  { id: 5, date: "Feb 26, 3:00 PM", from: "654 Maple Dr", to: "Central Station", fare: 22.0, status: "Completed", driver: "Lisa M.", duration: "22 min", distance: "7.8 mi" },
];

const RideHistory = () => {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = useMemo(
    () => (activeFilter === "All" ? rides : rides.filter((r) => r.status === activeFilter)),
    [activeFilter]
  );

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
      <header>
        <h1 className="text-2xl font-display font-bold">Ride History</h1>
        <p className="text-sm text-muted-foreground mt-1">Your recent trips</p>
      </header>

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-card p-1">
        {filters.map((filter) => {
          const active = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "rounded-lg py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((ride) => {
          const expanded = expandedId === ride.id;
          return (
            <GlassCard
              key={ride.id}
              interactive
              className="cursor-pointer !p-4"
              onClick={() => setExpandedId(expanded ? null : ride.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{ride.from} to {ride.to}</p>
                  <p className="text-xs text-muted-foreground mt-1">{ride.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-md",
                      ride.status === "Completed" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {ride.status}
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn("text-muted-foreground transition-transform", expanded && "rotate-180")}
                  />
                </div>
              </div>

              {expanded && (
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign size={14} />
                    <span>Fare: <span className="text-foreground font-semibold">₹{ride.fare.toFixed(2)}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={14} />
                    <span>Duration: <span className="text-foreground">{ride.duration}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={14} />
                    <span>Distance: <span className="text-foreground">{ride.distance}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Car size={14} />
                    <span>Driver: <span className="text-foreground">{ride.driver}</span></span>
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default RideHistory;
