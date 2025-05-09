import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login | Marketing AI Dashboard',
  description: 'Login to your Marketing AI Dashboard account',
};

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-card p-8 shadow-md rounded-lg border border-border">
        <LoginForm />
      </div>
    </div>
  );
}
