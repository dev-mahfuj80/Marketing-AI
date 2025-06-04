"use client";
import { useSocialStore } from "@/lib/store/social-store";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  Check,
  Globe,
  MapPin,
  AlertTriangle,
  Building2,
  Users,
} from "lucide-react";
import Image from "next/image";

// Define interfaces for the LinkedIn profile data structure
interface LinkedInLocation {
  locationType?: string;
  description?: { localized?: { en_US?: string } };
  address?: {
    country?: string;
    city?: string;
    line1?: string;
    postalCode?: string;
  };
  localizedDescription?: string;
}

interface OrganizationDetails {
  vanityName?: string;
  localizedName?: string;
  website?: { localized?: { en_US?: string } };
  foundedOn?: { year?: number };
  description?: { localized?: { en_US?: string } };
  name?: { localized?: { en_US?: string } };
  versionTag?: string;
  coverPhotoV2?: { cropped?: string; original?: string };
  organizationType?: string;
  staffCountRange?: string;
  localizedSpecialties?: string[];
  localizedDescription?: string;
  localizedWebsite?: string;
  locations?: LinkedInLocation[];
  logoV2?: { cropped?: string; original?: string };
  id?: number;
  $URN?: string;
}

interface Organization {
  roleAssignee?: string;
  state?: string;
  role?: string;
  organization?: string;
  details?: OrganizationDetails;
}

interface LinkedInTokenInfo {
  valid?: boolean;
  userId?: string;
  validatedAt?: string;
}

interface LinkedInProfile {
  connected?: boolean;
  credentialsValid?: boolean;
  lastChecked?: string;
  profileInfo?: {
    id?: string;
    name?: string;
    profilePicture?: string;
  };
  tokenInfo?: LinkedInTokenInfo;
  accessibleOrganizations?: Organization[];
}

