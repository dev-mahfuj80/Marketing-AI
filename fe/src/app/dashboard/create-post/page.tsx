"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { postsApi } from "@/lib/api";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth-store";

// Form schema using Zod
const formSchema = z.object({
  content: z.string()
    .min(5, { message: "Post content must be at least 5 characters long" })
    .max(1000, { message: "Post content must be less than 1000 characters" }),
  image: z.instanceof(FileList).optional(),
  publishToFacebook: z.boolean().default(false),
  publishToLinkedin: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreatePostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  // Initialize react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      publishToFacebook: false,
      publishToLinkedin: false,
    },
  });

  // Character count display
  const content = form.watch("content");
  const characterCount = content?.length || 0;
  
  // Handle form submission
  async function onSubmit(values: FormValues) {
    // Reset status
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    
    // Validate form - at least one platform must be selected
    if (!values.publishToFacebook && !values.publishToLinkedin) {
      setError("Please select at least one platform to publish to");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Prepare form data for image upload
      const formData = new FormData();
      formData.append("content", values.content);
      formData.append("publishToFacebook", String(values.publishToFacebook));
      formData.append("publishToLinkedin", String(values.publishToLinkedin));
      
      // Append image file if provided
      if (values.image && values.image.length > 0) {
        formData.append("image", values.image[0]);
      }
      
      // Send to API
      const response = await postsApi.createPost(formData);
      
      setSuccess("Post created successfully!");
      
      // Reset form
      form.reset();
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || "Failed to create post");
      } else {
        setError("An error occurred while creating the post");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Post</h1>
        <p className="text-muted-foreground mt-1">
          Create and publish content to your social media accounts
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post Content</FormLabel>
                <FormControl>
                  <textarea 
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="What would you like to share today?"
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between">
                  <FormMessage />
                  <div className="text-xs text-muted-foreground">
                    {characterCount}/1000 characters
                  </div>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="image"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Image (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onChange(e.target.files)}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Upload an image to include with your post. Maximum size: 5MB
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-4 pt-4">
            <FormField
              control={form.control}
              name="publishToFacebook"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={!user?.facebookConnected}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormLabel className="text-base font-normal">
                    Publish to Facebook
                  </FormLabel>
                  {!user?.facebookConnected && (
                    <span className="text-xs text-red-500">
                      (Connect in Settings)
                    </span>
                  )}
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="publishToLinkedin"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={!user?.linkedinConnected}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormLabel className="text-base font-normal">
                    Publish to LinkedIn
                  </FormLabel>
                  {!user?.linkedinConnected && (
                    <span className="text-xs text-red-500">
                      (Connect in Settings)
                    </span>
                  )}
                </FormItem>
              )}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full md:w-auto" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
