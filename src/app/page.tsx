'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        const res = await fetch('/api/diary');
        const data = await res.json();
        setEntries(data);
      } catch (error) {
        console.error('日記取得エラー:', error);
      }
    };
    fetchDiaries();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('error:', error);
    }
  };


  if (loading) return <div>Loading...</div>;
  if (!user) return <div>ログインが必要です。</div>;

  return (
    <div>
      {/* ヘッダー */}
      <header className="header">
        <div className="profile-icon"></div>
        <span>Famotto</span>
      </header>

      {/* 日記部分 */}
      <main className="diary-card">
        {/* 日記APIから取得した日記一覧をここに表示
        {entries.length > 0 ? (
          entries.map((entry) => (
            <div key={entry.id} style={{ borderBottom: "1px solid #ccc", marginBottom: "16px" }}>
              <p>{entry.date}</p>
              <p>{entry.text}</p>
              {entry.imageUrl && (
                <img src={entry.imageUrl} alt="日記画像" style={{ width: "100%", borderRadius: "8px" }} />
              )}
              {entry.videoUrl && (
                <video controls style={{ width: "100%", borderRadius: "8px" }}>
                  <source src={entry.videoUrl} type="video/mp4" />
                </video>
              )}
            </div>
          ))
        ) : ( */}
          <p>日記がまだありません。</p>
        
        {/* )} */}
      </main>

      {/* フッター */}
      <footer className="footer">
        <Link href="/1">日記追加 </Link>
        <Link href="/2">今日のお題 </Link>
        <Link href="/3">設定</Link>
      </footer>

    </div>
  );
}
