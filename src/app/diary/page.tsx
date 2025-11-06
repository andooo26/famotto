'use client';

import { useState } from 'react';
import Image from 'next/image';
import DiaryForm from '../../components/diaryForm';
export default function DiaryPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    


    return (
        <div>
            {/* ヘッダー */}
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
                <a href="./..">
                    <span>Famotto</span>
                </a>
            </header>

            {/* メイン（日記追加フォーム） */}
            <main style={{ padding: 20 }}>
                <h1>日記を追加</h1>
                <DiaryForm />
            </main>

            {/* フッター */}
            <footer className="footer">
                <a href="./diary">
                    <Image src="/add.png" alt="" width={60} height={60} />
                    <span>日記追加</span>
                </a>
                <a href="./theme">
                    <Image src="/theme.png" alt="" width={60} height={60} />
                    <span>今日のお題</span>
                </a>
                <a href="./menu">
                    <Image src="/menu.png" alt="" width={60} height={60} />
                    <span>日記確認</span>
                </a>
            </footer>
        </div>
    );
}
