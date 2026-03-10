import { Home, MapPinned, Clock3, Star, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const riderTabs = [
  { label: "Dashboard", icon: Home, path: "/rider" },
  { label: "Tracking", icon: MapPinned, path: "/rider/tracking" },
  { label: "History", icon: Clock3, path: "/rider/history" },
  { label: "Ratings", icon: Star, path: "/rider/ratings" },
  { label: "Profile", icon: User, path: "/rider/profile" },
];

const RiderTopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="hidden md:flex items-center gap-2 rounded-2xl border border-border bg-card p-2">
      {riderTabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => navigate(tab.path)}
            className={cn(
              "h-10 px-4 rounded-xl inline-flex items-center gap-2 text-sm font-medium transition-[transform,background-color,color] duration-250 ease-smooth",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <tab.icon size={15} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RiderTopNav;
