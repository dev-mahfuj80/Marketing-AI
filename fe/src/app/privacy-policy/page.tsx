"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-4">Last Updated: May 15, 2025</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          Welcome to Marketing AI. We respect your privacy and are committed to
          protecting your personal data. This Privacy Policy will inform you
          about how we look after your personal data when you visit our website
          and tell you about your privacy rights and how the law protects you.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Data We Collect</h2>
        <p>
          We may collect, use, store and transfer different kinds of personal
          data about you which we have grouped together as follows:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            <strong>Identity Data</strong> includes first name, last name,
            username or similar identifier.
          </li>
          <li>
            <strong>Contact Data</strong> includes email address and telephone
            numbers.
          </li>
          <li>
            <strong>Technical Data</strong> includes internet protocol (IP)
            address, your login data, browser type and version, time zone
            setting and location, browser plug-in types and versions, operating
            system and platform, and other technology on the devices you use to
            access this website.
          </li>
          <li>
            <strong>Profile Data</strong> includes your username and password,
            your interests, preferences, feedback and survey responses.
          </li>
          <li>
            <strong>Usage Data</strong> includes information about how you use
            our website, products and services.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          3. How We Use Your Data
        </h2>
        <p>
          We will only use your personal data when the law allows us to. Most
          commonly, we will use your personal data in the following
          circumstances:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>To register you as a new customer.</li>
          <li>To process and deliver your order.</li>
          <li>To manage our relationship with you.</li>
          <li>
            To improve our website, products/services, marketing or customer
            relationships.
          </li>
          <li>
            To recommend products or services which may be of interest to you.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          4. Social Login Data
        </h2>
        <p>
          If you choose to log in to our website using a social media account
          such as Facebook or LinkedIn, we will receive personal data from your
          social media account as permitted by your social media settings. This
          may include your name, email address, and profile picture.
        </p>
        <p>We use this information to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Create and manage your account on our platform</li>
          <li>Verify your identity when you log in</li>
          <li>Provide you with personalized services</li>
        </ul>
        <p>
          You can control what information is shared with us through your social
          media privacy settings.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Security</h2>
        <p>
          We have put in place appropriate security measures to prevent your
          personal data from being accidentally lost, used or accessed in an
          unauthorized way, altered or disclosed. In addition, we limit access
          to your personal data to those employees, agents, contractors and
          other third parties who have a business need to know.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Retention</h2>
        <p>
          We will only retain your personal data for as long as reasonably
          necessary to fulfill the purposes we collected it for, including for
          the purposes of satisfying any legal, regulatory, tax, accounting or
          reporting requirements.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          7. Your Legal Rights
        </h2>
        <p>
          Under certain circumstances, you have rights under data protection
          laws in relation to your personal data, including the right to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Request access to your personal data.</li>
          <li>Request correction of your personal data.</li>
          <li>Request erasure of your personal data.</li>
          <li>Object to processing of your personal data.</li>
          <li>Request restriction of processing your personal data.</li>
          <li>Request transfer of your personal data.</li>
          <li>Right to withdraw consent.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          8. Third-party Links
        </h2>
        <p>
          This website may include links to third-party websites, plug-ins and
          applications. Clicking on those links or enabling those connections
          may allow third parties to collect or share data about you. We do not
          control these third-party websites and are not responsible for their
          privacy statements.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          9. Changes to This Privacy Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on this page and
          updating the &quot;Last Updated&quot; date at the top of this Privacy
          Policy.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact
          us:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>By email: mahfujurrahman06627@gmail.com</li>
        </ul>
      </div>

      <div className="mt-12 border-t pt-8">
        <Link href="/">
          <Button>Back to Homepage</Button>
        </Link>
      </div>
    </div>
  );
}
