"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { postsApi } from "@/lib/api";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Form schema using Zod
const formSchema = z.object({
  content: z
    .string()
    .min(5, { message: "Post content must be at least 5 characters long" })
    .max(1000, { message: "Post content must be less than 1000 characters" }),
  image: z.instanceof(FileList).optional(),
  publishToFacebook: z.boolean().default(false),
  publishToLinkedin: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreatePostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    // Validate form - at least one platform must be selected
    if (!values.publishToFacebook && !values.publishToLinkedin) {
      toast.error("Please select at least one platform to publish to");
      setIsSubmitting(false);
      return;
    }

    try {
      const promises = [];
      let successCount = 0;

      // Handle post creation for each selected platform
      if (values.publishToFacebook) {
        try {
          // Get the actual image file if provided
          const imageFile =
            values.image && values.image.length > 0
              ? values.image[0]
              : undefined;

          // Send directly to Facebook API using the dedicated function with the image file
          const fbPromise = postsApi.createFacebookPost(
            values.content,
            imageFile
          );
          promises.push(fbPromise);
          await fbPromise;
          successCount++;
        } catch (fbError) {
          console.error("Error publishing to Facebook:", fbError);
        }
      }

      // Handle post creation for LinkedIn
      if (values.publishToLinkedin) {
        try {
          // Prepare image URL for LinkedIn if provided
          const imageUrl =
            values.image && values.image.length > 0
              ? URL.createObjectURL(values.image[0])
              : undefined;

          // Send directly to LinkedIn API using the dedicated function
          const liPromise = postsApi.createLinkedinPost(
            values.content,
            imageUrl
          );
          promises.push(liPromise);
          await liPromise;
          successCount++;
        } catch (liError) {
          console.error("Error publishing to LinkedIn:", liError);
        }
      }

      // Wait for all promises to complete
      await Promise.allSettled(promises);

      if (successCount > 0) {
        toast.success(
          `Post created successfully on ${successCount} platform${
            successCount > 1 ? "s" : ""
          }!`
        );
        form.reset();
      } else {
        toast.error("Failed to publish to any selected platforms.");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to create post");
      } else {
        toast.error("An error occurred while creating the post");
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    // We don't spread the field props because FileList can't be used as a value
                    // Instead we handle the onChange manually
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      field.onChange(e.target.files);
                    }}
                    // Don't include value prop for file inputs
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
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
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      aria-checked={field.value}
                      aria-label="Publish to Facebook"
                    />
                  </FormControl>
                  <FormLabel className="text-base font-normal">
                    Publish to Facebook
                  </FormLabel>
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
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      aria-checked={field.value}
                      aria-label="Publish to LinkedIn"
                    />
                  </FormControl>
                  <FormLabel className="text-base font-normal">
                    Publish to LinkedIn
                  </FormLabel>
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
