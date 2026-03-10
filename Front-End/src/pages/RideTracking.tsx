import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, MessageCircle, AlertTriangle, Navigation } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import StarRating from "@/components/ui/StarRating";
import { staggerContainer, staggerItem } from "@/lib/animations";

const RideTracking = () => {
  const [eta, setEta] = useState(480); // seconds

  useEffect(() => {
    const t = setInterval(() => setEta((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const minutes = Math.floor(eta / 60);
  const seconds = eta % 60;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="relative min-h-screen"
    >
      {/* Full-screen map placeholder */}
      <div className="absolute inset-0 bg-secondary/30">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 40% 40%, hsl(var(--neon-emerald) / 0.2) 0%, transparent 60%),
              radial-gradient(circle at 60% 60%, hsl(var(--neon-emerald-light) / 0.2) 0%, transparent 60%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--foreground)/0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)/0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        {/* Animated route line */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            d="M 20 70 Q 40 30 60 50 T 80 30"
            fill="none"
            stroke="hsl(var(--neon-emerald))"
            strokeWidth="0.3"
            strokeDasharray="2 1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
        {/* Driver dot */}
        <motion.div
          className="absolute"
          animate={{ left: ["30%", "50%", "55%"], top: ["60%", "45%", "40%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="relative">
            <div className="w-4 h-4 rounded-full gradient-primary" />
            <div className="absolute inset-0 w-4 h-4 rounded-full gradient-primary animate-ping opacity-40" />
          </div>
        </motion.div>
      </div>

      {/* Top bar */}
      <motion.div variants={staggerItem} className="relative z-10 p-4">
        <GlassCard className="!p-3 flex items-center gap-2">
          <Navigation size={16} className="text-primary" />
          <span className="text-sm font-medium">Live Tracking</span>
          <span className="ml-auto text-xs text-muted-foreground">Ride #4821</span>
        </GlassCard>
      </motion.div>

      {/* SOS Button */}
      <motion.div
        variants={staggerItem}
        className="absolute top-20 right-4 z-10"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ boxShadow: ["0 0 0px hsl(var(--destructive) / 0)", "0 0 20px hsl(var(--destructive) / 0.3)", "0 0 0px hsl(var(--destructive) / 0)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-full bg-destructive/20 border border-destructive/50 flex items-center justify-center"
        >
          <AlertTriangle size={18} className="text-destructive" />
        </motion.button>
      </motion.div>

      {/* Bottom floating panel */}
      <motion.div
        variants={staggerItem}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
        className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[400px] z-20"
      >
        <GlassCard glow="emerald" className="space-y-4">
          {/* ETA */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Estimated Arrival</p>
            <div className="flex items-center justify-center gap-2">
              <motion.span
                key={minutes}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-display font-bold gradient-text"
              >
                {String(minutes).padStart(2, "0")}
              </motion.span>
              <span className="text-2xl text-muted-foreground animate-pulse">:</span>
              <motion.span
                key={seconds}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-display font-bold gradient-text"
              >
                {String(seconds).padStart(2, "0")}
              </motion.span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">minutes remaining</p>
          </div>

          {/* Driver info */}
          <div className="flex items-center gap-3 bg-secondary/30 rounded-xl p-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg">👤</div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Ahmed K.</p>
              <p className="text-xs text-muted-foreground">Toyota Camry • ABC 1234</p>
              <StarRating rating={5} size={14} />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 h-10 rounded-xl bg-secondary/50 border border-border text-sm flex items-center justify-center gap-2">
              <Phone size={14} /> Call
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 h-10 rounded-xl bg-secondary/50 border border-border text-sm flex items-center justify-center gap-2">
              <MessageCircle size={14} /> Message
            </motion.button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};

export default RideTracking;
