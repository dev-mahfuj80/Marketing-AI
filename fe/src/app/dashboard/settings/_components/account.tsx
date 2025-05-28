"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/store/auth-store";
import { PencilIcon } from "lucide-react";
import Link from "next/link";

export default function AccountTab() {
  const user = useAuthStore((state) => state.user);

  // Format date to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Truncate long strings like tokens
  const truncateString = (str: string, maxLength = 20) => {
    if (!str) return "N/A";
    if (str.length <= maxLength) return str;
    return `${str.substring(0, maxLength)}...`;
  };

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Account Profile
              </h2>
              <Link href="/dashboard/settings/update-user">
                <Button variant="outline" className="cursor-pointer">
                  <PencilIcon className="h-4 w-4" /> Edit
                </Button>
              </Link>
            </div>
            <div>
              <Badge variant="outline" className="mt-2 sm:mt-0">
                {user?.role || "USER"}
              </Badge>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Personal Information
                </h3>
                <div className="mt-2 space-y-3">
                  <div>
                    <span className="font-medium">Username:</span>
                    <span className="ml-2">{user?.name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{user?.email || "N/A"}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Can&apos;t be changed)
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Email Verified:</span>
                    <span className="ml-2">
                      {user?.emailVerified ? (
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        >
                          Verified
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                        >
                          Not Verified
                        </Badge>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Account Details
                </h3>
                <div className="mt-2 space-y-3">
                  <div>
                    <span className="font-medium">Organizations:</span>
                    <span className="ml-2">
                      {user?.organizations?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">{formatDate(user?.createdAt)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>
                    <span className="ml-2">{formatDate(user?.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Connected Accounts
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-3 border rounded-md bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Facebook</span>
                  {user?.facebookToken ? (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Not Connected
                    </Badge>
                  )}
                </div>
                {user?.facebookToken && (
                  <p className="mt-1 text-xs text-muted-foreground overflow-hidden text-ellipsis">
                    Token: {truncateString(user.facebookToken, 30)}
                  </p>
                )}
              </div>

              <div className="p-3 border rounded-md bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="font-medium">LinkedIn</span>
                  {user?.linkedInAccessToken ? (
                    <Badge className="bg-blue-700 text-white dark:bg-blue-900 dark:text-blue-100">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Not Connected
                    </Badge>
                  )}
                </div>
                {user?.linkedInAccessToken && (
                  <p className="mt-1 text-xs text-muted-foreground overflow-hidden text-ellipsis">
                    Token: {truncateString(user.linkedInAccessToken, 30)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Organizations Card */}
      {user?.organizations && user.organizations.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight ">
                  Organizations
                </h2>
                <Link href="/dashboard/settings/update-user">
                  <Button variant="outline" className="cursor-pointer">
                    <PencilIcon className="h-4 w-4" /> Edit
                  </Button>
                </Link>
              </div>
              <Badge variant="outline">Organization</Badge>
            </div>
            <Separator className="mb-6" />

            <div className="space-y-8">
              {user.organizations.map((org) => (
                <div key={org.id} className="border rounded-lg p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h3 className="text-xl font-semibold">{org.name}</h3>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <Badge variant="outline">{org.category}</Badge>
                      <Badge variant="outline">{org.size}</Badge>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Website
                      </p>
                      <p className="mt-1">
                        {org.website ? (
                          <a
                            href={org.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {org.website}
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Location
                      </p>
                      <p className="mt-1">{org.location || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Established
                      </p>
                      <p className="mt-1">{org.established || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Employees
                      </p>
                      <p className="mt-1">{org.employees || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Revenue
                      </p>
                      <p className="mt-1">
                        {org.revenue ? `$${org.revenue}` : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Market Area
                      </p>
                      <p className="mt-1">{org.marketArea || "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Description
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {org.description || "No description available"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
