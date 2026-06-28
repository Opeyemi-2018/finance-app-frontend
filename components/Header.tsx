"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/app/context/AuthContext";

const Header = () => {
  const { user } = useAuth();
  return (
    <header className="flex h-16 items-center justify-between px-4 border-b bg-white">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />
      </div>

      {/* Right side (your info area) */}
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-[#201F24]">{user?.userName}</h1>
      </div>
    </header>
  );
};

export default Header;
