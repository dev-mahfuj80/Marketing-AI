"use client";
import { useSocialStore } from "@/lib/store/social-store";
import { useEffect } from "react";

// Settings connection Status token validity check and also I wanna keep the page name id and also some stats here in facebook date token expired or not date
export default function LinkedinTab() {
  const linkedinProfile = useSocialStore((state) => state.linkedinProfile);
  const getLinkedInProfileStatus = useSocialStore(
    (state) => state.getLinkedInProfileStatus
  );

  useEffect(() => {
    getLinkedInProfileStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log(linkedinProfile);

  //   {
  //     "connected": true,
  //     "credentialsValid": true,
  //     "profileInfo": {
  //         "id": "D1__ehL3bx",
  //         "name": "Mahfujur Rahman",
  //         "profilePicture": "https://media.licdn.com/dms/image/v2/D4E03AQExgAKgn7adUg/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1715157223392?e=1754524800&v=beta&t=zRDcb1EKshp6ynbT7jYCXo23vai6lqvoJGxkXtUZJ9M"
  //     }
  // }
  return (
    <div>
      <h2>Linkedin Tab</h2>
      <p>{linkedinProfile?.profileInfo?.name}</p>
      <p>{linkedinProfile?.profileInfo?.id}</p>
      <img src={linkedinProfile?.profileInfo?.profilePicture} alt="" />
      <p>{linkedinProfile?.profileInfo?.profilePicture}</p>
    </div>
  );
}
