import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/presentation/hooks/use-auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Users, List, AlertTriangle, Settings, ChevronDown } from "lucide-react";
import { ConfirmationDialog } from "@/presentation/components/ui/confirmation-dialog";
import { useToast } from "@/presentation/hooks/use-toast";

interface MainLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Incident Categories",
    href: "/incident-categories",
    icon: List,
  },
  {
    title: "Incidents",
    href: "/incidents",
    icon: AlertTriangle,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      router.push("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while logging out. Please try again.",
      });
    } finally {
      setIsLoggingOut(false);
      setIsLogoutDialogOpen(false);
    }
  };

  const handleOpenLogoutDialog = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleCloseLogoutDialog = () => {
    if (!isLoggingOut) {
      setIsLogoutDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold">Xomly Admin</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2" disabled={isLoggingOut}>
                  {currentUser?.displayName}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpenLogoutDialog} disabled={isLoggingOut}>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-64 border-r bg-background">
          <nav className="space-y-1 p-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pl-64">
          <div className="container py-6">{children}</div>
        </main>
      </div>

      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={handleCloseLogoutDialog}
        onConfirm={handleLogout}
        title="Confirm Logout"
        description="Are you sure you want to logout? You will need to login again to access the dashboard."
        confirmText="Logout"
        cancelText="Cancel"
      />
    </div>
  );
}
