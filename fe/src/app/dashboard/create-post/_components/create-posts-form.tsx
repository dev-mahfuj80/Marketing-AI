"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { langChainApi, postsApi } from "@/lib/api";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Facebook, Linkedin } from "lucide-react";
import { toast } from "sonner";

// Form schema using Zod
const formSchema = z.object({
  content: z.string().min(5, "Content must be at least 5 characters long"),
  publishToFacebook: z.boolean().default(false),
  publishToLinkedin: z.boolean().default(false),
  image: z.instanceof(File).optional(),
  schedulePost: z.boolean().default(false),
  scheduledTime: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreatePostsForm() {
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
    try {
      if (values.publishToFacebook || values.publishToLinkedin) {
        const formData = new FormData();

        // Append all form values
        formData.append("content", values.content);
        formData.append(
          "publishToFacebook",
          values.publishToFacebook.toString()
        );
        formData.append(
          "publishToLinkedin",
          values.publishToLinkedin.toString()
        );

        // Handle image upload if exists
        if (values.image) {
          formData.append("image", values.image);
        }

        // Handle scheduling
        if (values.schedulePost && values.scheduledTime) {
          formData.append("scheduledTime", values.scheduledTime);
        }
        console.log(formData);
        const response = await postsApi.createPost(formData);

        if (response.status === 200) {
          toast.success(
            values.schedulePost
              ? "Post scheduled successfully!"
              : "Post created successfully!"
          );
          form.reset();
        }
      } else {
        toast.error("Please select at least one platform to publish the post");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to create post");
      } else {
        console.error("Error:", error);
        toast.error("An error occurred while creating the post");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const [isGenerating, setIsGenerating] = useState(false);
  const handleGenerateAIContent = async () => {
    setIsGenerating(true);
    // Simulate AI content generation
    const response = await langChainApi.getLangChainResponse(
      form.getValues("content")
    );
    console.log(response);

    setTimeout(() => {
      setIsGenerating(false);
      form.setValue("content", response.data.content.kwargs.content);
    }, 2000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Content Field */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What's on your mind?"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {characterCount}/1000 characters
              </FormDescription>
              <FormMessage />
              {/* style Like button*/}
              <div
                className="flex items-center justify-end cursor-pointer"
                onClick={handleGenerateAIContent}
              >
                <p className="text-md rounded-lg border border-primary p-2 hover:bg-primary hover:text-black">
                  {isGenerating ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <p>Generating AI Content...</p>
                    </div>
                  ) : (
                    <p>Generate AI Content</p>
                  )}
                </p>
              </div>
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...field } }) => {
            return (
              <FormItem>
                <FormLabel>Image (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      onChange(e.target.files?.[0] || null);
                    }}
                    value={undefined}
                    {...field}
                  />
                </FormControl>
                {value && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Selected: {value.name} ({(value.size / 1024).toFixed(2)} KB)
                  </div>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Schedule Post Toggle */}
        <FormField
          control={form.control}
          name="schedulePost"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Schedule Post</FormLabel>
                <FormDescription>
                  Set a specific time to publish this post
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Scheduled Time Picker - Only show if schedulePost is true */}
        {form.watch("schedulePost") && (
          <FormField
            control={form.control}
            name="scheduledTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheduled Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Social Media Selection */}
        <div className="space-y-4">
          <FormLabel>Publish to:</FormLabel>
          <div className="flex space-x-4">
            <FormField
              control={form.control}
              name="publishToFacebook"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 flex items-center">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    Facebook
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="publishToLinkedin"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 flex items-center">
                    <Linkedin className="h-5 w-5 text-blue-500" />
                    LinkedIn
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {form.watch("schedulePost") ? "Scheduling..." : "Posting..."}
            </>
          ) : form.watch("schedulePost") ? (
            "Schedule Post"
          ) : (
            "Create Post"
          )}
        </Button>

        {/* Content Field */}
      </form>
    </Form>
  );
}
