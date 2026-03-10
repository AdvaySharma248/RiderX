import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Clock3, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { driverApi, toApiErrorMessage } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const tabs = ["All", "Completed", "Cancelled"] as const;

const DriverHistoryPage = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["driver", "history"],
    queryFn: driverApi.getHistory,
    refetchInterval: 8000,
  });

  const filteredTrips = useMemo(() => {
    const trips = data ?? [];
    return activeTab === "All" ? trips : trips.filter((trip) => trip.status === activeTab);
  }, [activeTab, data]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <header>
        <h1 className="text-2xl font-display font-semibold">Driver History</h1>
        <p className="text-sm text-muted-foreground mt-1">Trip records with payout details.</p>
      </header>

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "h-10 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {toApiErrorMessage(error, "Failed to load driver history")}
        </div>
      )}

      {!isLoading && !isError && filteredTrips.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          No trips found for this filter.
        </div>
      )}

      <div className="space-y-3">
        {filteredTrips.map((trip) => {
          const isExpanded = expanded === trip.id;
          return (
            <article key={trip.id} className="rounded-xl border border-border bg-card p-4">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setExpanded(isExpanded ? null : trip.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{trip.passenger}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {trip.from} to {trip.to}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{trip.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">Rs. {trip.fare.toFixed(2)}</p>
                    <span
                      className={cn(
                        "text-[10px] px-2 py-1 rounded-md",
                        trip.status === "Completed"
                          ? "bg-primary/12 text-primary"
                          : "bg-destructive/12 text-destructive"
                      )}
                    >
                      {trip.status}
                    </span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "ml-auto mt-1 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p className="inline-flex items-center gap-1.5">
                    <Clock3 size={12} /> {trip.duration}
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <MapPin size={12} /> Payout settled
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </motion.section>
  );
};

export default DriverHistoryPage;
