'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestoreUtils } from '@/lib/firebaseUtils';
import { signOut } from '@/lib/auth';
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
  userPhoneNumber?: string;
}

// メディア表示コンポーネント
const MediaRenderer: React.FC<{ mediaUrl: string }> = ({ mediaUrl }) => {
  if (!mediaUrl) return null;

  if (/.(jpe?g|png|gif|webp)/i.test(mediaUrl)) {
    return <img src={mediaUrl} alt="添付画像" style={{ objectFit: 'contain', maxWidth: '70%', maxHeight: '400px', margin: '0 auto', display: 'block' }} />;
  }

  if (/.(mp4|mov|webm)/i.test(mediaUrl)) {
    return <video src={mediaUrl} controls style={{ maxWidth: '70%', maxHeight: '400px', margin: '0 auto', display: 'block' }} />;
  }

  return null;
};

// メインコンポーネント
export default function MenuUserPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const [diaries, setDiaries] = useState<DiaryWithUser[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [diaryToDelete, setDiaryToDelete] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [targetUserName, setTargetUserName] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !userId) return;

    const fetchDiariesWithUser = async () => {
      setDataLoading(true);
      try {
        // 現在のユーザーのgroupIdを取得
        const currentUserDoc = await getDoc(doc(db, "users", user.uid));
        const currentUserData = currentUserDoc.data() as any;
        const currentGroupId = currentUserData?.groupId;

        if (!currentGroupId) {
          console.warn('ユーザーのgroupIdが設定されていません');
          setDiaries([]);
          setDataLoading(false);
          return;
        }

        // 対象ユーザーの情報を取得
        const targetUserDoc = await getDoc(doc(db, "users", userId));
        const targetUserData = targetUserDoc.data() as any;
        
        if (!targetUserData || targetUserData.groupId !== currentGroupId) {
          console.warn('指定されたユーザーが見つからないか、同じグループに属していません');
          setDiaries([]);
          setDataLoading(false);
          return;
        }

        setTargetUserName(targetUserData.name || "不明なユーザー");

        // ユーザー情報を一括取得（同じgroupIdのユーザーのみ）
        const usersSnap = await getDocs(collection(db, "users"));
        const userMap: Record<string, { name: string; iconUrl: string; phoneNumber?: string; groupId?: string }> = {};

        usersSnap.forEach((u) => {
          const data = u.data() as any;
          if (data.groupId === currentGroupId) {
            userMap[u.id] = {
              name: data.name || "不明なユーザ",
              iconUrl: data.iconUrl || "",
              phoneNumber: data.phoneNumber || "",
              groupId: data.groupId,
            };
          }
        });

        // 日記を一括取得（指定されたユーザーのみ）
        const q = query(collection(db, "diary"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        // ユーザー情報を結合（指定されたユーザーの投稿のみ）
        const diariesWithUser: DiaryWithUser[] = [];
        snapshot.docs.forEach(docSnap => {
          const data = docSnap.data() as DiaryEntry;
          // 指定されたユーザーの投稿のみを追加
          if (data.uid !== userId) return;
          
          const userData = userMap[data.uid];
          if (!userData) return;

          diariesWithUser.push({
            ...data,
            id: docSnap.id,
            userName: userData.name,
            userIconUrl: userData.iconUrl,
            userPhoneNumber: userData.phoneNumber,
          });
        });

        setDiaries(diariesWithUser);
      } catch (err) {
        console.error("日記取得失敗:", err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDiariesWithUser();
  }, [user, userId]);

  // 共有機能（投稿者の日記確認ページへのリンクを生成）
  const handleShare = (diaryUid: string) => {
    const shareUrl = `${window.location.origin}/menu?userId=${diaryUid}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Famotto',
        url: shareUrl,
      });
    } else {
      // フォールバック: クリップボードにコピー
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('リンクをコピーしました: ' + shareUrl);
      }).catch(() => {
        alert('このブラウザは共有機能に対応していません');
      });
    }
  };

  // 削除確認モーダルを開く
  const openDeleteModal = (diaryId: string) => {
    setDiaryToDelete(diaryId);
    setDeleteModalOpen(true);
  };

  // 削除確認モーダルを閉じる
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDiaryToDelete(null);
  };

  // 投稿削除処理
  const handleDelete = async () => {
    if (!user || !diaryToDelete) return;

    try {
      await firestoreUtils.deleteDocument('diary', diaryToDelete);
      // 日記リストから削除
      setDiaries(prevDiaries => prevDiaries.filter(diary => diary.id !== diaryToDelete));
      closeDeleteModal();
      // トーストを表示
      setShowToast(true);
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  // トーストを3秒後に非表示にする
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !user) {
    return (
      <div>
        <Header title="日記確認" showLogout={true} onLogout={handleSignOut} />
        <main className="diary-card">
        </main>
        <Footer />
      </div>
    );
  }

  // JSXのレンダリング
  return (
    <div>
      {/* 削除完了トースト */}
      {showToast && (
        <div 
          className="fixed top-20 left-1/2 px-6 py-3 rounded-full shadow-lg animate-fade-in toast-message"
          style={{
            backgroundColor: '#fcdf98',
            color: '#444',
            fontWeight: 'bold',
            transform: 'translateX(-50%)',
            zIndex: 1001,
            whiteSpace: 'nowrap',
          }}
        >
          削除完了
        </div>
      )}

      {/* 削除確認モーダル */}
      {deleteModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={closeDeleteModal}
        >
          <div 
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '320px',
              width: '85%',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              animation: 'modal-fade-in 0.3s ease-out',
              animationFillMode: 'both'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
              投稿を削除しますか？
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={closeDeleteModal}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  flex: 1
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#e74c3c',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  flex: 1
                }}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      <Header title={`${targetUserName}の日記`} showLogout={true} onLogout={handleSignOut} />

      <main className="diary-card">
        {dataLoading && (
          <p style={{ textAlign: 'center' }}>読み込み中...</p>
        )}

        {!dataLoading && diaries.length === 0 && (
          <p style={{ textAlign: 'center' }}>投稿がありません</p>
        )}

        {/*日記リストの表示*/}
        {diaries.map((diary) => (
          <div key={diary.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
            <div className="card-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '10px' }}>
              <img
                src={diary.userIconUrl}
                alt={diary.userName}
                style={{ width: 32, height: 32, marginRight: 8, borderRadius: '50%', order: 1, objectFit: 'cover' }}
              />
              <span style={{ fontWeight: 'bold', color: '#fcdf98', fontSize: '1.3em', order: 2 }}>{diary.userName}</span>
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
                {user && diary.uid === user.uid && (
                  <button 
                    onClick={() => openDeleteModal(diary.id)} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontSize: '1.2em', 
                      marginRight: '10px',
                      color: '#e74c3c'
                    }}
                  >
                    🗑️
                  </button>
                )}
                {user && diary.uid !== user.uid && diary.userPhoneNumber ? (
                  <a href={`tel:${diary.userPhoneNumber}`} style={{ textDecoration: 'none', fontSize: '1.2em', marginRight: '10px' }}>📞</a>
                ) : user && diary.uid !== user.uid && !diary.userPhoneNumber ? (
                  <span style={{ fontSize: '1.2em', marginRight: '10px', opacity: 0.3, cursor: 'not-allowed' }}>📞</span>
                ) : null}
                <button
                  onClick={() => handleShare(diary.uid)}
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

