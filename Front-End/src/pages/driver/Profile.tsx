import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CarFront, Moon, ShieldCheck, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { driverApi, toApiErrorMessage } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";

const DriverProfilePage = () => {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme !== "light";
  const sessionUser = getSessionUser();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["driver", "profile"],
    queryFn: driverApi.getProfile,
  });

  useEffect(() => {
    if (!data) return;
    setNotifications(data.notifications);
    setAutoAccept(data.autoAccept);
  }, [data]);

  const updateProfileMutation = useMutation({
    mutationFn: driverApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "profile"] });
    },
    onError: (mutationError) => {
      toast.error(toApiErrorMessage(mutationError, "Failed to update profile settings"));
    },
  });

  const handleNotificationsToggle = (checked: boolean) => {
    setNotifications(checked);
    updateProfileMutation.mutate({ notifications: checked });
  };

  const handleAutoAcceptToggle = (checked: boolean) => {
    setAutoAccept(checked);
    updateProfileMutation.mutate({ autoAccept: checked });
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
    updateProfileMutation.mutate({ darkMode: checked });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {toApiErrorMessage(error, "Failed to load driver profile")}
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 max-w-3xl"
    >
      <header>
        <h1 className="text-2xl font-display font-semibold">Driver Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Vehicle, compliance, and workspace controls.</p>
      </header>

      <div className="rounded-xl border border-border bg-card p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-secondary px-3 py-3">
          <p className="text-xs text-muted-foreground">Driver</p>
          <p className="font-semibold mt-1">{sessionUser?.name ?? "Driver User"}</p>
          <p className="text-xs text-muted-foreground mt-1">{sessionUser?.email ?? "No email"}</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary px-3 py-3">
          <p className="text-xs text-muted-foreground">Vehicle</p>
          <p className="font-semibold mt-1 inline-flex items-center gap-1.5">
            <CarFront size={14} className="text-primary" /> {data.vehicle.model}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.vehicle.plate} | {data.vehicle.category}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5">
            <Bell size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Trip notifications</span>
          </div>
          <Switch checked={notifications} onCheckedChange={handleNotificationsToggle} />
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Auto-accept nearby rides</span>
          </div>
          <Switch checked={autoAccept} onCheckedChange={handleAutoAcceptToggle} />
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5">
            <Moon size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Dark mode</span>
          </div>
          <Switch checked={isDarkMode} onCheckedChange={handleDarkModeToggle} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {["Vehicle Documents", "Payout Settings", "Tax Details", "Help & Support"].map((item) => (
          <button
            key={item}
            type="button"
            className="w-full px-4 py-3 inline-flex items-center justify-between text-sm hover:bg-secondary transition-colors"
          >
            <span>{item}</span>
            <ChevronRight size={14} className="text-muted-foreground" />
          </button>
        ))}
      </div>
    </motion.section>
  );
};

export default DriverProfilePage;
