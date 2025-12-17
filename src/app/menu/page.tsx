'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  uid: string;
  mediaUrl?: string;
  timestamp: { toDate: () => Date };
}

interface DiaryWithUser extends DiaryEntry {
  userName: string;
  userIconUrl: string;
}

// メディア表示コンポーネント
const MediaRenderer: React.FC<{ mediaUrl: string }> = ({ mediaUrl }) => {
  if (!mediaUrl) return null;

  if (/.(jpe?g|png|gif|webp)/i.test(mediaUrl)) {
    return <img src={mediaUrl} alt="添付画像" style={{ objectFit: 'contain', maxWidth: '100%' }} />;
  }

  if (/.(mp4|mov|webm)/i.test(mediaUrl)) {
    return <video src={mediaUrl} controls style={{ maxWidth: '100%' }} />;
  }

  return null;
};

// メインコンポーネント
export default function MenuPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [diaries, setDiaries] = useState<DiaryWithUser[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  //ユーザーリストと選択されたユーザー
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [userList, setUserList] = useState<{ uid: string; name: string }[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchDiariesWithUser = async () => {
      setDataLoading(true);
      try {

        //  ユーザー情報を一括取得 
        const usersSnap = await getDocs(collection(db, "users"));
        const userMap: Record<string, { name: string; iconUrl: string }> = {};

        const users = usersSnap.docs.map(u => {
          const data = u.data() as any;
          // アイコンURLがない場合
          const userInfo = { name: data.name || "不明なユーザ", iconUrl: data.iconUrl || "" };
          userMap[u.id] = userInfo;
          return { uid: u.id, name: userInfo.name };
        });
        setUserList(users);

        // 日記を一括取得 
        const q = query(collection(db, "diary"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        // ユーザー情報を結合
        const diariesWithUser: DiaryWithUser[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data() as DiaryEntry;
          
          // マップからユーザー情報を参照
          const userData = userMap[data.uid] || { name: "不明なユーザ", iconUrl: "" };

          return {
            ...data,
            id: docSnap.id,
            userName: userData.name,
            userIconUrl: userData.iconUrl,
          };
        });

        setDiaries(diariesWithUser);
      } catch (err) {
        console.error("日記取得失敗:", err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDiariesWithUser();
  }, [user]);

  // 共有機能
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

  if (loading || (user && dataLoading)) {
    return <div>ロード中...</div>;
  }

  // ユーザー選択による絞り込み
  const filteredDiaries =
    selectedUser === "all"
      ? diaries
      : diaries.filter((d) => d.uid === selectedUser);

  // JSXのレンダリング
  return (
    <div>
      <Header title="日記確認" />

      <main className="diary-card" style={{ padding: '10px' }}>

        {/* ユーザーで絞り込み */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ marginRight: "8px" }}>ユーザーで絞り込み：</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            style={{
              padding: "6px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          >
            <option value="all">全員</option>
            {userList.map((u) => (
              <option key={u.uid} value={u.uid}>{u.name}</option>
            ))}
          </select>
        </div>

        {filteredDiaries.length === 0 && (
          <p style={{ textAlign: 'center' }}>まだ日記が投稿されていません。</p>
        )}
        {/*日記リストの表示*/}
        {filteredDiaries.map((diary) => (
          <div key={diary.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img
                src={diary.userIconUrl}
                alt={diary.userName}
                style={{ width: 24, height: 24, marginRight: 8, borderRadius: '50%' }}
              />
              <span style={{ fontWeight: 'bold', color: '#000000ff' }}>{diary.userName}</span>
            </div>

            <div className="card-content">
              <h3 style={{ fontSize: '1.1em', margin: '5px 0' }}>{diary.title}</h3>
              <p>{diary.content}</p>

              {diary.mediaUrl && (
                <div style={{ margin: '15px 0' }}>
                  <MediaRenderer mediaUrl={diary.mediaUrl} />
                </div>
              )}
            </div>

            <div className="card-footer" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '10px',
              borderTop: '1px solid #eee',
              paddingTop: '10px'
            }}>
              <p style={{ fontSize: '0.8em', color: '#657786' }}>
                投稿日時: {diary.timestamp.toDate().toLocaleString()}
              </p>

              <div>
                <a href={`tel:${diary.uid}`} style={{ textDecoration: 'none', fontSize: '1.2em', marginRight: '10px' }}>📞</a>
                <button
                  onClick={handleShare}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}
                >
                  🔗
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  );
}
