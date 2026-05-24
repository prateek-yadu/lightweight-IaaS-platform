import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import Branding from "../../branding.json";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import { Link, useNavigate } from "react-router";
import { TypographyH4 } from "../Typography/typography";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { BadgeCheckIcon, CreditCardIcon, LogOutIcon, LucideLayoutDashboard, Menu } from "lucide-react";
import { updateAuthState } from "@/app/features/auth/AuthHandler";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const appName = Branding.AppName; // gets app name from @/src/branding.json

  // gets AuthState
  const authState = useSelector((state: RootState) => state.AuthState);

  // checks if user is authenticated or not
  const isAuthenticated = authState.isAuthenticated;

  // gets user details
  const user = useSelector((state: RootState) => state.AuthState);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  // genrates user fallback text
  const arr = user.name?.split(" ");
  const fallbackUserAvatar = `${
    arr?.at(0)?.toUpperCase().charAt(0) +
    `${arr
      ?.at(arr.length - 1)
      ?.toUpperCase()
      .charAt(0)}`
  }`;

  const links = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Pricing",
      href: "/pricing",
    },
  ];

  const accountLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LucideLayoutDashboard,
    },
    {
      name: "Account",
      href: "/account",
      icon: BadgeCheckIcon,
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: CreditCardIcon,
    },
  ];

  // utility function to cahnge route
  const changeRoute = (route: string) => {
    let path = route;
    navigate(path);
  };

  const logoutUser = async () => {
    const res = await (
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (res.status == 200) {
      // clears user detail when user logs out
      dispatch(
        updateAuthState({
          isAuthenticated: false,
          name: undefined,
          email: undefined,
          imageUrl: undefined,
        }),
      );
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <nav className="bg-background">
      <div className="container m-auto p-4 flex justify-between">
        {/* Brand Icon */}
        <Link to={"/"} className="flex items-center gap-2">
          <img src="/brandIcon.svg" alt="brand-icon" className="size-7" />
          <TypographyH4>{appName}</TypographyH4>
        </Link>

        <NavigationMenu className={"hidden md:block"}>
          <NavigationMenuList className={"space-x-2"}>
            {links.map((link) => (
              <NavigationMenuItem key={link.name}>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  render={<Link to={link.href}>{link.name}</Link>}
                />
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2 flex-row-reverse">

        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={user.imageUrl} alt={user.name} />
                <AvatarFallback>{fallbackUserAvatar}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56 rounded-lg" side={"bottom"} align="end" sideOffset={4}>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar>
                      <AvatarImage src={user.imageUrl} alt={user.name} />
                      <AvatarFallback>{fallbackUserAvatar}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {accountLinks.map((link) => (
                  <DropdownMenuItem>
                    <Link to={link.href} className="flex items-center gap-2 w-full">
                      <link.icon />
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logoutUser();
                }}
              >
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <Button
              className={"p-4"}
              onClick={() => {
                changeRoute("/login");
              }}
            >
              Login
            </Button>
            <Button
              className={"p-4"}
              variant={"outline"}
              onClick={() => {
                changeRoute("/register");
              }}
            >
              Register
            </Button>
          </div>
        )}

        {/* Nav for mobile devices */}
        <Sheet>
          <SheetTrigger>
            <Menu className="md:hidden" />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>Navigation Menu</SheetHeader>
            <ul className={"space-x-2 flex  flex-col w-full gap-y-6"}>
              {links.map((link) => (
                <li key={link.name} className="w-full">
                  <Link to={link.href} className="text-base font-medium pl-6 block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {!isAuthenticated && (
              <div className="flex items-center gap-2 flex-col px-4">
                <Button
                  className={"p-4 w-full"}
                  onClick={() => {
                    changeRoute("/login");
                  }}
                >
                  Login
                </Button>
                <Button
                  className={"p-4 w-full"}
                  variant={"outline"}
                  onClick={() => {
                    changeRoute("/register");
                  }}
                >
                  Register
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
      </div>
    </nav>
  );
}