export default function LinkedinTab() {
  const linkedinProfile = useSocialStore(
    (state) => state.linkedinProfile
  ) as LinkedInProfile;
  const getLinkedInProfileStatus = useSocialStore(
    (state) => state.getLinkedInProfileStatus
  );

  useEffect(() => {
    getLinkedInProfileStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format date for better display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleString();
  };

  // Check if profile exists and is connected
  const isConnected = linkedinProfile?.connected;
  const isValid = linkedinProfile?.credentialsValid;
  const lastChecked = linkedinProfile?.lastChecked;

  // LinkedIn profile connection status and validity check
  // All organization data is accessed directly through linkedinProfile.accessibleOrganizations

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              LinkedIn Connection
            </CardTitle>
            {isConnected ? (
              <Badge className="bg-green-500 hover:bg-green-600">
                <Check className="w-4 h-4 mr-1" /> Connected
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="w-4 h-4 mr-1" /> Not Connected
              </Badge>
            )}
          </div>
          <CardDescription>
            Last checked: {formatDate(lastChecked)}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Profile Section */}
          {linkedinProfile?.profileInfo && (
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-blue-100 dark:border-blue-900">
                <div className="h-full w-full relative">
                  {linkedinProfile.profileInfo.profilePicture ? (
                    <Image
                      src={linkedinProfile.profileInfo.profilePicture}
                      alt={
                        linkedinProfile.profileInfo.name || "Profile Picture"
                      }
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
                      <Building2 className="h-8 w-8 text-blue-500" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-xl">
                  {linkedinProfile.profileInfo.name || "--"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  ID: {linkedinProfile.profileInfo.id || "--"}
                </p>
                {linkedinProfile.tokenInfo && (
                  <div className="flex items-center mt-1">
                    <Badge
                      variant={
                        linkedinProfile.tokenInfo.valid
                          ? "outline"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {linkedinProfile.tokenInfo.valid
                        ? "Token Valid"
                        : "Token Invalid"}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">
                      Validated:{" "}
                      {formatDate(linkedinProfile.tokenInfo.validatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Token & Organizations Section */}
          <Tabs defaultValue="organizations" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
              <TabsTrigger value="details">Connection Details</TabsTrigger>
            </TabsList>

            <TabsContent value="organizations" className="space-y-4 mt-4">
              {linkedinProfile?.accessibleOrganizations && linkedinProfile.accessibleOrganizations.length > 0 ? (
                linkedinProfile.accessibleOrganizations.map(
                  (org: Organization, index: number) => (
                    <Card key={index} className="overflow-hidden">
                      {/* Organization Header */}
                      <div className="relative">
                        {/* Cover Photo - if available */}
                        {org.details?.coverPhotoV2?.cropped && (
                          <div className="h-20 w-full bg-blue-100 dark:bg-blue-900">
                            {/* LinkedIn image URLs won't work here due to protection, using a placeholder */}
                            <div className="h-full w-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
                          </div>
                        )}

                        {/* Organization Logo */}
                        <div className="absolute bottom-0 left-4 transform translate-y-1/2">
                          <div className="bg-white dark:bg-gray-900 h-16 w-16 rounded-md flex items-center justify-center border-2 border-gray-200 dark:border-gray-800">
                            {org.details?.logoV2?.cropped ? (
                              <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900 rounded flex items-center justify-center">
                                <Building2 className="h-8 w-8 text-blue-500" />
                              </div>
                            ) : (
                              <Building2 className="h-8 w-8 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Organization Content */}
                      <CardContent className="pt-10 pb-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {org.details?.localizedName ||
                                  org.details?.name?.localized?.en_US ||
                                  "Organization"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {org.role || "Member"}
                              </p>
                            </div>
                            <Badge>{org.state || "--"}</Badge>
                          </div>

                          {/* Organization Details */}
                          {org.details && (
                            <div className="space-y-3 mt-3">
                              {/* Description */}
                              {org.details.localizedDescription && (
                                <p className="text-sm">
                                  {org.details.localizedDescription}
                                </p>
                              )}

                              {/* Location & Website */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {org.details.localizedWebsite && (
                                  <div className="flex items-center text-sm space-x-2">
                                    <Globe className="h-4 w-4 text-blue-500" />
                                    <a
                                      href={org.details.localizedWebsite}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline"
                                    >
                                      {org.details.localizedWebsite}
                                    </a>
                                  </div>
                                )}

                                {org.details.foundedOn?.year && (
                                  <div className="flex items-center text-sm space-x-2">
                                    <CalendarDays className="h-4 w-4 text-blue-500" />
                                    <span>
                                      Founded in {org.details.foundedOn.year}
                                    </span>
                                  </div>
                                )}

                                {org.details.locations?.[0]?.address && (
                                  <div className="flex items-center text-sm space-x-2">
                                    <MapPin className="h-4 w-4 text-blue-500" />
                                    <span>
                                      {[
                                        org.details.locations[0].address.line1,
                                        org.details.locations[0].address.city,
                                        org.details.locations[0].address
                                          .country,
                                      ]
                                        .filter(Boolean)
                                        .join(", ")}
                                    </span>
                                  </div>
                                )}

                                {org.details.staffCountRange && (
                                  <div className="flex items-center text-sm space-x-2">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    <span>
                                      {org.details.staffCountRange
                                        .replace("SIZE_", "")
                                        .replace("_", "-")
                                        .toLowerCase()}{" "}
                                      employees
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Specialties / Tags */}
                              {org.details?.localizedSpecialties && org.details.localizedSpecialties.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-2">
                                  {org.details.localizedSpecialties.map(
                                    (specialty: string, idx: number) => (
                                      <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {specialty}
                                      </Badge>
                                    )
                                  )}
                                  {org.details.localizedSpecialties.length > 8 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      +
                                      {org.details.localizedSpecialties.length - 8}{' '}
                                      more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )
              ) : (
                <div className="text-center py-6">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <h3 className="font-medium">No Organizations Available</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You don&apos;t have any accessible LinkedIn organizations
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Connection Status</span>
                    <span
                      className={
                        isConnected ? "text-green-500" : "text-red-500"
                      }
                    >
                      {isConnected ? "Connected" : "Not Connected"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Token Validity</span>
                    <span
                      className={isValid ? "text-green-500" : "text-red-500"}
                    >
                      {isValid ? "Valid" : "Invalid"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Last Checked</span>
                    <span>{formatDate(lastChecked)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">User ID</span>
                    <span className="text-sm font-mono">
                      {linkedinProfile?.profileInfo?.id || "--"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Token Validated At</span>
                    <span>
                      {formatDate(linkedinProfile?.tokenInfo?.validatedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Organizations</span>
                    <span>
                      {linkedinProfile?.accessibleOrganizations?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => getLinkedInProfileStatus()}
                  >
                    Refresh Status
                  </Button>
                  <Button>Reconnect LinkedIn</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
