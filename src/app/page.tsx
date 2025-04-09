"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function Home() {
  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Xomly Admin</CardTitle>
          <CardDescription>Manage incidents and keep the community informed.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Select an option from the sidebar to get started.</p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

export default Home;
