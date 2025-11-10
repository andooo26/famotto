
'use client';

import { db } from '@/lib/firebase';
import { onSnapshot, doc } from 'firebase/firestore';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ThemePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [entries, setEntries] = useState([]);
    const [theme, setTheme] = useState<string>("");

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [loading, user, router]);

    useEffect(() => {
        const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const unsub = onSnapshot(doc(db, "todays-theme", yyyymmdd), (snap) => {
            if (snap.exists()) {
                setTheme(snap.data().text);
            } else {
                setTheme("error");
            }
        });
        return () => unsub();
    }, []);
    return (
        <div>

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
                    <a href='./..'><span>Famotto</span></a>
                </header>
                
                {/* カード */}
                <main className="content">
                    <div className="card">
                        <div className="card-header">
                            <h1 className="card-title">今日のお題は...</h1>
                            <p className="card-subtitle">{theme}</p>
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
        </div>

    );
}