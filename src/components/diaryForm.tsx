'use client';
import { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function DiaryForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert('ログインしてください');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'diary'), {
        title,
        content,
        uid: user.uid,
        timestamp: serverTimestamp()
      });
      alert('日記を追加しました: ' + docRef.id);
      setTitle('');
      setContent('');
    } catch (err) {
      console.error(err);
      alert('書き込みに失敗しました');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="タイトル" required />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="本文" required />
      <button type="submit">追加</button>
    </form>
  );
}
