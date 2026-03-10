import { BarChart3, CarFront, ClipboardList, History, UserCircle2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const driverTabs = [
  { label: "Home", icon: CarFront, path: "/driver" },
  { label: "Active", icon: ClipboardList, path: "/driver/active-ride" },
  { label: "Earn", icon: BarChart3, path: "/driver/earnings" },
  { label: "History", icon: History, path: "/driver/history" },
  { label: "Profile", icon: UserCircle2, path: "/driver/profile" },
];

const DriverMobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm md:hidden">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {driverTabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              className={cn(
                "h-14 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors",
                active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"
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

export default DriverMobileNav;
