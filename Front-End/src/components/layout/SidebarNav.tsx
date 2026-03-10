import { motion } from "framer-motion";
import { Home, Car, Clock, Star, User, MapPin, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Ride", path: "/rider" },
  { icon: Car, label: "Drive", path: "/driver" },
  { icon: MapPin, label: "Tracking", path: "/tracking" },
  { icon: Clock, label: "History", path: "/history" },
  { icon: Star, label: "Ratings", path: "/ratings" },
  { icon: User, label: "Profile", path: "/profile" },
];

const SidebarNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-64 glass-strong min-h-screen py-6 px-3 lg:px-4 fixed left-0 top-0 z-40">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <Car size={20} className="text-primary-foreground" />
        </div>
        <span className="hidden lg:block text-xl font-display font-bold gradient-text">RideX</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 gradient-primary rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon size={20} className="relative z-10" />
              <span className="hidden lg:block relative z-10 font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
      >
        <LogOut size={20} />
        <span className="hidden lg:block text-sm font-medium">Sign Out</span>
      </button>
    </aside>
  );
};

export default SidebarNav;
