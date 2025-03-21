import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Home() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Xomly Admin</CardTitle>
          <CardDescription>
            Manage incidents and keep the community informed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This is the main dashboard for the Xomly web admin. You can use the
            buttons below to get started.
          </p>
          <Button className="mr-4">Create New Incident</Button>
          <Button variant="outline">View All Incidents</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Home;
