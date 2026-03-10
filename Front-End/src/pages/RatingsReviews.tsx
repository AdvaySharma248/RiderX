import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import StarRating from "@/components/ui/StarRating";
import { staggerContainer, staggerItem } from "@/lib/animations";

const RatingsReviews = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setFeedback("");
    }, 3000);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="p-4 lg:p-6 space-y-4 max-w-lg mx-auto"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-display font-bold">Rate Your Ride</h1>
        <p className="text-sm text-muted-foreground mt-1">How was your experience?</p>
      </motion.div>

      {/* Driver card */}
      <motion.div variants={staggerItem}>
        <GlassCard className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-2xl">👤</div>
          <div>
            <p className="font-display font-bold text-lg">Ahmed K.</p>
            <p className="text-xs text-muted-foreground">Toyota Camry • 25 min ride</p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Star rating */}
      <motion.div variants={staggerItem}>
        <GlassCard className="flex flex-col items-center py-8">
          <p className="text-sm text-muted-foreground mb-4">Tap to rate</p>
          <StarRating rating={rating} onRate={setRating} interactive size={40} />
          <AnimatePresence>
            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm text-muted-foreground"
              >
                {rating <= 2 ? "We're sorry to hear that" : rating <= 4 ? "Good experience!" : "Excellent! ✨"}
              </motion.p>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>

      {/* Feedback */}
      <motion.div variants={staggerItem}>
        <GlassCard>
          <p className="text-sm font-medium mb-3">Additional feedback</p>
          <div className="relative">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more about your ride..."
              maxLength={500}
              rows={4}
              className="w-full rounded-xl bg-secondary/50 border border-border p-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none transition-colors"
            />
            <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
              {feedback.length}/500
            </span>
          </div>
        </GlassCard>
      </motion.div>

      {/* Submit */}
      <motion.div variants={staggerItem}>
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="h-12 rounded-xl bg-[hsl(var(--success))] flex items-center justify-center gap-2 glow-success"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <Check size={20} className="text-primary-foreground" />
              </motion.div>
              <span className="font-semibold text-primary-foreground">Thank you!</span>
            </motion.div>
          ) : (
            <motion.div key="button" exit={{ scale: 0.8, opacity: 0 }}>
              <MagneticButton
                className="w-full h-12"
                onClick={handleSubmit}
                disabled={rating === 0}
              >
                Submit Review
              </MagneticButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default RatingsReviews;
