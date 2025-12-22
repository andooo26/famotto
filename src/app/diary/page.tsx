'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';
import DiaryForm from '../../components/diaryForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DiaryPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <Header title="日記追加" showLogout={true} onLogout={handleSignOut} />

            <main className="main-content" style={{ padding: 20 }}>
                <DiaryForm />
            </main>

            <Footer />
        </div>
    );
}
