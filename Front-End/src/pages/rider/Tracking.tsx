import { useEffect, useState } from "react";
import { LoaderCircle, MapPinned, Phone, MessageCircle, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { riderApi, toApiErrorMessage } from "@/lib/api";
import { toast } from "@/components/ui/sonner";

const RiderTrackingPage = () => {
  const queryClient = useQueryClient();
  const [eta, setEta] = useState(0);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["rider", "tracking"],
    queryFn: riderApi.getTracking,
    refetchInterval: 3000,
  });

  const sosMutation = useMutation({
    mutationFn: riderApi.triggerSos,
    onSuccess: () => {
      toast.success("Emergency alert sent");
    },
    onError: (mutationError) => {
      toast.error(toApiErrorMessage(mutationError, "Unable to send emergency alert"));
    },
  });

  const cancelRideMutation = useMutation({
    mutationFn: riderApi.cancelBooking,
    onSuccess: () => {
      toast.success("Ride cancelled");
      queryClient.invalidateQueries({ queryKey: ["rider", "tracking"] });
      queryClient.invalidateQueries({ queryKey: ["rider", "history"] });
      queryClient.invalidateQueries({ queryKey: ["rider", "dashboard"] });
    },
    onError: (mutationError) => {
      toast.error(toApiErrorMessage(mutationError, "Unable to cancel ride"));
    },
  });

  useEffect(() => {
    if (!data) return;
    setEta(data.rideStatus === "searching" ? 0 : data.etaSeconds);
  }, [data]);

  useEffect(() => {
    if (!data || data.rideStatus === "searching") return;

    const timer = window.setInterval(() => {
      setEta((value) => Math.max(value - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-[420px] rounded-3xl" />;
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {toApiErrorMessage(error, "Failed to load ride tracking")}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-border bg-card p-4 text-sm text-muted-foreground">
        No active ride tracking is available right now.
      </div>
    );
  }

  const minutes = Math.floor(eta / 60);
  const seconds = eta % 60;
  const isSearching = data.rideStatus === "searching";
  const rideStatusBadge =
    data.rideStatus === "searching"
      ? "Searching"
      : data.rideStatus === "accepted"
        ? "Accepted"
        : "On trip";

  const handleSos = () => {
    if (isSearching) {
      toast.error("SOS is available after a driver is assigned");
      return;
    }

    if (!("geolocation" in navigator)) {
      sosMutation.mutate({ rideId: data.rideId, message: "SOS triggered by rider" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        sosMutation.mutate({
          rideId: data.rideId,
          message: "SOS triggered by rider",
          location: {
            ltd: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      () => {
        sosMutation.mutate({ rideId: data.rideId, message: "SOS triggered by rider" });
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 30000,
      }
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="relative rounded-3xl border border-border bg-card overflow-hidden min-h-[420px] shadow-[0_18px_42px_-36px_hsl(var(--foreground)/0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,hsl(var(--primary)/0.16),transparent_50%),radial-gradient(circle_at_70%_70%,hsl(var(--primary)/0.08),transparent_45%)]" />
        <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-xl border border-border bg-background/90 px-3 py-2 text-xs text-muted-foreground">
          <MapPinned size={14} className="text-primary" />
          Live rider tracking
        </div>
        <button
          type="button"
          onClick={handleSos}
          disabled={sosMutation.isPending}
          className="absolute top-4 right-4 h-10 w-10 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive inline-flex items-center justify-center"
        >
          <ShieldAlert size={16} />
        </button>

        <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-border bg-background/95 backdrop-blur-sm p-4 space-y-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{isSearching ? "Finding your ride" : "Estimated arrival"}</p>
            {isSearching ? (
              <p className="text-sm font-medium mt-1 inline-flex items-center gap-2 text-primary">
                <LoaderCircle size={15} className="animate-spin" />
                Searching for rides...
              </p>
            ) : (
              <p className="text-3xl font-display font-bold tracking-tight">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-secondary p-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{isSearching ? "Searching for rides..." : data.driverName}</p>
              <p className="text-xs text-muted-foreground">
                {isSearching ? "We'll show your driver details once a captain accepts." : `${data.car} | ${data.plate}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{data.statusText}</p>
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-md ${
                isSearching ? "bg-secondary text-muted-foreground" : "bg-primary/12 text-primary"
              }`}
            >
              {rideStatusBadge}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={isSearching}
              className="h-10 rounded-xl border border-border bg-secondary text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-muted transition-colors disabled:opacity-60 disabled:pointer-events-none"
            >
              <Phone size={14} /> Call
            </button>
            <button
              disabled={isSearching}
              className="h-10 rounded-xl border border-border bg-secondary text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-muted transition-colors disabled:opacity-60 disabled:pointer-events-none"
            >
              <MessageCircle size={14} /> Message
            </button>
          </div>
          <button
            type="button"
            disabled={!data.canCancel || cancelRideMutation.isPending}
            onClick={() => cancelRideMutation.mutate(data.rideId)}
            className="h-10 w-full rounded-xl border border-destructive/35 bg-destructive/10 text-destructive text-sm font-medium inline-flex items-center justify-center hover:bg-destructive/15 transition-colors disabled:opacity-60 disabled:pointer-events-none"
          >
            {cancelRideMutation.isPending ? "Cancelling..." : "Cancel Ride"}
          </button>
        </div>
      </div>
    </motion.section>
  );
};

export default RiderTrackingPage;
