'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/firebase'; 
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

// --- 型定義 ---
interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  uid: string;
  mediaUrl?: string;
  timestamp: { toDate: () => Date }; // Firestore Timestampの簡易的な型
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


// --- メインコンポーネント ---
export default function MenuPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // 認証チェック
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  // 日記データ取得
  useEffect(() => {
    if (user) {
      const fetchDiaries = async () => {
        setDataLoading(true);
        // 新しいもの順に全件取得
        const q = query(collection(db, 'diary'), orderBy('timestamp', 'desc'));
  
        try {
          const querySnapshot = await getDocs(q);
          const fetchedDiaries: DiaryEntry[] = [];
  
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedDiaries.push({
              id: doc.id,
              title: data.title,
              content: data.content,
              uid: data.uid,
              mediaUrl: data.mediaUrl,
              timestamp: data.timestamp,
            } as DiaryEntry);
          });
  
          setDiaries(fetchedDiaries);
        } catch (error) {
          console.error("日記の取得中にエラーが発生しました:", error);
        } finally {
          setDataLoading(false);
        }
      };
  
      fetchDiaries();
    }
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

  // ロード中の表示
  if (loading || (user && dataLoading)) {
    return <div>ロード中...</div>;
  }
  
  return (
    <div>
        <div>
            {/* ヘッダー: CSSクラス 'header' を使用 */}
            <header className="header">
                <div className="profile-icon">
                    <Image
                        src="/icon.jpg"
                        alt="プロフィール"
                        width={40}
                        height={40}
                        style={{ borderRadius: '50%' }}
                    />
                </div>
                {/* CSSクラス 'header a' を使用 */}
                <a href='./..'>
                    <span>Famotto</span>
                </a>
            </header>

            {/* メインコンテンツ: CSSクラス 'diary-card' を使用 */}
            <main className="diary-card">
                <h1 style={{ fontSize: '1.8em', marginBottom: '10px' }}>みんなの投稿 📝</h1>
                
                {diaries.length === 0 && (
                    <p style={{ textAlign: 'center' }}>まだ日記が投稿されていません。</p>
                )}

                {diaries.map((diary) => (
                    // .diary-card > div にスタイルが適用される
                    <div key={diary.id}>
                        
                        {/* Card Header (投稿者/アイコン) */}
                        <div className="card-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <img src="/emoji.png" alt="ユーザーアイコン" className="icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                            <span className="username" style={{ fontWeight: 'bold', color: '#1da1f2' }}>
                                @{diary.uid.substring(0, 8)}...
                            </span>
                        </div>

                        {/* Card Content (タイトル/本文/メディア) */}
                        <div className="card-content">
                            <h3 style={{ fontSize: '1.1em', margin: '5px 0' }}>{diary.title}</h3>
                            <p>{diary.content}</p>
                            
                            {diary.mediaUrl && (
                              <div style={{ margin: '15px 0' }}>
                                <MediaRenderer mediaUrl={diary.mediaUrl} />
                              </div>
                            )}
                        </div>

                        {/* Card Footer (日時/アクションボタン) */}
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
            
            {/* フッター: CSSクラス 'footer' を使用 */}
            <footer className="footer">
                {/* CSSクラス 'footer a' を使用 */}
                <a href="./diary">
                    <Image src="/add.png" alt="日記追加" width={40} height={40} />
                    <span>日記追加</span>
                </a>
                <a href="./theme">
                    <Image src="/theme.png" alt="今日のお題" width={40} height={40} />
                    <span>今日のお題</span>
                </a>
                <a href="./menu">
                    <Image src="/menu.png" alt="日記確認" width={40} height={40} />
                    <span>日記確認</span>
                </a>
            </footer>

        </div>
    </div>
  );
}