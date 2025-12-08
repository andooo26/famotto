'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

// 一意のID生成
const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return timestamp + randomPart;
};

// ▼ 追加：音声認識
const SpeechRecognition =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export default function DiaryForm() {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);


  // ▼ 追加：音声認識 状態
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ▼ 音声認識セットアップ
  const startSpeechRecognition = () => {
    if (!SpeechRecognition) {
      alert("このブラウザは音声入力に対応していません");
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

  /** Storageへのアップロード */
  const uploadFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setIsUploading(true);

      const user = auth.currentUser;
      const fileExtension = file.name.split('.').pop();
      const uniqueId = generateUniqueId();
      const fileName = `${user?.uid}/${uniqueId}.${fileExtension}`;
      const storageRef = ref(storage, `diary_media/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        () => { },
        () => {
          setIsUploading(false);
          reject('ファイルアップロードに失敗しました');
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              setIsUploading(false);
              resolve(downloadURL);
            })
            .catch(() => {
              setIsUploading(false);
              reject('ダウンロードURL取得失敗');
            });
        }
      );
    });
  };

  /** 日記投稿 */
  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return alert('ログインしてください');

    if (!content.trim()) {
      alert('内容を入力してください');
      return;
    }
    if (isUploading) return alert('アップロード中です…');

    let mediaUrl: string | null = null;

    try {
      if (file) mediaUrl = await uploadFile(file);

      const docRef = await addDoc(collection(db, 'diary'), {
        content,
        mediaUrl,
        uid: user.uid,
        timestamp: serverTimestamp(),
      });

      alert('日記を追加しました: ' + docRef.id);

      setContent('');
      setFile(null);
    } catch (e) {
      alert('書き込みに失敗しました');
    }
  };

  /** ファイル選択 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };



  return (
    <main className="">
      <div className="m-10 bg-white rounded-xl shadow-2xl p-5 max-h-[calc(100vh-4rem)] overflow-y-auto">

        {/* 内容 */}
        <div className="flex mb-5">
          <p className="text-2xl mr-3">内容：</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="text-2xl border p-2 rounded w-full h-40"
            placeholder="日記の内容を入力..."
          />
        </div>

        {/* 選択されたファイル */}
        {file && (
          <p className="text-xl mb-3 text-blue-700">
            選択中のファイル：{file.name}
          </p>
        )}

        {/* 非表示の file input（ボタンから開く） */}
        <input
          type="file"
          accept="image/*,video/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          hidden
        />

        {/* アップロード中 */}
        {isUploading && <p className="text-red-500 mb-3">アップロード中…</p>}
        {/* ▼ プレビュー（固定枠・スクロール） */}
        {file && (
          <div className="mt-4 w-full flex justify-center">
            <div className="max-h-40 overflow-y-auto p-2 border rounded-lg bg-gray-50">
              {file.type.startsWith('image/') && (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="max-w-full h-auto rounded"
                />
              )}

              {file.type.startsWith('video/') && (
                <video
                  src={URL.createObjectURL(file)}
                  controls
                  className="w-60 rounded"
                />
              )}
            </div>
          </div>
        )}

        <div className="flex justify-evenly fixed bottom-24 left-0 w-full px-10 bg-white z-10">
          {/* ボタン3つ */}
          <div className="flex justify-evenly">
            {/* 画像/動画追加 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              disabled={isRecording}
            >
              <div className="flex flex-col items-center">
                <Image src="/upload.jpg" alt="" width={50} height={60} />
                <span>動画/画像を追加</span>
              </div>
            </button>

            {/* 声で入力（音声認識） */}
            <button
              type="button"
              onClick={() => {
                if (isRecording) {
                  stopSpeechRecognition();
                } else {
                  startSpeechRecognition();
                }
              }}
            >
              <div className="flex flex-col items-center">
                <Image src="/mic.png" alt="" width={50} height={60} />
                <span>{isRecording ? "録音停止" : "声で入力"}</span>
              </div>
            </button>

            {/* 録音中の表示 */}
            {isRecording && (
              <p className="text-red-600 text-center mt-2">録音中…</p>
            )}

            {/* 投稿 */}
            <button
              onClick={handleSubmit}
              type="button"
              disabled={isRecording}>

              <div className="flex flex-col items-center">
                <Image src="/check.png" alt="" width={50} height={60} />
                <span>日記を投稿</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
