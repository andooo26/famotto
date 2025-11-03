'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MenuPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    return (
        <div>
            <h1>Menu Page</h1>
        </div>

            );
}