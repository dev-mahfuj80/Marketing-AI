import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Register | Marketing AI Dashboard',
  description: 'Create a new Marketing AI Dashboard account',
};

export default function RegisterPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-card p-8 shadow-md rounded-lg border border-border">
        <RegisterForm />
      </div>
    </div>
  );
}
