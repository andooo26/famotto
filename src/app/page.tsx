'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
            ) : (
              <div>
                <p>ログインしていません</p>
                <button onClick={() => router.push('/login')}>
                  ログイン
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
