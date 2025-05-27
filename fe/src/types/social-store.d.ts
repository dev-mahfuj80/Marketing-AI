// facebook post interface need to export and user in store
export interface FacebookPost {
  id: string;
  created_time: string;
  message: string;
  attachments: {
    data: {
      media: {
        image: {
          height: number;
          src: string;
          width: number;
        };
      };
      target: {
        id: string;
        url: string;
      };
      title: string;
      type: string;
      url: string;
    }[];
  };
  permalink_url: string;
  full_picture: string;
  picture: string;
}

// linkedin post interface need to export and user in store
export interface LinkedInPost {
  owner: string;
  activity: string;
  edited: boolean;
  created: {
    actor: string;
    time: number;
  };
  text: {
    annotations: unknown[];
    text: string;
  };
  lastModified: {
    actor: string;
    time: number;
  };
  id: string;
  distribution?: {
    linkedInDistributionTarget: {
      visibleToGuest: boolean;
    };
  };
  content?: {
    contentEntities: Array<{
      description: string;
      entityLocation?: string;
      thumbnails?: Array<{
        imageSpecificContent: {
          width: number;
          height: number;
        };
        resolvedUrl: string;
      }>;
      entity: string;
    }>;
    description?: string;
    shareMediaCategory?: string;
  };
}

// social state interface need to export and user in store
export interface SocialState {
  loading: boolean;
  error: string | null;
  facebookPosts: FacebookPost[];
  linkedinPosts: LinkedInPost[];
  connectionStatus: {
    facebook: boolean;
    linkedin: boolean;
  };
  linkedinProfile: {
    id?: string;
    name?: string;
    email?: string;
    profileImage?: string;
    // Add other profile fields as needed
  };
  facebookProfile: {
    id?: string;
    name?: string;
    email?: string;
    picture?: {
      data?: {
        url?: string;
      };
    };
    // Add other profile fields as needed
  };

  // functions
  getFacebookPosts: (
    pageId: string,
    start: number,
    count: number
  ) => Promise<void>;
  getLinkedInPosts: (start: number, count: number) => Promise<void>;
  getFacebookProfile: (pageId: string) => Promise<void>;
  getLinkedInProfile: (pageId: string) => Promise<void>;
}
