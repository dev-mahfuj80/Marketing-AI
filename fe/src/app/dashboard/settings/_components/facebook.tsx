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
  //   {
  //     "message": "Facebook connection active",
  //     "profileInfo": {
  //         "id": "634956256369797",
  //         "name": "OxyManager",
  //         "picture": {
  //             "data": {
  //                 "height": 50,
  //                 "is_silhouette": false,
  //                 "url": "https://scontent.fdac31-1.fna.fbcdn.net/v/t39.30808-1/499399460_122108269622867226_3743395607781589791_n.jpg?stp=c33.0.194.194a_cp0_dst-jpg_s50x50_tt6&_nc_cat=105&ccb=1-7&_nc_sid=f907e8&_nc_eui2=AeGcy4LsiUAKYHRCbmMfSqwtOpoPaKQZPuQ6mg9opBk-5EiBZPs8rdCsBwmnCekjlm5TTuzjyBwwGqAzbiaFJdOM&_nc_ohc=uuLC5xCsvT4Q7kNvwHfBzj0&_nc_oc=AdmxDzv0vsXcHUsBwZHU0ComLBX-u1BO8-b7Kys2bghXN_UM6edaud2H4mdDjeIt8GM&_nc_zt=24&_nc_ht=scontent.fdac31-1.fna&edm=AJdBtusEAAAA&_nc_gid=PkhpG2SqKHI7qs30zQR9Dg&oh=00_AfIofaSyTAZl3A-6MDUgaxEaFbVCSlWRO7qWfrC0Gtaqkg&oe=68421947",
  //                 "width": 50
  //             }
  //         }
  //     }
  // }
  return (
    <div>
      <h2>Facebook Tab</h2>
      <p>{facebookProfile?.profileInfo?.name}</p>
      <p>{facebookProfile?.profileInfo?.id}</p>
      <img src={facebookProfile?.profileInfo?.profilePicture} alt="" />
    </div>
  );
}
