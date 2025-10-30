'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('error:', error);
    }
  };

  if (loading) {
    return (
      <div>
      </div>
    );
  }

  if (!loading && !user) {
    return (
      <div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          <div>
            <h1>Famotto</h1>
            
            {user ? (
              <div>
                <div>
                  <p>ログイン成功</p>
                  <p>ユーザー: {user.displayName || user.email}</p>
                </div>
                
                <button onClick={handleSignOut}>
                  ログアウト
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
} 
