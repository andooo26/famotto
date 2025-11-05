'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

  // 共有ボタン処理 https://developer.mozilla.org/ja/docs/Web/API/Navigator/share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Famotto',
        text: 'Famotto',
        url: window.location.href,//現在のページURL
      });
    } else {
      alert('このブラウザは共有機能に対応していません');
    }
  };


  return (
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
        <span>Famotto</span>
      </header>

      {/* 日記部分 */}
      <main className="diary-card">
        
        <p>日記がまだありません。</p>
        {/* )} */}

        {/* 表示確認用 */}
        <div className="card">
          <div className="card-header">
            <img src="/emoji.png" alt="" className="icon" />
            <span className="username">たろう</span>
          </div>

          <div className="card-content">
            <p>ここにテキストや画像・動画が入ります。</p>
          </div>

          <div className="card-footer">
            <a href="tel:09012345678" className="btn-icon">📞</a>
            <button onClick={handleShare} className="btn-icon">🔗</button>
          </div>
        </div>

      </main>

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
  );
}
