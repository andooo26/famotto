'use client';

import { useState } from 'react';
import Image from 'next/image';
import DiaryForm from '../../components/diaryForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
export default function DiaryPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);


    return (
        <div>
            <Header />

            <main style={{ padding: 20 }}>
                <h1>日記追加</h1>
                <DiaryForm />
            </main>

            <Footer />
        </div>
    );
}
