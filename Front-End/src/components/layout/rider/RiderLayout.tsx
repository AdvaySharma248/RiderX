import { useEffect } from "react";
import { Car, LogOut } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import RiderBottomNav from "./RiderBottomNav";
import RiderTopNav from "./RiderTopNav";
import { authApi } from "@/lib/api";
import { clearSession, getSession } from "@/lib/session";

const RiderLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (!session?.user) {
      navigate("/", { replace: true });
      return;
    }
    if (session.user.accountType !== "rider") {
      navigate(session.user.accountType === "driver" ? "/driver" : "/", { replace: true });
    }
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } catch {
      // Session is client-managed; clear regardless of network state.
    } finally {
      clearSession();
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="rider-shell min-h-screen">
      <header className="sticky top-0 z-[1000] border-b border-border/60 bg-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Car size={20} />
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-none">RideX</p>
              <p className="text-xs text-muted-foreground">Customer</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2">
            <RiderTopNav />
            <button
              type="button"
              onClick={handleSignOut}
              className="h-10 px-3 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors inline-flex items-center gap-2"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-4 pb-24 md:pb-6">
        <Outlet />
      </main>

      <RiderBottomNav />
    </div>
  );
};

export default RiderLayout;
