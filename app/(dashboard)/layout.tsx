import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <Header />

        <main className="p-3 md:p-6 bg-[#F8F4F0] h-full">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
