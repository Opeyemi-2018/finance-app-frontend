"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  House,
  Users,
  Settings,
  ShoppingCart,
  LogOut,
  ArrowLeftRight,
  Blend,
  BadgeDollarSign,
  BanknoteArrowDown,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

const items = [
  {
    title: "Overview",
    url: "/overview",
    icon: House,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "Budgets",
    url: "/budgets",
    icon: Blend,
  },
  // {
  //   title: "Pots",
  //   url: "/pots",
  //   icon: BadgeDollarSign,
  // },
  // {
  //   title: "Recurring Bills",
  //   url: "/recurring-bills",
  //   icon: BanknoteArrowDown,
  // },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { logout } = useAuth();
  return (
    <Sidebar
      collapsible="icon"
      className="bg-[#201F24] rounded-tr-2xl rounded-br-2xl pt-5 text-[#F2F2F2]"
    >
      {" "}
      <SidebarHeader className="p-4">
        <h2 className="text-[25px] font-bold pb-3">
          {state === "collapsed" ? "F" : "Finance"}
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="">
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-4">
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-[16px]">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
              <span className="font-semibold">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
