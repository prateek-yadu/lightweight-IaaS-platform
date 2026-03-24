import { Bell, CircleQuestionMark, CircleUser, CreditCard, Home, LanguagesIcon, LayoutDashboard, LogOut, Menu, Server, Store } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import Sidebar from "../../components/dashboard/Sidebar";
import { toast } from "sonner";
import { updateAuthState } from "../../app/features/auth/AuthHandler";

export default function DashboardLayout() {

  // gets user info
  const user = useSelector((state: RootState) => state.AuthState);

  const dispatch = useDispatch();

  // genrates user fallback text 
  const arr = user.name?.split(" ");
  const fallbackUserAvatar = `${arr?.at(0)?.toUpperCase().charAt(0) + `${arr?.at(arr.length - 1)?.toUpperCase().charAt(0)}`}`;

  const links = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "VPS",
      href: "/dashboard/vps",
      icon: Server
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: CreditCard
    },
    {
      name: "Marketplace",
      href: "/dashboard/market",
      icon: Store
    }
  ];

  const footerLinks = [
    {
      name: "Help",
      href: "/help",
      icon: CircleQuestionMark
    }
  ];

  const accountLinks = [
    {
      name: "Account",
      href: "/",
      icon: CircleUser,
    },
    {
      name: "Notifications",
      href: "/",
      icon: Bell,
    },
    {
      name: "Language",
      href: "/",
      icon: LanguagesIcon,
    },
    {
      name: "Logout",
      href: "/",
      icon: LogOut,
    },
  ];

  // gets url location
  const location = useLocation();

  // get pathname eg. /dahboard/vps => VPS
  const currentURLRoute = location.pathname.split("/").pop();

  // handles user account collapasble button logic
  const [isCollapsableOpen, setIsCollapsableOpen] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // stores drawer state
  const changeSidebarState = () => {
    setIsSidebarOpen(true);
  };

  const logoutUser = async () => {
    const res = await (await fetch('/api/v1/auth/logout', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    })).json();

    if (res.status == 200) {

      // clears user detail when user logs out 
      dispatch(
        updateAuthState({
          isAuthenticated: false,
          name: undefined,
          email: undefined,
          imageUrl: undefined
        })
      );
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="flex h-screen">
      {/* sidebar */}
      <Sidebar headerLinks={links} footerLinks={footerLinks} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* main pannel */}
      <div className="flex-1 bg-primary-background border-l-[1px] border-border-primary">

        {/* main pannel nav bar */}
        <nav className="bg-white border-b-[1px] border-border-primary flex items-center justify-between px-4 lg:px-8 py-2">

          {/* Mobile menu  toggle */}
          <div className="lg:hidden">
            <button className="flex items-center cursor-pointer" onClick={() => { changeSidebarState(); }}>
              <Menu className="size-6 text-accent" />
            </button>
          </div>

          {/* Breadcrumb */}
          <div className="hidden lg:block">
            <div className="flex items-center text-sm text-secondary-foreground gap-2 uppercase">

              <Link to={"/dashboard"} className=""><Home className="size-5 hover:text-accent" /></Link>
              {currentURLRoute != "dashboard" &&
                <>
                  <div className="">-</div>
                  <div className="">{currentURLRoute}</div>
                </>
              }
            </div>
          </div>

          <div className='flex items-center justify-center gap-4'>

            {/* user account info collapsable card */}
            <div className={`${isCollapsableOpen ? "absolute" : "hidden"} top-14  right-0 md:right-16 bg-white shadow border-[1px] border-border-primary rounded z-50 md:w-80 w-full`}>

              {/* user name, image and email */}
              <div className="flex items-center gap-4 p-4">
                <div className="size-12">
                  <img src={user.imageUrl} alt={fallbackUserAvatar}
                    className='w-full h-full object-cover rounded-full'
                  />
                </div>
                <div className="">
                  <h4 className="scroll-m-20 font-medium tracking-tight text-primary text-lg">{user.name}</h4>
                  <p className="text-secondary-foreground text-sm">{user.email}</p>
                </div>
              </div>
              <div className="border-t-[1px] mt-0 border-border-primary" />

              {/* user account button links */}
              <div className="">
                <ul className="p-2">
                  {accountLinks.map((link, index) => (
                    <li key={index}>
                      <button className={`flex w-full items-center gap-2 py-3  p-4 text-sm rounded ${link.name == "Logout" ? "hover:bg-red-100 text-red-500" : "text-primary hover:bg-accent/[6%]"}`} onClick={() => {
                        logoutUser();
                      }}>
                        <link.icon className="size-5" />
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Overlay Screen  */}
            <div className={`${isCollapsableOpen ? "absolute top-0 left-0 right-0 bottom-0 bg-black/40 md:bg-transparent" : "hidden"}`} onClick={() => { setIsCollapsableOpen(!isCollapsableOpen); }}></div>

            {/* user account button */}
            <button className="size-9 rounded-full cursor-pointer" onClick={() => { setIsCollapsableOpen(!isCollapsableOpen); }}>
              <img src={user.imageUrl} alt={fallbackUserAvatar}
                className='w-full h-full object-cover rounded-full'
              />
            </button>

          </div>
        </nav>

        {/* page content */}
        <div className="px-4 lg:px-8 py-4">
          <Outlet />
        </div>

      </div>
    </div>
  );
}
