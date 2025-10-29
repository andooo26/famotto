'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/auth';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      router.push('/');
    } catch (err) {
      setError('ログインに失敗しました');
      console.error('error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <div>
          <h2>
            Famottoにログイン
          </h2>
        </div>
        <div>
          {error && (
            <div>
              {error}
            </div>
          )}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? 'ログイン中...' : 'Google でサインイン'}
          </button>
        </div>
      </div>
    </div>
  );
}
