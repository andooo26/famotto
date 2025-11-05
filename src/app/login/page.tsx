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
    } catch (err: any) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f7e5c3ff 0%, #f7e5c3ff 100%)',
        margin: 0,
        padding: 0
      }}
    >
      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          width: '100%',
          maxWidth: 420,
        }}
      >
        <h1 style={{ fontSize: '4rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)', margin: 0 }}>
          Famotto
        </h1>

        {error && <div>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            <img
              src="/signupwithgoogle.png"
              alt="Google でサインイン"
              style={{
                width: 200,
                height: 200,
                opacity: loading ? 0.5 : 1,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
