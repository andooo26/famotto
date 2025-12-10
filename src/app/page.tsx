'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  uid: string;
  mediaUrl?: string;
  timestamp: { toDate: () => Date }; // Firestore Timestampの簡易的な型
  userName?: string;
  userIconUrl?: string;
}
// --- ヘルパーコンポーネント: メディア表示 ---
const MediaRenderer: React.FC<{ mediaUrl: string }> = ({ mediaUrl }) => {
  if (!mediaUrl) return null;

  // URLの拡張子を見て、メディアの種類を判定
  if (/\.(jpe?g|png|gif|webp)/i.test(mediaUrl)) {
    return <img src={mediaUrl} alt="添付画像" style={{ objectFit: 'contain' }} />;
  }

  if (/\.(mp4|mov|webm)/i.test(mediaUrl)) {
    return <video src={mediaUrl} controls />;
  }

  return null;
};

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // --- Hooksは必ずここで全て呼ぶ ---
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // 認証チェック
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  // 日記取得
  useEffect(() => {
    if (!user) return;

    const fetchDiaries = async () => {
      setDataLoading(true);

      try {
        //users を取得して userMap を作る
        const usersSnap = await getDocs(collection(db, "users"));
        const userMap: Record<string, { name: string; iconUrl: string }> = {};

        usersSnap.forEach((u) => {
          const data = u.data() as any;
          userMap[u.id] = {
            name: data.name || "不明なユーザー",
            iconUrl: data.iconUrl || "/emoji.png" // なければデフォルト画像
          };
        });

        //diary を取得する
        const q = query(collection(db, "diary"), orderBy("timestamp", "desc"));
        const diarySnap = await getDocs(q);

        const fetchedDiaries: DiaryEntry[] = diarySnap.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          const userData = userMap[data.uid] || {
            name: "不明なユーザー",
            iconUrl: "/emoji.png",
          };

          return {
            id: docSnap.id,
            title: data.title,
            content: data.content,
            uid: data.uid,
            mediaUrl: data.mediaUrl,
            timestamp: data.timestamp,
            userName: userData.name,
            userIconUrl: userData.iconUrl,
          };
        });

        setDiaries(fetchedDiaries);

      } catch (error) {
        console.error(error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDiaries();
  }, [user]);

  // 共有ボタン処理
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Famotto',
        text: 'Famotto',
        url: window.location.href,
      });
    } else {
      alert('このブラウザは共有機能に対応していません');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error(error);
    }
  };

  // 条件分岐はここで行う 
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>ログインが必要です。</div>;
  if (dataLoading) return <div>ロード中...</div>;




  return (
    <div>
      {/* ヘッダー */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="profile-icon">
            <Image
              src="/icon.jpg"
              alt="プロフィール"
              width={40}
              height={40}
              style={{ borderRadius: '50%' }}
            />
          </div>
          <span>Famotto</span>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            background: 'none',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#333',
          }}
        >
          ログアウト
        </button>
      </header>

      {/* 日記部分 */}
      <main className="diary-card">
        <h1 style={{ fontSize: '1.8em', marginBottom: '10px' }}>みんなの投稿 📝</h1>

        {diaries.length === 0 && (
          <p style={{ textAlign: 'center' }}>まだ日記が投稿されていません。</p>
        )}

        {diaries.map((diary) => (

          <div key={diary.id}>

            {/* 投稿者/アイコン */}
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img
                src={diary.userIconUrl}
                alt={diary.userName}
                className="icon"
                style={{ width: '24px', height: '24px', marginRight: '8px', borderRadius: '50%' }}
              />
              <span className="username" style={{ fontWeight: 'bold', color: '#1da1f2' }}>
                {diary.userName}
              </span>
            </div>

            {/* タイトル/本文/メディア*/}
            <div className="card-content">
              <h3 style={{ fontSize: '1.1em', margin: '5px 0' }}>{diary.title}</h3>
              <p>{diary.content}</p>

              {diary.mediaUrl && (
                <div style={{ margin: '15px 0' }}>
                  <MediaRenderer mediaUrl={diary.mediaUrl} />
                </div>
              )}
            </div>

            {/* 日時/アクションボタン */}
            <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              <p style={{ fontSize: '0.8em', color: '#657786' }}>
                投稿日時: {diary.timestamp.toDate().toLocaleString()}
              </p>
              <div>
                <a href={`tel:${diary.uid}`} className="btn-icon" style={{ textDecoration: 'none', fontSize: '1.2em', marginRight: '10px' }}>📞</a>
                <button onClick={handleShare} className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}>🔗</button>
              </div>
            </div>
          </div>
        ))}
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
