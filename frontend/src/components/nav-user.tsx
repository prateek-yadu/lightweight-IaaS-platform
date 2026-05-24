"use client";

import { updateAuthState } from "@/app/features/auth/AuthHandler";
import type { RootState } from "@/app/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { ChevronsUpDownIcon, BadgeCheckIcon, CreditCardIcon, LogOutIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function NavUser() {
  const { isMobile } = useSidebar();

  // gets user info
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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />}>
            <Avatar>
              <AvatarImage src={user.imageUrl} alt={user.name} />
              <AvatarFallback>{fallbackUserAvatar}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
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
              <DropdownMenuItem
                onClick={() => {
                  changeRoute("/account");
                }}
              >
                <BadgeCheckIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  changeRoute("/dashboard/billing");
                }}
              >
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
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
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
