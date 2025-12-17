
'use client';

import { db } from '@/lib/firebase';
import { onSnapshot, doc } from 'firebase/firestore';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
            <Header />
            
            {/* カード */}
            <main className="content">
                <div className="card">
                    <div className="card-header">
                        <h1 className="card-title">今日のお題は...</h1>
                        <p className="card-subtitle">{theme}</p>
                        <a href="./diary" className="card-add">今日のお題で日記を作成</a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}