'use client';
import { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Firebase Storageの初期化
const storage = getStorage();

const generateUniqueId = (): string => {
  // 現在のタイムスタンプ（ミリ秒）とランダムな数値を組み合わせる
  const timestamp = Date.now().toString(36);//今の時刻を36進数に変換→timestampへ
  const randomPart = Math.random().toString(36).substring(2, 8);//ランダムな部分を生成
  return timestamp + randomPart;//両方を結合して一意のIDを生成
};
// --- メインコンポーネント ---
export default function DiaryForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null); // 選択されたファイル
  // const [uploadProgress, setUploadProgress] = useState(0); // ★ コメントアウト
  const [isUploading, setIsUploading] = useState(false); // アップロード中かどうか

  /** 1. Storageへのファイルアップロード処理*/
  const uploadFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setIsUploading(true); // ★ アップロード開始フラグは維持

      // ファイル名の一意化 (ユーザーIDとユニークなIDを使用)
      const user = auth.currentUser;
      // ファイル拡張子の取得
      const fileExtension = file.name.split('.').pop();

      // generateUniqueId() を使用
      const uniqueId = generateUniqueId();
      // ファイル名の生成
      const fileName = `${user?.uid}/${uniqueId}.${fileExtension}`;
      // Storage参照の作成
      const storageRef = ref(storage, `diary_media/${fileName}`);
      // アップロードタスクの開始
      const uploadTask = uploadBytesResumable(storageRef, file);

      // 進捗、エラー、完了時の処理を設定
      uploadTask.on('state_changed',
        (snapshot) => {
          
        },
        (error) => {
          // エラー処理
          setIsUploading(false);
          console.error("アップロードエラー:", error);
          reject('ファイルアップロードに失敗しました');
        },
        () => {
          // 完了処理 (ダウンロードURLの取得)
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              setIsUploading(false); // ★ 完了時にフラグを解除
              resolve(downloadURL);
            })
            .catch((error) => {
              setIsUploading(false);
              console.error("URL取得エラー:", error);
              reject('ダウンロードURLの取得に失敗しました');
            });
        }
      );
    });
  };

  /**2.フォーム送信処理 (ファイルアップロードとFirestore保存を含む)**/
  const handleSubmit = async (e: React.FormEvent) => {e.preventDefault();
    const user = auth.currentUser;//Firebase Authenticationの現在のユーザー取得
    // ユーザーがログインしていない場合は処理を中断
    if (!user) {
      alert('ログインしてください');
      return;
    }
    // タイトルと本文のバリデーション
    if (!title.trim() || !content.trim()) {
      alert('タイトルと本文を入力してください');
      return;
    }
    // 既にアップロード中の場合は処理を中断
    if (isUploading) {
      alert('ファイルアップロード中です。しばらくお待ちください。');
      return;
    }
    // ファイルアップロードとFirestore保存
    let mediaUrl: string | null = null;

     // ファイルが選択されていればアップロードを実行
    try {
      if (file) {
        mediaUrl = await uploadFile(file);
      }

      // Firestoreに日記データを保存
      const docRef = await addDoc(collection(db, 'diary'), {
        title,
        content,
        // mediaUrl があれば保存
        mediaUrl: mediaUrl,
        uid: user.uid,
        timestamp: serverTimestamp()
      });

      alert('日記を追加しました: ' + docRef.id);
      // フォームのリセット
      setTitle('');
      setContent('');
      // ファイル選択をリセット
      setFile(null); 
    } catch (err) {
      console.error(err);
      alert('書き込みに失敗しました');
    }
  };

  /** 3.ファイル選択時の処理 **/
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {//ファイルが選択された場合
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

// --- JSX部分 ---
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="タイトル"
        required
      />
      <br />
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="本文"
        required
      />
      <br />

      {/* ファイル選択インプットの追加 */}
      <input
        type="file"
        accept="image/*,video/*" // 画像と動画のみを受け付ける
        onChange={handleFileChange}
      />

      {/* 選択されたファイル名の表示 */}
      {file && <p>選択中のファイル: **{file.name}**</p>}

      {/* アップロード進捗の表示 (アップロード中の場合のみ) */}
      {isUploading && (
        <div>
          <p>アップロード中...</p> 
        </div>
      )}
    {/* --- 送信ボタン --- */}
      <button type="submit" disabled={isUploading || !title.trim() || !content.trim()}> {/*アップロード中または入力不備時は無効化*/}
        {isUploading ? 'アップロード中...' : '追加'}
      </button>
    </form>
  );
}