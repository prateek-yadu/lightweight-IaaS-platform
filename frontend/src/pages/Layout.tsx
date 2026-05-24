import Footer from "@/components/custom/Footer";
import Navbar from "@/components/custom/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Outlet, useLocation } from "react-router";

export default function Layout() {
  const location = useLocation();
  const currentURL = location.pathname;

  const renderNavbar = () => {
    return !currentURL.includes("/dashboard") && !currentURL.includes("/login") && !currentURL.includes("/register");
  };

  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Toaster position="top-center" duration={1500} /> {/* sonner toast */}
        {renderNavbar() && <Navbar />}
        <Outlet />
        {renderNavbar() && <Footer />}
      </ThemeProvider>
    </>
  );
}
