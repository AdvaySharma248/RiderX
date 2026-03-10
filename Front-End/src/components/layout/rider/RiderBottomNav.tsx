import { Home, MapPinned, Clock3, Star, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const riderTabs = [
  { label: "Home", icon: Home, path: "/rider" },
  { label: "Track", icon: MapPinned, path: "/rider/tracking" },
  { label: "History", icon: Clock3, path: "/rider/history" },
  { label: "Ratings", icon: Star, path: "/rider/ratings" },
  { label: "Profile", icon: User, path: "/rider/profile" },
];

const RiderBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-[1000] md:hidden border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {riderTabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              className={cn(
                "h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors",
                active ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <tab.icon size={18} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default RiderBottomNav;
