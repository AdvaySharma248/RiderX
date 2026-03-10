import { cn } from "@/lib/utils";

const ShimmerLoader = ({ className }: { className?: string }) => (
  <div className={cn("shimmer rounded-2xl h-20", className)} />
);

export default ShimmerLoader;
