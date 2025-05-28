"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth-store";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { Calendar } from "lucide-react";

// Form schema using Zod
const formSchema = z.object({
  // Personal Info
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Please provide a valid email address" }),

  // Social Media Tokens
  facebookToken: z.string().optional(),
  linkedInAccessToken: z.string().optional(),

  // Organization Info
  organization: z
    .object({
      name: z.string().min(2, "Organization name is required"),
      website: z
        .string()
        .url("Please enter a valid URL")
        .optional()
        .or(z.literal("")),
      category: z.string().optional(),
      location: z.string().optional(),
      description: z.string().optional(),
      established: z.string().optional(),
      size: z.string().optional(),
      employees: z.string().optional(),
      revenue: z.string().optional(),
      marketArea: z.string().optional(),
    })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function UpdateUserForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const getCurrentUser = useAuthStore((state) => state.getCurrentUser);

  // Initialize react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      facebookToken: "",
      linkedInAccessToken: "",
      organization: {
        name: "",
        website: "",
        category: "",
        location: "",
        description: "",
        established: "",
        size: "",
        employees: "",
        revenue: "",
        marketArea: "",
      },
    },
  });

  // Update form values when user data is available
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        facebookToken: user.facebookToken || "",
        linkedInAccessToken: user.linkedInAccessToken || "",
        organization: user.organizations?.[0] || {},
      });
    }
  }, [user, form]);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    try {
      const response = await api.post("/api/auth/update-user", values);

      if (response.data.user) {
        toast.success("Profile updated successfully");
        // now call get user function so that user data update in store and reflect all over the ui
        await getCurrentUser();
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message || "Failed to update profile");
      } else {
        toast.error("An error occurred while updating your profile");
      }
      console.error("Update user error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Update Profile</h1>
        <p className="text-muted-foreground mt-1">
          Update your personal and organization information
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Social Media Integration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="facebookToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Token</FormLabel>
                    <FormControl>
                      <Input
                        type={field.value ? "password" : "text"}
                        placeholder={
                          field.value ? "••••••••••••" : "Not connected"
                        }
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkedInAccessToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Token</FormLabel>
                    <FormControl>
                      <Input
                        type={field.value ? "password" : "text"}
                        placeholder={
                          field.value ? "••••••••••••" : "Not connected"
                        }
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Organization Information Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Organization Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="organization.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your organization name"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organization.website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organization.category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Technology, Finance"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organization.location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City, Country"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organization.size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 50-100 employees"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organization.marketArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Area</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Global, North America"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Established Date */}
              <FormField
                control={form.control}
                name="organization.established"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Established Date</FormLabel>
                    <div className="relative">
                      <Input
                        type="date"
                        className="pl-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                      />
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Number of Employees */}
              <FormField
                control={form.control}
                name="organization.employees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Employees</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 50"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Annual Revenue */}
              <FormField
                control={form.control}
                name="organization.revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Revenue (USD)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-4 top-1.5 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g., 1000000"
                          className="pl-8"
                          {...field}
                          value={field.value || ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="organization.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about your organization..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
