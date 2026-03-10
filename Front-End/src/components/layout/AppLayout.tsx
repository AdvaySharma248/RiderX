import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import SidebarNav from "./SidebarNav";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="md:ml-20 lg:ml-64 pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
