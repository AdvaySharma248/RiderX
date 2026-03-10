import { useState } from "react";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import StarRating from "@/components/ui/StarRating";
import MagneticButton from "@/components/ui/MagneticButton";
import { riderApi, toApiErrorMessage } from "@/lib/api";
import { toast } from "@/components/ui/sonner";

const RiderRatingsPage = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitReviewMutation = useMutation({
    mutationFn: riderApi.submitRating,
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Thanks for your feedback");
      window.setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setFeedback("");
      }, 1800);
    },
    onError: (error) => {
      toast.error(toApiErrorMessage(error, "Unable to submit review"));
    },
  });

  const handleSubmit = () => {
    submitReviewMutation.mutate({
      rating,
      feedback: feedback.trim(),
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 max-w-2xl"
    >
      <header>
        <h1 className="text-2xl font-display font-semibold">Ratings & Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">Share feedback to improve rider quality.</p>
      </header>

      <div className="rounded-3xl border border-border bg-card p-5">
        <p className="text-sm font-medium">Rate your latest ride</p>
        <div className="mt-4 flex justify-center">
          <StarRating rating={rating} onRate={setRating} interactive size={36} />
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-4">
        <textarea
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Tell us more about your ride"
          className="w-full rounded-xl border border-border bg-secondary p-3 text-sm outline-none focus:border-primary transition-colors resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2 text-right">{feedback.length}/500</p>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="h-12 rounded-xl bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 px-5"
          >
            <Check size={16} />
            <span className="text-sm font-semibold">Thanks for your feedback</span>
          </motion.div>
        ) : (
          <motion.div key="action" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MagneticButton
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0 || submitReviewMutation.isPending}
              loading={submitReviewMutation.isPending}
              className="h-12 px-7"
            >
              Submit Review
            </MagneticButton>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default RiderRatingsPage;
