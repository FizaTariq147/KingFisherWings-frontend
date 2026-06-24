import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex w-2/5 flex-col justify-center items-center bg-[var(--color-primary-900)] text-white p-12">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold mb-6">
          FG
        </div>
        <h1 className="text-2xl font-bold mb-2">Fresa Gold</h1>
        <p className="text-white/60 text-center text-sm">
          Freight Management Software for growing logistics teams
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-[var(--color-neutral-50)] p-8">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-[var(--color-neutral-200)] p-8">
          <h2 className="text-xl font-semibold text-[var(--color-neutral-800)] mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-[var(--color-neutral-400)] mb-6">
            Sign in to your account
          </p>

          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="text-right">
              <a href="#" className="text-xs text-[var(--color-primary-500)] hover:underline">
                Forgot password?
              </a>
            </div>

            <Button className="w-full" size="lg">
              Sign In
            </Button>
          </div>

          <p className="text-center text-xs text-[var(--color-neutral-400)] mt-6">
            Powered by Fresa Gold
          </p>
        </div>
      </div>
    </div>
  );
}