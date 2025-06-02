"use client";
import { useSocialStore } from "@/lib/store/social-store";
import { useEffect } from "react";
// Settings connection Status token validity check and also I wanna keep the page name id and also some stats here in facebook date token expired or not date
export default function FacebookTab() {
  const facebookProfile = useSocialStore((state) => state.facebookProfile);
  const getFacebookProfileStatus = useSocialStore(
    (state) => state.getFacebookProfileStatus
  );

  useEffect(() => {
    getFacebookProfileStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log(facebookProfile);
  return (
    <div>
      <h2>Facebook Tab</h2>
      <p>{facebookProfile?.profileInfo?.name}</p>
      <p>{facebookProfile?.profileInfo?.id}</p>
      <img src={facebookProfile?.profileInfo?.profilePicture} alt="" />
    </div>
  );
}
