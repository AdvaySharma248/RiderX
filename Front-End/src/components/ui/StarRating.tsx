import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: number;
}

const StarRating = ({ rating, onRate, interactive = false, size = 24 }: StarRatingProps) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <motion.button
        key={star}
        type="button"
        disabled={!interactive}
        onClick={() => onRate?.(star)}
        whileHover={interactive ? { scale: 1.3 } : undefined}
        whileTap={interactive ? { scale: 0.9 } : undefined}
        className={cn("transition-colors", interactive && "cursor-pointer")}
      >
        <Star
          size={size}
          className={cn(
            "transition-all duration-200",
            star <= rating
              ? "fill-warning text-warning drop-shadow-[0_0_6px_hsl(var(--warning)/0.5)]"
              : "text-muted-foreground"
          )}
        />
      </motion.button>
    ))}
  </div>
);

export default StarRating;
