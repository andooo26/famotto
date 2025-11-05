'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function DiaryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);
    return (
        <div>

            <div>
                {/* ヘッダー */}
                <header className="header">
                    <div className="profile-icon">
                        <Image
                            src="/icon.jpg" // プロフィール画像のパス
                            alt="プロフィール"
                            width={40}
                            height={40}
                            style={{ borderRadius: '50%' }}
                        />
                    </div>
                    <a href='./..'><span>Famotto</span></a>
                    
                </header>
                <main><h1>Diary Page</h1></main>
                {/* フッター */}
                <footer className="footer">
                    <a href="./diary"><Image src="/add.png" alt="" width={60} height={60} /><span>日記追加</span>
                    </a>
                    <a href="./theme"><Image src="/theme.png" alt="" width={60} height={60} /><span>今日のお題</span>
                    </a>
                    <a href="./menu"><Image src="/menu.png" alt="" width={60} height={60} /><span>日記確認</span>
                    </a>
                </footer>

            </div>
        </div>


    );
}