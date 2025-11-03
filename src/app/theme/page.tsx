'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ThemePage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    return (
        <div>
            <h1>Theme Page</h1>
        </div>

            );
}