'use client';

import { Suspense } from 'react';
import { Logo } from '@/components/logo';
import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {/* ✅ Wrap LoginForm in Suspense */}
        <Suspense fallback={<div>Loading login form...</div>}>
          <LoginForm />
        </Suspense>
        
      </div>
    </div>
  );
}
