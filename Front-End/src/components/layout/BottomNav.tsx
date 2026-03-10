import { motion } from "framer-motion";
import { Home, Car, Clock, Star, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "Ride", path: "/rider" },
  { icon: Car, label: "Drive", path: "/driver" },
  { icon: Clock, label: "History", path: "/history" },
  { icon: Star, label: "Rate", path: "/ratings" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="bottomnav-active"
                  className="absolute inset-0 gradient-primary rounded-xl opacity-15"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon
                size={20}
                className={cn(
                  "transition-colors duration-200",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span className={cn(
                "text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
