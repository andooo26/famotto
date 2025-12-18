'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

// 一意のID生成
const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return timestamp + randomPart;
};

//音声認識
const SpeechRecognition =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

//コンポーネント
export default function DiaryForm() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startSpeechRecognition = () => {
    if (!SpeechRecognition) {
      alert("音声入力非対応");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = "ja-JP";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setContent(prev => prev + text);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    recognitionRef.current.start();
    setIsRecording(true);
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  // input type="file" を非表示にしてボタンで開く
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* Storageへのアップロード */
  const uploadFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setIsUploading(true);

      const user = auth.currentUser;
      const fileExtension = file.name.split('.').pop();
      const uniqueId = generateUniqueId();
      const fileName = `${user?.uid}/${uniqueId}.${fileExtension}`;
      const storageRef = ref(storage, `diary_media/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      // アップロードの進行状況を確認
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // 進捗率を計算
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        () => {
          setIsUploading(false);
          setUploadProgress(0);
          reject('ファイルアップロードに失敗しました');
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              setIsUploading(false);
              setUploadProgress(0);
              resolve(downloadURL);
            })
            .catch(() => {
              setIsUploading(false);
              setUploadProgress(0);
              reject('ダウンロードURL取得失敗');
            });
        }
      );
    });
  };

  /* 日記投稿 */
  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return alert('ログインしてください');

    if (!content.trim()) {
      alert('内容を入力してください');
      return;
    }
    if (isUploading) return alert('アップロード中');

    let mediaUrl: string | null = null;

    try {
      // ユーザーのgroupIdを取得
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data() as { groupId?: string } | undefined;
      const groupId = userData?.groupId;

      if (file) mediaUrl = await uploadFile(file);

      await addDoc(collection(db, 'diary'), {
        content,
        mediaUrl,
        uid: user.uid,
        groupId: groupId || null,
        timestamp: serverTimestamp(),
      });

      // トーストを表示
      setShowToast(true);
      
      // トースト表示後、少し遅延してからルートディレクトリに遷移
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (e) {
      alert('書き込みに失敗しました');
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

  /* ファイル選択 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };



  return (
    <main className="">
      {showToast && (
        <div 
          className="fixed top-20 left-1/2 z-50 px-6 py-3 rounded-full shadow-lg animate-fade-in"
          style={{
            backgroundColor: '#fcdf98',
            color: '#444',
            fontWeight: 'bold',
            transform: 'translateX(-50%)',
          }}
        >
          投稿完了
        </div>
      )}
      <div className="m-10 bg-white rounded-xl shadow-2xl p-5 max-h-[calc(100vh-4rem)] overflow-y-auto relative">

       {/* 内容 */}
<div className="mb-6">
  <label className="block text-2xl font-bold mb-2">内容</label>

  <textarea
    value={content}
   onChange={(e) => {
    const v = e.target.value;
    //15文字制限
    if (v.length <= 15) {
      setContent(v);
    }
  }}
    className="
      text-xl 
      border 
      border-gray-300
      p-3 
      rounded-xl 
      w-full 
      min-h-[120px]
      resize-y
      focus:outline-none 
      focus:ring-2 
      focus:ring-blue-400 
      shadow-sm 
      transition
    "
    placeholder="日記の内容を入力"
  />
  <div className="text-right text-gray-500 text-sm mt-1">
  {content.length}/15
</div>
</div>

        {/* file input（非表示） */}
        <input
          type="file"
          accept="image/*,video/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          hidden
        />

        {/* アップロード中のプログレスバー */}
        {isUploading && (
          <div className="mb-3 w-full">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${uploadProgress}%`,
                  backgroundColor: '#fcdf98'
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1 text-center">{Math.round(uploadProgress)}%</p>
          </div>
        )}

        {/* 選択されたファイルとプレビュー */}
        {file && (
          <div className="mb-6">
            <p className="text-xl mb-3 text-gray-700">
              選択中のファイル：{file.name}
            </p>
            {/*プレビュー*/}
            <div className="w-full flex justify-center">
              <div className="max-h-48 max-w-full overflow-auto p-2 border rounded-lg bg-gray-50">
              {file.type.startsWith('image/') && (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                    className="max-w-full max-h-44 h-auto rounded object-contain"
                />
              )}

              {file.type.startsWith('video/') && (
                <video
                  src={URL.createObjectURL(file)}
                  controls
                    className="max-w-full max-h-44 rounded"
                />
              )}
              </div>
            </div>
          </div>
        )}

        {/* ボタン3つ - 右下に配置 */}
        <div className="flex justify-end gap-4 mt-6 pb-4">
            {/* 画像・動画追加 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              disabled={isRecording}
            className="flex flex-col items-center"
            >
                <Image src="/upload.jpg" alt="" width={50} height={60} />
            <span>動画/画像</span>
            </button>

            {/* 音声認識*/}
            <button
              type="button"
              onClick={() => {
                if (isRecording) {
                  stopSpeechRecognition();
                } else {
                  startSpeechRecognition();
                }
              }}
            className="flex flex-col items-center"
            >
                <Image src="/mic.png" alt="" width={50} height={60} />
            <span>{isRecording ? "録音停止" : "音声入力"}</span>
            </button>

            {/* 投稿 */}
            <button
              onClick={handleSubmit}
              type="button"
            disabled={isRecording}
            className="flex flex-col items-center"
          >
                <Image src="/check.png" alt="" width={50} height={60} />
                <span>投稿</span>
          </button>
              </div>

        {/* 録音中表示 */}
        {isRecording && (
          <div className="absolute bottom-2 right-2">
            <p className="text-red-600 text-sm">録音中…</p>
          </div>
        )}
      </div>
    </main>
  );
}
