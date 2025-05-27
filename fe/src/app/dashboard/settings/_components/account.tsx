"use client";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/auth-store";

export default function AccountTab() {
  const user = useAuthStore((state) => state.user);
  console.log(user);
  //   {
  //     "id": 1,
  //     "name": "Md Mahfujur Rahman",
  //     "email": "mahfujurrahman06627@gmail.com",
  //     "role": "USER",
  //     "emailVerified": false,
  //     "facebookToken": "EAAJhrB5quZCwBOwm7qkE4WGdmZBOboZARgf7Es4B96QkN4rYtgD1nvj9eOBHafNMXNZCSX1mCaGfGuj8EhezRUF2kXPJZCmcdtDRJsLIdUbgHxeNhzimUmZAynqYdL6ongsEPZBZAWxOITPGDTZCnmGERtb971scamxOwRdldUAciFZCFnjPeICKQiaUGVnSFvDrROGlQKlY7ffZABjrqQ4YZBvUUv1H",
  //     "linkedInAccessToken": "AQWsnwiSy5h8xT272rDZemd8ZG0qimiNVMWxPU-LrAZ2ZbEyYQ5OaPNgLLYHQE-sBBwQ_f3V4pSAUG1IBH6oHn7bVsElp6sOefR5q4qZ7n5qkWy-nxvxIQR7drPQDY-E5yUylNOtSjPlm_T8AUJd3VJo_OmEWrhzaVtyyBbqeEEtEhGkDPaAnGnLprj7lFMAsKxg-9iLnjGFuWZZVhBACuRfDU89p0PSisokPAhrXavkMJLbf7MsIO0otwsAD8CB88ygldmwL4HsqcaDqAiO5Tmv35Mce6HPdZvV7jUgTBmEp4DL3Yc0mPh9TOzpaBD4kezEahDBCugz1ifsrIuTKIrrW-1Qsw",
  //     "createdAt": "2025-05-19T04:58:48.776Z",
  //     "updatedAt": "2025-05-27T10:07:12.784Z",
  //     "organizations": [
  //         {
  //             "id": 1,
  //             "name": "OxyManager",
  //             "website": "https://oxymanager.com",
  //             "category": "Software",
  //             "location": "Bangladesh, Khulna, Kushtia",
  //             "description": "OxyManager is an all-in-one business management software designed to help small and medium-sized businesses streamline operations. It offers real-time inventory management to track stock levels and product movements efficiently. The platform automates sales tracking and financial reporting, providing clear insights into business performance. With its built-in CRM features, businesses can manage customer information and interactions effectively. OxyManager also includes integrated banking support to handle financial transactions securely. SMS marketing tools are available to help businesses engage with customers through promotional and informational messages. The software delivers advanced analytics and reporting features to support data-driven decision-making. It simplifies everyday tasks and reduces manual work, improving overall productivity. The user-friendly interface ensures that both technical and non-technical users can operate the system easily. Designed with the needs of Bangladeshi businesses in mind, OxyManager is a reliable solution for modern business growth.",
  //             "established": "2020",
  //             "size": "large",
  //             "employees": "10",
  //             "turnover": null,
  //             "revenue": "50000",
  //             "profit": null,
  //             "marketArea": "Bangladesh",
  //             "createdAt": "2025-05-26T16:12:58.661Z",
  //             "updatedAt": "2025-05-26T16:12:58.661Z"
  //         }
  //     ]
  // }
  // Put all those value in ui
  return (
    // need to seperate 2 section user and organaizatin information

    <Card>
      <div className="p-6 space-y-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-medium">Account</h2>
          <div className="flex items-center gap-2">
            <p>Username :</p>
            <p className="text-muted-foreground italic">{user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <p>Email :</p>
            <p className="text-muted-foreground italic">
              {user?.email}
              <span className="ml-2 text-xs italic">Can&apos;t be changed</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p>Role :</p>
            <p className="text-muted-foreground italic">{user?.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <p>Organizations :</p>
            <p className="text-muted-foreground italic">
              {user?.organizations?.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p>Created At :</p>
            <p className="text-muted-foreground italic">{user?.createdAt}</p>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-medium mb-4 grid gap-4 md:grid-cols-4">
            Organizations
          </h2>
          {user?.organizations?.map((organization) => (
            <div key={organization.id}>
              <p>{organization.name}</p>
              <p>{organization.website}</p>
              <p>{organization.category}</p>
              <p>{organization.location}</p>
              <p>{organization.description}</p>
              <p>{organization.established}</p>
              <p>{organization.size}</p>
              <p>{organization.employees}</p>
              <p>{organization.turnover}</p>
              <p>{organization.revenue}</p>
              <p>{organization.profit}</p>
              <p>{organization.marketArea}</p>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <p>Updated At :</p>
            <p className="text-muted-foreground italic">{user?.updatedAt}</p>
          </div>
          <div className="flex items-center gap-2">
            <p>Facebook Token :</p>
            <p className="text-muted-foreground italic">
              {user?.facebookToken}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p>Linkedin Token :</p>
            <p className="text-muted-foreground italic">
              {user?.linkedInAccessToken}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p>Email Verified :</p>
            <p className="text-muted-foreground italic">
              {user?.emailVerified ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
