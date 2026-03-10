import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Skeleton } from "@/components/ui/skeleton";
import { driverApi, toApiErrorMessage } from "@/lib/api";

const DriverEarningsPage = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["driver", "earnings"],
    queryFn: driverApi.getEarnings,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {toApiErrorMessage(error, "Failed to load earnings")}
      </div>
    );
  }

  const max = Math.max(...data.weekly.map((item) => item.value), 1);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <header>
        <h1 className="text-2xl font-display font-semibold">Earnings Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Weekly trends and payout performance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">This week</p>
          <p className="text-2xl font-display font-bold mt-1">
            <AnimatedCounter value={data.total} prefix="Rs. " decimals={2} />
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Highest day</p>
          <p className="text-2xl font-display font-bold mt-1">Rs. {data.highest.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Trips completed</p>
          <p className="text-2xl font-display font-bold mt-1">{data.tripsCompleted}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-semibold mb-4">7-day earnings trend</p>
        <div className="grid grid-cols-7 gap-2 items-end h-52">
          {data.weekly.map((item) => (
            <div key={item.day} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-primary/85 transition-[height] duration-300 ease-smooth"
                style={{ height: `${(item.value / max) * 150 + 16}px` }}
              />
              <span className="text-[11px] text-muted-foreground">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default DriverEarningsPage;
