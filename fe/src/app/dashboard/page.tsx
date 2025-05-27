import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Linkedin, Facebook } from "lucide-react";
import { FacebookPostsContainer } from "@/components/posts/facebook-posts-container";
import { LinkedInPostsContainer } from "@/components/posts/linkedin-posts-container";

export default function DashboardPage() {
  console.log("DashboardPage");
  return (
    <div className="space-y-8">
      <Tabs defaultValue="facebook">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-8">
          <TabsTrigger value="facebook" className="flex items-center gap-2">
            <Facebook className="h-4 w-4" />
            Facebook
          </TabsTrigger>

          <TabsTrigger value="linkedin" className="flex items-center gap-2">
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </TabsTrigger>
        </TabsList>

        <TabsContent value={"facebook"}>
          <FacebookPostsContainer />
        </TabsContent>

        <TabsContent value={"linkedin"}>
          <LinkedInPostsContainer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
