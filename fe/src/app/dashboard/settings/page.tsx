"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Edit2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("accounts");

  // Type-safe selectors
  const user = useAuthStore((state) => state.user);
  console.log(user);

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and social media connections.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">Account</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <p className="text-muted-foreground text-sm mt-1 mb-4">
                  Update your account information and preferences
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium text-sm">Email Address</h3>
                      </div>
                      <p className="text-muted-foreground font-semibold text-sm flex items-center gap-1">
                        {user?.email || "Loading..."}
                        <span className="text-xs text-muted-foreground italic font-light">
                          (Can&apos;t be changed)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium text-sm">Full Name</h3>
                      </div>
                      <p className="text-foreground text-sm">
                        {user?.name || "Loading..."}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 cursor-pointer"
                      onClick={() => {
                        console.log("Edit");
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* LinkedIn Tab */}
        <TabsContent value="linkedin" className="space-y-4">
          <div>LinkedIn Permissions</div>
          <div>LinkedIn Posts</div>
          <div>LinkedIn Analytics</div>
          <div>LinkedIn Settings</div>
          <div>LinkedIn Help</div>
        </TabsContent>

        {/* Facebook Tab */}
        <TabsContent value="facebook" className="space-y-4">
          <div>Facebook Permissions</div>
          <div>Facebook Posts</div>
          <div>Facebook Analytics</div>
          <div>Facebook Settings</div>
          <div>Facebook Help</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
