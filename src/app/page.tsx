"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/presentation/hooks/use-auth";
import { useRouter } from "next/navigation";
import { ConfirmationDialog } from "@/presentation/components/ui/confirmation-dialog";
import { useToast } from "@/presentation/hooks/use-toast";
import { AuthError, AuthErrorCodes } from "@/domain/entities/error.entity";

function Home() {
  const { logout, currentUser } = useAuth();

  const router = useRouter();
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
      if (error instanceof AuthError) {
        switch (error.code) {
          case AuthErrorCodes.NETWORK_ERROR:
            toast({
              variant: "destructive",
              title: "Network Error",
              description: "Please check your internet connection and try again.",
            });
            break;
          case AuthErrorCodes.TOKEN_ERROR:
            toast({
              variant: "destructive",
              title: "Session Expired",
              description: "Your session has expired. Please login again.",
            });
            router.push("/login");
            break;
          case AuthErrorCodes.SERVER_ERROR:
            toast({
              variant: "destructive",
              title: "Server Error",
              description: "Something went wrong on our end. Please try again later.",
            });
            break;
          case AuthErrorCodes.FIREBASE_ERROR:
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: error.message,
            });
            break;
          default:
            toast({
              variant: "destructive",
              title: "Error",
              description: "An unexpected error occurred. Please try again.",
            });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoggingOut(false);
      setIsLogoutDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Xomly Admin Dashboard</h1>
          {currentUser?.displayName && <p className="text-sm text-gray-500">Welcome, {currentUser.displayName}</p>}
        </div>
        <Button variant="outline" onClick={() => setIsLogoutDialogOpen(true)} disabled={isLoggingOut}>
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Xomly Admin</CardTitle>
          <CardDescription>Manage incidents and keep the community informed.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the main dashboard for the Xomly web admin. You can use the buttons below to get started.</p>
          <Button className="mr-4">Create New Incident</Button>
          <Button variant="outline">View All Incidents</Button>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        description="Are you sure you want to logout? You will need to login again to access the dashboard."
        confirmText="Logout"
        cancelText="Cancel"
      />
    </div>
  );
}

export default Home;
