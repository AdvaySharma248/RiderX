import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/layout/ScrollToTop";
import AppErrorBoundary from "./components/layout/AppErrorBoundary";
import RiderLayout from "./components/layout/rider/RiderLayout";
import DriverLayout from "./components/layout/driver/DriverLayout";
import RiderDashboardPage from "./pages/rider/Dashboard";
import RiderTrackingPage from "./pages/rider/Tracking";
import RiderHistoryPage from "./pages/rider/History";
import RiderProfilePage from "./pages/rider/Profile";
import RiderRatingsPage from "./pages/rider/Ratings";
import DriverDashboardPage from "./pages/driver/Dashboard";
import DriverActiveRidePage from "./pages/driver/ActiveRide";
import DriverEarningsPage from "./pages/driver/Earnings";
import DriverHistoryPage from "./pages/driver/History";
import DriverProfilePage from "./pages/driver/Profile";
import EmailVerification from "./pages/EmailVerification";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppErrorBoundary>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/user/verify-email" element={<EmailVerification />} />
            <Route path="/captain/verify-email" element={<EmailVerification />} />
            <Route path="/rider" element={<RiderLayout />}>
              <Route index element={<RiderDashboardPage />} />
              <Route path="tracking" element={<RiderTrackingPage />} />
              <Route path="history" element={<RiderHistoryPage />} />
              <Route path="profile" element={<RiderProfilePage />} />
              <Route path="ratings" element={<RiderRatingsPage />} />
            </Route>
            <Route path="/driver" element={<DriverLayout />}>
              <Route index element={<DriverDashboardPage />} />
              <Route path="active-ride" element={<DriverActiveRidePage />} />
              <Route path="earnings" element={<DriverEarningsPage />} />
              <Route path="history" element={<DriverHistoryPage />} />
              <Route path="profile" element={<DriverProfilePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
