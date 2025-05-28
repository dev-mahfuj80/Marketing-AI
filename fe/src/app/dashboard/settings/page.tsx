import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountTab from "./_components/account";
import FacebookTab from "./_components/facebook";
import LinkedinTab from "./_components/linkedin";

export default function SettingsPage() {
  // Type-safe selectors

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and social media connections.
        </p>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">Account</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <AccountTab />
        </TabsContent>

        {/* LinkedIn Tab */}
        <TabsContent value="linkedin" className="space-y-4">
          <LinkedinTab />
        </TabsContent>

        {/* Facebook Tab */}
        <TabsContent value="facebook" className="space-y-4">
          <FacebookTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
